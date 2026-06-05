from django.db import models
from django.contrib.auth import get_user_model
from store.models import Product


User = get_user_model()

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at= models.DateTimeField(auto_now=True)



    def __str__(self):
        return f"Cart of {self.user.email}"
    
    # Total price of all items in cart
    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    
     # Total number of items in cart
    def get_item_count(self):
        return sum(item.quantity for item in self.items.all())
    

class CartItem(models.Model):
   
    cart       = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity   = models.PositiveIntegerField(default=1)
    added_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    def get_subtotal(self):
        return self.product.price * self.quantity

    class Meta:
        # same product cannot be added twice to same cart
        unique_together = ('cart', 'product')
    



