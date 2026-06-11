from django.urls import path
from . import views

urlpatterns = [
    # POST /api/payment/initiate/
    path(
        'initiate/',
        views.InitiateKhaltiPaymentView.as_view(),
        name='payment-initiate'
    ),

    # POST /api/payment/verify/
    path(
        'verify/',
        views.VerifyKhaltiPaymentView.as_view(),
        name='payment-verify'
    ),

    # GET /api/payment/status/<order_id>/
    path(
        'status/<int:order_id>/',
        views.PaymentStatusView.as_view(),
        name='payment-status'
    ),
]