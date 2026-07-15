from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Listing, Review


def load_sample_rows() -> list[dict[str, str]]:
    fixture_path = Path(__file__).resolve().parents[2] / "fixtures" / "sample_listings.json"
    return json.loads(fixture_path.read_text())


def guess_category(title: str) -> str:
    lower = title.lower()
    if any(keyword in lower for keyword in ["apartment", "loft", "penthouse", "brownstone", "studio"]):
        return Listing.Category.APARTMENT
    if any(keyword in lower for keyword in ["villa", "beach house", "house", "bungalow", "oasis", "penthouse"]):
        return Listing.Category.VILLA
    if any(keyword in lower for keyword in ["cabin", "chalet", "treehouse", "log cabin", "lakefront"]):
        return Listing.Category.CABIN
    if any(keyword in lower for keyword in ["camp", "safari", "desert", "retreat", "eco-friendly"]):
        return Listing.Category.CAMP
    if any(keyword in lower for keyword in ["hotel", "resort", "lodge", "castle", "villa"]):
        return Listing.Category.RESORT if "resort" in lower or "lodge" in lower else Listing.Category.HOTEL
    if any(keyword in lower for keyword in ["experience", "tour", "guide"]):
        return Listing.Category.EXPERIENCE
    return Listing.Category.STAY


def build_addons(category: str, index: int) -> list[dict[str, float]]:
    addons_by_category = {
        Listing.Category.APARTMENT: [
            {"name": "Late checkout", "price": 28},
            {"name": "Breakfast basket", "price": 18},
        ],
        Listing.Category.VILLA: [
            {"name": "Airport transfer", "price": 45},
            {"name": "Private chef", "price": 120},
        ],
        Listing.Category.CABIN: [
            {"name": "Firewood bundle", "price": 20},
            {"name": "Guided hike", "price": 40},
        ],
        Listing.Category.CAMP: [
            {"name": "Campfire kit", "price": 16},
            {"name": "Local guide", "price": 35},
        ],
        Listing.Category.RESORT: [
            {"name": "Spa access", "price": 55},
            {"name": "Sunset dinner", "price": 80},
        ],
        Listing.Category.HOTEL: [
            {"name": "Airport pickup", "price": 30},
            {"name": "Breakfast included", "price": 22},
        ],
        Listing.Category.EXPERIENCE: [
            {"name": "Local guide", "price": 38},
        ],
    }
    if category in addons_by_category:
        return addons_by_category[category]
    if index % 4 == 0:
        return [{"name": "Breakfast", "price": 18}]
    return []


def build_host_users():
    return [
        {
            "username": "anju",
            "email": "anju@hamrotour.local",
            "first_name": "Anju",
            "last_name": "Shrestha",
            "city": "Kathmandu",
        },
        {
            "username": "kiran",
            "email": "kiran@hamrotour.local",
            "first_name": "Kiran",
            "last_name": "Thapa",
            "city": "Pokhara",
        },
        {
            "username": "nabin",
            "email": "nabin@hamrotour.local",
            "first_name": "Nabin",
            "last_name": "Gurung",
            "city": "Bhaktapur",
        },
    ]


def build_guest_users():
    return [
        {
            "username": "maya",
            "email": "maya@hamrotour.local",
            "first_name": "Maya",
            "last_name": "Khadka",
            "city": "Lalitpur",
        },
        {
            "username": "samir",
            "email": "samir@hamrotour.local",
            "first_name": "Samir",
            "last_name": "Rai",
            "city": "Biratnagar",
        },
        {
            "username": "sara",
            "email": "sara@hamrotour.local",
            "first_name": "Sara",
            "last_name": "Lama",
            "city": "Dharan",
        },
    ]


class Command(BaseCommand):
    help = "Seed HamroTour with demo users, listings, and reviews."

    def handle(self, *args, **options):
        if Listing.objects.exists():
            self.stdout.write("Sample listings already exist; skipping seed.")
            return

        rows = load_sample_rows()
        User = get_user_model()

        with transaction.atomic():
            hosts = []
            for spec in build_host_users():
                user, _ = User.objects.get_or_create(
                    username=spec["username"],
                    defaults={
                        **spec,
                        "is_host": True,
                    },
                )
                user.email = spec["email"]
                user.first_name = spec["first_name"]
                user.last_name = spec["last_name"]
                user.city = spec["city"]
                user.is_host = True
                if not user.has_usable_password():
                    user.set_password("password123")
                user.save()
                hosts.append(user)

            guests = []
            for spec in build_guest_users():
                user, _ = User.objects.get_or_create(
                    username=spec["username"],
                    defaults=spec,
                )
                user.email = spec["email"]
                user.first_name = spec["first_name"]
                user.last_name = spec["last_name"]
                user.city = spec["city"]
                if not user.has_usable_password():
                    user.set_password("password123")
                user.save()
                guests.append(user)

            listings = []
            for index, row in enumerate(rows):
                title = row["title"]
                category = guess_category(title)
                host = hosts[index % len(hosts)]
                price = Decimal(str(row["price"]))
                listing = Listing.objects.create(
                    owner=host,
                    title=title,
                    description=row["description"],
                    category=category,
                    price=price,
                    cleaning_fee=Decimal("18.00") if price < 1500 else Decimal("28.00"),
                    service_fee=Decimal("15.00"),
                    base_guests=2 if category != Listing.Category.EXPERIENCE else 1,
                    max_guests=4 if category in {Listing.Category.APARTMENT, Listing.Category.HOTEL} else 6,
                    max_kids=2,
                    max_infants=1,
                    max_pets=1 if category in {Listing.Category.CABIN, Listing.Category.CAMP, Listing.Category.VILLA} else 0,
                    extra_guest_fee_per_night=Decimal("25.00"),
                    addons=build_addons(category, index),
                    country=row["country"],
                    location=row["location"],
                    address=f"{row['location']}, {row['country']}",
                    external_image_url=row["url"],
                    is_featured=index < 8 or category in {Listing.Category.VILLA, Listing.Category.CABIN, Listing.Category.RESORT},
                    is_active=True,
                )
                listings.append(listing)

            rating_cycle = [5, 4, 5, 5, 4, 5, 4, 5, 5, 4, 5, 4]
            comments = [
                "The view was even better than the photos and the host was incredibly thoughtful.",
                "Spotlessly clean, beautifully staged, and perfect for a slow weekend escape.",
                "Amazing location with a calm atmosphere and a very responsive host.",
                "Exactly the kind of stay that makes travel feel special.",
            ]

            for index, listing in enumerate(listings[:12]):
                reviewer = guests[index % len(guests)]
                Review.objects.create(
                    listing=listing,
                    author=reviewer,
                    rating=rating_cycle[index % len(rating_cycle)],
                    comment=comments[index % len(comments)],
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(listings)} sample listings and 12 reviews."))
