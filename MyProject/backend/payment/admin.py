from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = [
        'id', 'order', 'user',
        'amount', 'status', 'created_at'
    ]
    list_filter   = ['status']
    search_fields = ['user__email', 'pidx', 'order__id']
    readonly_fields = [
        'pidx', 'khalti_response',
        'created_at', 'updated_at'
    ]