# Generated manually for the HamroTour scaffold.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("username", models.CharField(error_messages={"unique": "A user with that username already exists."}, help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.", max_length=150, unique=True, verbose_name="username")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(auto_now_add=True, verbose_name="date joined")),
                ("avatar", models.ImageField(blank=True, null=True, upload_to="avatars/")),
                ("bio", models.TextField(blank=True)),
                ("phone", models.CharField(blank=True, max_length=32)),
                ("city", models.CharField(blank=True, max_length=120)),
                ("is_host", models.BooleanField(default=False)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Listing",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("slug", models.SlugField(blank=True, max_length=220, unique=True)),
                ("description", models.TextField()),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("stay", "Stay"),
                            ("apartment", "Apartment"),
                            ("hotel", "Hotel"),
                            ("villa", "Villa"),
                            ("cabin", "Cabin"),
                            ("camp", "Camp"),
                            ("resort", "Resort"),
                            ("experience", "Experience"),
                        ],
                        default="stay",
                        max_length=32,
                    ),
                ),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("cleaning_fee", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("service_fee", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("base_guests", models.PositiveSmallIntegerField(default=2)),
                ("max_guests", models.PositiveSmallIntegerField(default=4)),
                ("max_kids", models.PositiveSmallIntegerField(default=0)),
                ("max_infants", models.PositiveSmallIntegerField(default=0)),
                ("max_pets", models.PositiveSmallIntegerField(default=0)),
                ("extra_guest_fee_per_night", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("addons", models.JSONField(blank=True, default=list)),
                ("country", models.CharField(max_length=120)),
                ("location", models.CharField(max_length=160)),
                ("address", models.CharField(blank=True, max_length=255)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=10, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=10, null=True)),
                ("image", models.ImageField(blank=True, null=True, upload_to="listings/")),
                ("is_featured", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "owner",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="listings", to="api.user"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddField(
            model_name="user",
            name="wishlist",
            field=models.ManyToManyField(blank=True, related_name="wishlisted_by", to="api.listing"),
        ),
        migrations.CreateModel(
            name="Booking",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("check_in", models.DateField()),
                ("check_out", models.DateField()),
                ("guests", models.PositiveSmallIntegerField(default=1)),
                ("total_price", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("confirmed", "Confirmed"),
                            ("cancelled", "Cancelled"),
                            ("completed", "Completed"),
                        ],
                        default="pending",
                        max_length=16,
                    ),
                ),
                (
                    "payment_status",
                    models.CharField(
                        choices=[("unpaid", "Unpaid"), ("paid", "Paid"), ("refunded", "Refunded")],
                        default="unpaid",
                        max_length=16,
                    ),
                ),
                ("special_requests", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "guest",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bookings", to="api.user"),
                ),
                (
                    "listing",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bookings", to="api.listing"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Review",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("rating", models.PositiveSmallIntegerField()),
                ("comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "author",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reviews", to="api.user"),
                ),
                (
                    "booking",
                    models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="review", to="api.booking"),
                ),
                (
                    "listing",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reviews", to="api.listing"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "constraints": [
                    models.UniqueConstraint(fields=("listing", "author"), name="unique_listing_author_review"),
                ],
            },
        ),
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("subject", models.CharField(max_length=180)),
                ("message", models.TextField()),
                (
                    "status",
                    models.CharField(
                        choices=[("new", "New"), ("read", "Read"), ("resolved", "Resolved")],
                        default="new",
                        max_length=16,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=160)),
                ("message", models.TextField(blank=True)),
                ("link", models.CharField(blank=True, max_length=255)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="api.user"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
