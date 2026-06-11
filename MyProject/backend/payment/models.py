from django.db import models
from django.contrib.auth import get_user_model
from order.models import Order

User = get_user_model()

class Payment(models.Model):
    """
    Stores payment information for each order.
    Created when user initiates payment.
    Updated when payment is verified.
    """

    STATUS_CHOICES = [
        ('initiated','Initiated'),
        ('completed',  'Completed'),   
        ('failed',     'Failed'),    
        ('refunded',   'Refunded'),  

    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment'

    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    # khalti specific fields
    pidx        = models.CharField(
                      max_length=200,
                      blank=True,
                      null=True,
                      help_text="Khalti payment index"
                  )
    amount      = models.DecimalField(
                      max_digits=10,
                      decimal_places=2
                  )
    status      = models.CharField(
                      max_length=20,
                      choices=STATUS_CHOICES,
                      default='initiated'
                  )
    # full response from Khalti stored as text
    khalti_response = models.JSONField(
                          blank=True,
                          null=True
                      )
    
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} — {self.status}"
