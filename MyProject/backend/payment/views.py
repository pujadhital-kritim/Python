import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer
from order.models import Order


#  Initiate Payment
# React calls this first to get Khalti payment URL
class InitiateKhaltiPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')

        # Get the order
        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check order is not already paid
        if order.is_paid:
            return Response(
                {"error": "Order is already paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check order is not cancelled
        if order.status == 'cancelled':
            return Response(
                {"error": "Cannot pay for cancelled order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Khalti needs amount in PAISA (1 Rs = 100 paisa)
        amount_in_paisa = int(float(order.grand_total) * 100)

        # Prepare data to send to Khalti
        payload = {
            "return_url": f"{settings.FRONTEND_URL}/payment/verify/",
            "website_url": settings.FRONTEND_URL,
            "amount": amount_in_paisa,
            "purchase_order_id": str(order.id),
            "purchase_order_name": f"HaatBazaar Order #{order.id}",
            "customer_info": {
                "name":  order.full_name,
                "email": request.user.email,
                "phone": order.phone,
            },
        }

        # Call Khalti API to initiate payment
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type":  "application/json",
        }

        try:
            khalti_response = requests.post(
                settings.KHALTI_INITIATE_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            khalti_data = khalti_response.json()
        except requests.exceptions.RequestException:
            return Response(
                {"error": "Failed to connect to Khalti. Try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Check if Khalti returned error
        if khalti_response.status_code != 200:
            return Response(
                {
                    "error": "Khalti initiation failed.",
                    "detail": khalti_data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save payment record in our database
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'user':   request.user,
                'amount': order.grand_total,
                'pidx':   khalti_data.get('pidx'),
                'status': 'initiated',
            }
        )

        #  payment already existed update pidx
        if not created:
            payment.pidx   = khalti_data.get('pidx')
            payment.status = 'initiated'
            payment.save()

        # Returns Khalti payment URL to React it will redirect user to this URL
        return Response({
            "payment_url": khalti_data.get('payment_url'),
            "pidx":        khalti_data.get('pidx'),
            "order_id":    order.id,
        })


#  Verify Payment
# After user pays on Khalti, they come back to our site React sends pidx to this endpoint to verify
class VerifyKhaltiPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pidx = request.data.get('pidx')

        if not pidx:
            return Response(
                {"error": "pidx is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find payment record using pidx
        try:
            payment = Payment.objects.get(pidx=pidx)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.user != request.user:
            return Response(
                {"error": "Unauthorized."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify with Khalti server
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type":  "application/json",
        }

        try:
            verify_response = requests.post(
                settings.KHALTI_VERIFY_URL,
                json={"pidx": pidx},
                headers=headers,
                timeout=30
            )
            verify_data = verify_response.json()
        except requests.exceptions.RequestException:
            return Response(
                {"error": "Failed to verify with Khalti."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Check payment status from Khalti
        # Khalti returns status as "Completed" when paid
        khalti_status = verify_data.get('status')

        if khalti_status == 'Completed':
            #  Payment successful!

            # Update payment record
            payment.status          = 'completed'
            payment.khalti_response = verify_data
            payment.save()

            # Update order
            order          = payment.order
            order.is_paid  = True
            order.status   = 'confirmed'
            order.save()

            return Response({
                "success": True,
                "message": "Payment verified successfully! 🎉",
                "order_id": order.id,
                "payment_status": "completed",
            })

        else:
            #  Payment not completed

            # Update payment status
            payment.status          = 'failed'
            payment.khalti_response = verify_data
            payment.save()

            return Response({
                "success": False,
                "message": f"Payment not completed. Status: {khalti_status}",
                "payment_status": khalti_status,
            }, status=status.HTTP_400_BAD_REQUEST)


#  Get Payment Status
class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            payment = Payment.objects.get(order=order)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response(
                {"error": "No payment found for this order."},
                status=status.HTTP_404_NOT_FOUND
            )