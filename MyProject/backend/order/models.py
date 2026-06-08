from django.db import models
from django.contrib.auth import get_user_model
from store.models import Product

User= get_user_model()

class Order(models.Model):
    """
    Created when user place order from cart
    """

   
    STATUS_CHOICES = [
        ('pending',   'Pending'),    
        ('confirmed', 'Confirmed'),  
        ('shipped',   'Shipped'),    
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),  
    ]

    PAYMENT_CHOICES = [
        ('cod',    'Cash on Delivery'),
        ('khalti', 'Khalti'),
        ('esewa',  'eSewa'),
    ]

    user = models.ForeignKey(
            User,
            on_delete=models.CASCADE,
            related_name='orders'  
            )
    status  = models.CharField(
                max_length=20,
                choices=STATUS_CHOICES,
                default='pending'
                 )
    total_price  = models.DecimalField(
                max_digits=10,
                decimal_places=2,
                default=0
                )
    delivery_fee = models.DecimalField(
                max_digits=6,
                decimal_places=2,
                default=0
                 )
    grand_total = models.DecimalField(
                max_digits=10,
                decimal_places=2,
                default=0
                )
    
    # Delivery info
    full_name      = models.CharField(max_length=200)
    phone          = models.CharField(max_length=15)
    address        = models.TextField()
    city           = models.CharField(max_length=100)

    # Payment
    payment_method = models.CharField(
                         max_length=20,
                         choices=PAYMENT_CHOICES,
                         default='cod'
                        
                     )
    is_paid        = models.BooleanField(default=False)
    paid_at        = models.DateTimeField(null=True, blank=True)

    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)


    class Meta:
        # newest orders shown first
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.user.email} — {self.status}"


class OrderItem(models.Model):
    """
    Each product inside an order.
    We save the price at time of order because
    product price may change later.
    """
    order    = models.ForeignKey(
                   Order,
                   on_delete=models.CASCADE,
                   related_name='items'
               )
    product  = models.ForeignKey(
                   Product,
                   on_delete=models.SET_NULL,
                   null=True
               )

    # Save product details at time of order because product might be deleted later
    product_name  = models.CharField(max_length=200)
    product_image = models.ImageField(
                        upload_to='products/',
                        blank=True, null=True
                    )
    price         = models.DecimalField(max_digits=10, decimal_places=2)
    quantity      = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"

    # Subtotal for this item
    def get_subtotal(self):
        return self.price * self.quantity