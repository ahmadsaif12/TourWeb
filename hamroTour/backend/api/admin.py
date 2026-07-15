from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Booking, ContactMessage, Listing, Notification, Review, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "is_host", "is_staff", "city")
    search_fields = ("username", "email", "city")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("HamroTour", {"fields": ("avatar", "bio", "phone", "city", "is_host", "wishlist")}),
    )


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "country", "location", "price", "is_featured", "is_active")
    search_fields = ("title", "country", "location", "owner__username")
    list_filter = ("category", "country", "is_featured", "is_active")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("listing", "guest", "check_in", "check_out", "status", "payment_status", "total_price")
    search_fields = ("listing__title", "guest__username")
    list_filter = ("status", "payment_status")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("listing", "author", "rating", "created_at")
    search_fields = ("listing__title", "author__username")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "status", "created_at")
    search_fields = ("subject", "name", "email")
    list_filter = ("status",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "is_read", "created_at")
    search_fields = ("title", "user__username")
    list_filter = ("is_read",)
