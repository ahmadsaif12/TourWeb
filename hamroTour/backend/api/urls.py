from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    BookingViewSet,
    CategoryListView,
    ContactMessageCreateView,
    CurrentUserView,
    ListingViewSet,
    LoginView,
    LogoutView,
    NotificationViewSet,
    RegisterView,
    ReviewViewSet,
)


router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listing")
router.register("bookings", BookingViewSet, basename="booking")
router.register("reviews", ReviewViewSet, basename="review")
router.register("notifications", NotificationViewSet, basename="notification")


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", CurrentUserView.as_view(), name="auth-me"),
    path("categories/", CategoryListView.as_view(), name="categories"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact"),
    path("", include(router.urls)),
]
