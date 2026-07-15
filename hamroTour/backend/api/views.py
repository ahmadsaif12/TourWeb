from __future__ import annotations

from django.contrib.auth import authenticate
from django.db.models import Avg, BooleanField, Count, Exists, OuterRef, Q, Value
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Booking, ContactMessage, Listing, Notification, Review, User
from .permissions import IsAuthorOrReadOnly, IsOwnerOrReadOnly
from .serializers import (
    BookingSerializer,
    ContactMessageSerializer,
    ListingSerializer,
    NotificationSerializer,
    RegisterSerializer,
    ReviewSerializer,
    UserSerializer,
)


def issue_tokens(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        payload = UserSerializer(user, context={"request": request}).data
        return Response({**issue_tokens(user), "user": payload}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("username") or request.data.get("email") or request.data.get("identifier")
        password = request.data.get("password")
        if not identifier or not password:
            return Response({"detail": "Username/email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        if "@" in identifier:
            try:
                user = User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                user = None
        if user is None:
            try:
                user = User.objects.get(username__iexact=identifier)
            except User.DoesNotExist:
                user = None

        if user is None:
            return Response({"detail": "Invalid username/email or password."}, status=status.HTTP_400_BAD_REQUEST)

        authenticated = authenticate(request, username=user.username, password=password)
        if authenticated is None:
            return Response({"detail": "Invalid username/email or password."}, status=status.HTTP_400_BAD_REQUEST)

        payload = UserSerializer(authenticated, context={"request": request}).data
        return Response({**issue_tokens(authenticated), "user": payload})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({"detail": "Logged out successfully."})


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            [
                {"value": key, "label": label}
                for key, label in Listing.Category.choices
            ]
        )


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Listing.objects.select_related("owner").annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
        )
        request = self.request
        if request.user.is_authenticated:
            wishlist_lookup = User.wishlist.through.objects.filter(
                user_id=request.user.id,
                listing_id=OuterRef("pk"),
            )
            queryset = queryset.annotate(is_wishlisted=Exists(wishlist_lookup))
        else:
            queryset = queryset.annotate(is_wishlisted=Value(False, output_field=BooleanField()))

        if not request.user.is_authenticated or request.query_params.get("mine") != "true":
            queryset = queryset.filter(is_active=True)

        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(country__icontains=search)
                | Q(location__icontains=search)
            )

        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        country = request.query_params.get("country")
        if country:
            queryset = queryset.filter(country__icontains=country)

        min_price = request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        guests = request.query_params.get("guests")
        if guests:
            queryset = queryset.filter(max_guests__gte=guests)

        if request.query_params.get("featured") == "true":
            queryset = queryset.filter(is_featured=True)

        if request.query_params.get("mine") == "true" and request.user.is_authenticated:
            queryset = queryset.filter(owner=request.user)

        if request.query_params.get("wishlist") == "true" and request.user.is_authenticated:
            queryset = queryset.filter(wishlisted_by=request.user)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            title="Listing created",
            message="Your new HamroTour listing is live.",
            link="/host",
        )

    @action(detail=True, methods=["post", "delete"], permission_classes=[permissions.IsAuthenticated])
    def wishlist(self, request, slug=None):
        listing = self.get_object()
        if request.method == "POST":
            request.user.wishlist.add(listing)
            added = True
        else:
            request.user.wishlist.remove(listing)
            added = False
        return Response({"wishlisted": added})


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related("listing", "guest", "listing__owner")
        if user.is_staff:
            return queryset
        return queryset.filter(Q(guest=user) | Q(listing__owner=user))

    def perform_create(self, serializer):
        booking = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title="Booking created",
            message=f"Your booking for {booking.listing.title} is pending.",
            link=f"/profile?booking={booking.id}",
        )


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.select_related("listing", "author", "booking")
        listing = self.request.query_params.get("listing")
        if listing:
            queryset = queryset.filter(Q(listing__slug=listing) | Q(listing__id=listing))
        return queryset

    def perform_create(self, serializer):
        serializer.save()


class ContactMessageCreateView(CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ContactMessage.objects.all()


class NotificationViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)
