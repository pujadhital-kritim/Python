from django.urls import path
from . import views

urlpatterns = [
    # POST /api/orders/place/      
    path('place/',views.PlaceOrderView.as_view(),
         name='place-order'
    ),

    # GET  /api/orders/            
    path('',views.MyOrdersView.as_view(),
        name='my-orders'
    ),

    # GET  /api/orders/<id>/        
    path('<int:order_id>/', views.OrderDetailView.as_view(),
        name='order-detail'
    ),

    # POST /api/orders/<id>/cancel/ 
    path( '<int:order_id>/cancel/', views.CancelOrderView.as_view(),
        name='cancel-order'
    ),
]