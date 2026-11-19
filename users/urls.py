from django.urls import path
from . import views

urlpatterns = [
    # Page URLs
    path('login/', views.LoginPageView.as_view(), name='login'),
    path('register/', views.RegisterPageView.as_view(), name='register'),

    # API URLs
    path('api/auth/register/', views.RegisterView.as_view(), name='api-register'),
    path('api/auth/login/', views.LoginView.as_view(), name='api-login'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='api-logout'),
    path('api/auth/profile/', views.ProfileView.as_view(), name='api-profile'),
    
    # Aliases for direct /api/... paths
    path('api/register/', views.RegisterView.as_view()),
    path('api/login/', views.LoginView.as_view()),
    path('api/logout/', views.LogoutView.as_view()),
    path('api/profile/', views.ProfileView.as_view()),
]
