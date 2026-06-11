from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id',read_only=True)
    order_total=serializers.DecimalField(
        source = 'order.grand_total',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Payment
        fields=[
            'id',
            'order_id',
            'order_total',
            'pidx',
            'amount',
            'status',
            'created_at',
        ]