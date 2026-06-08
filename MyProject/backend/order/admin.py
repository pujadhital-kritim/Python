from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    # don't allow editing order items
    readonly_fields = ['product_name', 'price', 'quantity', 'get_subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = [
        'id', 'user', 'status',
        'grand_total', 'payment_method',
        'is_paid', 'created_at'
    ]
    list_filter   = ['status', 'payment_method', 'is_paid']
    search_fields = ['user__email', 'full_name', 'phone']
    readonly_fields = ['total_price', 'delivery_fee', 'grand_total', 'created_at']
    inlines       = [OrderItemInline]

    # Allow admin to change order status
    actions = ['mark_confirmed', 'mark_shipped', 'mark_delivered']

    def mark_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
    mark_confirmed.short_description = "Mark selected as Confirmed"

    def mark_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_shipped.short_description = "Mark selected as Shipped"

    def mark_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_delivered.short_description = "Mark selected as Delivered"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'quantity', 'price', 'get_subtotal']