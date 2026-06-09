from rest_framework import serializers
from.models import Order,OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_image',
            'price',
            'quantity',
            'subtotal',
        ]

    def get_subtotal(self, obj):
        return float(obj.get_subtotal())
        

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True,read_only=True)
    status_label = serializers.CharField(
                       source='get_status_display',
                       read_only=True
                   )
    

    class Meta:
        model  = Order
        fields = [
            'id',
            'status',
            'status_label',
            'total_price',
            'delivery_fee',
            'grand_total',
            'full_name',
            'phone',
            'address',
            'city',
            'payment_method',
            'is_paid',
            'paid_at',
            'items',
            'created_at',
        ]
        read_only_fields = [
            'id', 'status', 'total_price',
            'delivery_fee', 'grand_total',
            'is_paid', 'paid_at', 'created_at'
        ]


#  what React sends when placing order
class PlaceOrderSerializer(serializers.Serializer):
    full_name      = serializers.CharField(max_length=200)
    phone          = serializers.CharField(max_length=15)
    address        = serializers.CharField()
    city           = serializers.CharField(max_length=100)
    payment_method = serializers.ChoiceField(
                         choices=['cod', 'khalti', 'esewa'],
                         default='cod'
                     )

        
