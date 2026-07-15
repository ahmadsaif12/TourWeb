from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=120, blank=True)
    is_host = models.BooleanField(default=False)
    wishlist = models.ManyToManyField(
        "Listing",
        blank=True,
        related_name="wishlisted_by",
    )

    def __str__(self) -> str:
        return self.username or self.email

    @property
    def avatar_url(self) -> str:
        if self.avatar:
            return self.avatar.url
        return ""


class Listing(models.Model):
    class Category(models.TextChoices):
        STAY = "stay", "Stay"
        APARTMENT = "apartment", "Apartment"
        HOTEL = "hotel", "Hotel"
        VILLA = "villa", "Villa"
        CABIN = "cabin", "Cabin"
        CAMP = "camp", "Camp"
        RESORT = "resort", "Resort"
        EXPERIENCE = "experience", "Experience"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.STAY)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    cleaning_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    base_guests = models.PositiveSmallIntegerField(default=2)
    max_guests = models.PositiveSmallIntegerField(default=4)
    max_kids = models.PositiveSmallIntegerField(default=0)
    max_infants = models.PositiveSmallIntegerField(default=0)
    max_pets = models.PositiveSmallIntegerField(default=0)
    extra_guest_fee_per_night = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    addons = models.JSONField(default=list, blank=True)
    country = models.CharField(max_length=120)
    location = models.CharField(max_length=160)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, blank=True, null=True)
    image = models.ImageField(upload_to="listings/", blank=True, null=True)
    external_image_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "listing"
            slug = base_slug
            suffix = 1
            while Listing.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def image_url(self) -> str:
        if self.external_image_url:
            return self.external_image_url
        if self.image:
            return self.image.url
        return ""


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        REFUNDED = "refunded", "Refunded"

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bookings")
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveSmallIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    special_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.guest} -> {self.listing} ({self.check_in} - {self.check_out})"

    @property
    def nights(self) -> int:
        return max((self.check_out - self.check_in).days, 0)


class Review(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="reviews")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    booking = models.OneToOneField(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name="review")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["listing", "author"], name="unique_listing_author_review"),
        ]

    def __str__(self) -> str:
        return f"{self.author} on {self.listing}"


class ContactMessage(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        READ = "read", "Read"
        RESOLVED = "resolved", "Resolved"

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=180)
    message = models.TextField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.subject} ({self.email})"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=160)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user}: {self.title}"
