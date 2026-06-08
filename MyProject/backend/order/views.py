from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Order, OrderItem
from .serializers import OrderSerializer, PlaceOrderSerializer
from cart.models import Cart


class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        #  Validate delivery info sent from React
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        #  Get users cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Checking cart is not empty
        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response(
                {"error": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Checking all products are still in stock
        for cart_item in cart_items:
            if cart_item.product.stock < cart_item.quantity:
                return Response(
                    {
                        "error": f"Sorry! '{cart_item.product.name}' "
                                 f"only has {cart_item.product.stock} left in stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

      
        # total price of all cart items
        total_price  = float(cart.get_total())

        # free delivery above Rs.500
        delivery_fee = 0 if total_price >= 500 else 50

        # grand total = items + delivery
        grand_total  = total_price + delivery_fee

        #  Creating the Order
        data = serializer.validated_data
        order = Order.objects.create(
            user           = request.user,
            full_name      = data['full_name'],
            phone          = data['phone'],
            address        = data['address'],
            city           = data['city'],
            payment_method = data['payment_method'],
            total_price    = total_price,
            delivery_fee   = delivery_fee,
            grand_total    = grand_total,
            is_paid        = False,
        )

        #  Creating OrderItems from CartItems and reducing product stock
        for cart_item in cart_items:
           
            OrderItem.objects.create(
                order         = order,
                product       = cart_item.product,
                product_name  = cart_item.product.name,
                product_image = cart_item.product.image,
                price         = cart_item.product.price,
                quantity      = cart_item.quantity,
            )

            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()

        # Clear the cart after order placed
        cart_items.delete()

    
        return Response({
            "message": "Order placed successfully! ",
            "order":   OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all orders for logged in user
        orders = Order.objects.filter(
            user=request.user
        ).prefetch_related('items')

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


# Single Order Detail 
class OrderDetailView(APIView):
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

        serializer = OrderSerializer(order)
        return Response(serializer.data)


#  Cancel Order 
class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
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

       
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {"error": f"Cannot cancel order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.status = 'cancelled'
        order.save()

        return Response({
            "message": "Order cancelled successfully.",
            "order":   OrderSerializer(order).data
        })