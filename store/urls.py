from django.urls import path
from . import views

urlpatterns = [
    # Page URLs
    path('', views.HomeView.as_view(), name='home'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('product/<slug:slug>/', views.ProductDetailView.as_view()),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('orders/<str:order_number>/success/', views.OrderSuccessView.as_view(), name='order-success'),
    path('order-success/<str:order_number>/', views.OrderSuccessView.as_view()),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),

    # REST API URLs
    path('api/categories/', views.CategoryListAPI.as_view(), name='api-categories'),
    path('api/products/', views.ProductListAPI.as_view(), name='api-products'),
    path('api/products/<slug:slug>/', views.ProductDetailAPI.as_view(), name='api-product-detail'),
    path('api/products/featured/', views.FeaturedProductsAPI.as_view(), name='api-featured'),
    path('api/products/trending/', views.TrendingProductsAPI.as_view(), name='api-trending'),
    path('api/products/bestsellers/', views.BestsellerProductsAPI.as_view(), name='api-bestsellers'),
    path('api/cart/', views.CartAPI.as_view(), name='api-cart'),
    path('api/cart/clear/', views.CartAPI.as_view()),
    path('api/checkout/', views.CheckoutAPI.as_view(), name='api-checkout'),
    path('api/orders/', views.OrderListAPI.as_view(), name='api-orders'),
    path('api/orders/<str:order_number>/', views.OrderDetailAPI.as_view(), name='api-order-detail'),
    path('api/reviews/', views.ReviewListAPI.as_view(), name='api-reviews'),
    path('api/reviews/<int:product_id>/', views.ReviewListAPI.as_view()),
    path('api/reviews/create/', views.ReviewCreateAPI.as_view(), name='api-review-create'),
]
