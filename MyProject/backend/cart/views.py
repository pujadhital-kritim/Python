from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer
from store.models import Product


# This finds the cart for logged in user
# If they don't have one yet create it automatically
def get_or_create_cart(user):
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


# View Cart 
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)

        # convert cart to JSON and send to React
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


# Add to Cart
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))

        # Step 1: Check if product actually exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        #  Check if enough stock available
        if product.stock < quantity:
            return Response(
                {"error": f"Only {product.stock} items available in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        #  Get or create cart for this user
        cart = get_or_create_cart(request.user)

        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity} 
        )

        if not created:
            new_qty = cart_item.quantity + quantity

            if new_qty > product.stock:
                return Response(
                    {"error": f"Cannot add more. Only {product.stock} in stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_qty
            cart_item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response({
            "message": f"'{product.name}' added to cart!",
            "cart": serializer.data
        })


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        quantity = int(request.data.get('quantity', 1))

       
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity < 1:
            return Response(
                {"error": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > cart_item.product.stock:
            return Response(
                {"error": f"Only {cart_item.product.stock} in stock."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()

        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response({
            "message": "Cart updated!",
            "cart": serializer.data
        })


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user   
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        product_name = cart_item.product.name
        cart_item.delete()  

        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response({
            "message": f"'{product_name}' removed from cart.",
            "cart": serializer.data
        })


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        # Delete ALL items at once
        cart.items.all().delete()
        return Response({"message": "Cart cleared successfully."})