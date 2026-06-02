from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['name', 'price', 'stock', 'tag', 'created_at']
    search_fields = ['name', 'tag']
    list_filter   = ['tag']
