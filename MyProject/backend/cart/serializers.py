from rest_framework import serializers
from .models import Cart,CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source = 'product.name',
        read_only= True
    )
    product_image = serializers.CharField(
        source = 'product.image',
        read_only = True
    )
    product_price = serializers.DecimalField(
                        source='product.price',
                        max_digits=10,
                        decimal_places=2,
                        read_only=True
                    )
    
    product_stock = serializers.IntegerField(
                        source='product.stock',
                        read_only=True
                    )
    
     # SerializerMethodField lets us call a custom method
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model  = CartItem
        fields = [
            'id',
            'product',       
            'product_name',   
            'product_image',  
            'product_price',  
            'product_stock',  
            'quantity',       
            'subtotal',       
            'added_at',
        ]
        read_only_fields = ['id', 'added_at']


         # This method calculates subtotal and returns it as a float
    def get_subtotal(self, obj):
        return float(obj.get_subtotal())
    

class CartSerializer(serializers.ModelSerializer):
    """
    Converts full Cart to JSON including all items inside.
    """
  
    items      = CartItemSerializer(many=True, read_only=True)
    total      = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()



    class Meta:
        model  = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']

    def get_total(self, obj):
        return float(obj.get_total())

    def get_item_count(self, obj):
        return obj.get_item_count()
    


    

    
    
    

