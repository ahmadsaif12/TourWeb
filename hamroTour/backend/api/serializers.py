from __future__ import annotations

import json
from decimal import Decimal

from django.db.models import Avg
from rest_framework import serializers

from .models import Booking, ContactMessage, Listing, Notification, Review, User


def build_absolute_url(request, value: str | None) -> str:
    if not value:
        return ""
    if request is None:
        return value
    return request.build_absolute_uri(value)


def parse_addons(value):
    if value in (None, "", []):
        return []
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError as exc:
            raise serializers.ValidationError("Add-ons must be valid JSON.") from exc
    if not isinstance(value, list):
        raise serializers.ValidationError("Add-ons must be a list of objects.")

    normalized = []
    for item in value:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        price = item.get("price", 0)
        try:
            price_value = float(price)
        except (TypeError, ValueError):
            price_value = 0
        normalized.append({"name": name, "price": price_value})
    return normalized


class UserSummarySerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "city", "is_host", "avatar_url"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        return build_absolute_url(request, obj.avatar_url)


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()
    wishlist_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "avatar_url",
            "bio",
            "phone",
            "city",
            "is_host",
            "wishlist_ids",
        ]
        extra_kwargs = {
            "email": {"required": False},
            "username": {"required": False},
        }

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        return build_absolute_url(request, obj.avatar_url)

    def get_wishlist_ids(self, obj):
        return list(obj.wishlist.values_list("id", flat=True))


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "avatar",
            "bio",
            "phone",
            "city",
            "is_host",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class ListingSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True, write_only=True)
    external_image_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    image_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "slug",
            "owner",
            "title",
            "description",
            "category",
            "price",
            "cleaning_fee",
            "service_fee",
            "base_guests",
            "max_guests",
            "max_kids",
            "max_infants",
            "max_pets",
            "extra_guest_fee_per_night",
            "addons",
            "country",
            "location",
            "address",
            "latitude",
            "longitude",
            "image",
            "external_image_url",
            "image_url",
            "is_featured",
            "is_active",
            "average_rating",
            "review_count",
            "is_wishlisted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "owner",
            "image_url",
            "average_rating",
            "review_count",
            "is_wishlisted",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        base_guests = attrs.get("base_guests", getattr(self.instance, "base_guests", 1))
        max_guests = attrs.get("max_guests", getattr(self.instance, "max_guests", 1))
        if max_guests < base_guests:
            raise serializers.ValidationError({"max_guests": "Maximum guests must be greater than or equal to base guests."})
        if "addons" in attrs:
            attrs["addons"] = parse_addons(attrs["addons"])
        return attrs

    def get_image_url(self, obj):
        request = self.context.get("request")
        return build_absolute_url(request, obj.image_url)

    def get_average_rating(self, obj):
        value = getattr(obj, "average_rating", None)
        if value is None:
            value = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(float(value), 1) if value else 0

    def get_review_count(self, obj):
        return int(getattr(obj, "review_count", obj.reviews.count()))

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        if hasattr(obj, "is_wishlisted") and obj.is_wishlisted is not None:
            return bool(obj.is_wishlisted)
        return obj.wishlisted_by.filter(pk=request.user.pk).exists()


class BookingSerializer(serializers.ModelSerializer):
    listing = serializers.PrimaryKeyRelatedField(queryset=Listing.objects.select_related("owner"))
    listing_detail = ListingSerializer(source="listing", read_only=True)
    guest = UserSummarySerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "listing",
            "listing_detail",
            "guest",
            "check_in",
            "check_out",
            "guests",
            "total_price",
            "status",
            "payment_status",
            "special_requests",
            "nights",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "guest", "total_price", "status", "payment_status", "created_at", "updated_at"]

    def get_nights(self, obj):
        return obj.nights

    def validate(self, attrs):
        listing = attrs.get("listing", getattr(self.instance, "listing", None))
        check_in = attrs.get("check_in", getattr(self.instance, "check_in", None))
        check_out = attrs.get("check_out", getattr(self.instance, "check_out", None))
        guests = attrs.get("guests", getattr(self.instance, "guests", 1))
        request = self.context["request"]

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({"check_out": "Check-out date must be after check-in date."})

        if listing:
            if guests > listing.max_guests:
                raise serializers.ValidationError({"guests": "Guest count exceeds the listing maximum."})
            if request.user == listing.owner:
                raise serializers.ValidationError({"listing": "You cannot book your own listing."})
            overlaps = Booking.objects.filter(
                listing=listing,
                status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
                check_in__lt=check_out,
                check_out__gt=check_in,
            )
            if self.instance:
                overlaps = overlaps.exclude(pk=self.instance.pk)
            if overlaps.exists():
                raise serializers.ValidationError({"check_in": "This listing is not available for the selected dates."})

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        listing = validated_data["listing"]
        guests = validated_data.get("guests", 1)
        check_in = validated_data["check_in"]
        check_out = validated_data["check_out"]
        nights = max((check_out - check_in).days, 1)
        extra_guests = max(guests - listing.base_guests, 0)
        total_price = (
            Decimal(str(listing.price)) * nights
            + Decimal(str(listing.cleaning_fee))
            + Decimal(str(listing.service_fee))
            + Decimal(str(listing.extra_guest_fee_per_night)) * nights * extra_guests
        )
        booking = Booking.objects.create(
            guest=request.user,
            total_price=total_price,
            **validated_data,
        )
        Notification.objects.create(
            user=listing.owner,
            title=f"New booking request for {listing.title}",
            message=f"{request.user.username} requested {nights} night(s) at your listing.",
            link=f"/bookings/{booking.id}",
        )
        return booking


class ReviewSerializer(serializers.ModelSerializer):
    listing = serializers.PrimaryKeyRelatedField(queryset=Listing.objects.all())
    listing_detail = ListingSerializer(source="listing", read_only=True)
    author = UserSummarySerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "listing",
            "listing_detail",
            "author",
            "booking",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context["request"]
        listing = attrs.get("listing", getattr(self.instance, "listing", None))
        booking = attrs.get("booking")

        if Review.objects.filter(listing=listing, author=request.user).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError({"listing": "You have already reviewed this listing."})

        if booking and booking.guest != request.user:
            raise serializers.ValidationError({"booking": "You can only review your own booking."})
        if booking and booking.listing != listing:
            raise serializers.ValidationError({"booking": "Booking must belong to the selected listing."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        review = Review.objects.create(author=request.user, **validated_data)
        Notification.objects.create(
            user=review.listing.owner,
            title=f"New review for {review.listing.title}",
            message=f"{request.user.username} left a {review.rating}-star review.",
            link=f"/listings/{review.listing.slug}",
        )
        return review


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "link", "is_read", "created_at"]
        read_only_fields = fields
