from django.urls import path
from . import views

urlpatterns = [
    path('',
         views.CartView.as_view(),
         name='cart'),

    # POST  add product to cart
    path('add/',
         views.AddToCartView.as_view(),
         name='cart-add'),

    # PUT change quantity
    path('update/<int:item_id>/',
         views.UpdateCartItemView.as_view(),
         name='cart-update'),

    # DELETE remove one item
    path('remove/<int:item_id>/',
         views.RemoveCartItemView.as_view(),
         name='cart-remove'),

    # DELETE empty the whole cart
    path('clear/',
         views.ClearCartView.as_view(),
         name='cart-clear'),
]