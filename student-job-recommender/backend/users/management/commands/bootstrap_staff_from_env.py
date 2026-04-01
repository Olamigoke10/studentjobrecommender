import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Create or promote an admin user from environment variables (no shell required). "
        "Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in your host dashboard. "
        "If unset, exits successfully without doing anything."
    )

    def handle(self, *args, **options):
        email = (os.environ.get("BOOTSTRAP_ADMIN_EMAIL") or "").strip().lower()
        password = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD") or ""
        username = (os.environ.get("BOOTSTRAP_ADMIN_USERNAME") or email or "").strip()

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "bootstrap_staff_from_env: skipped (set BOOTSTRAP_ADMIN_EMAIL and "
                    "BOOTSTRAP_ADMIN_PASSWORD to create or promote an admin user)."
                )
            )
            return

        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()

        if user:
            changed = False
            if not user.is_staff:
                user.is_staff = True
                changed = True
            if not user.is_superuser:
                user.is_superuser = True
                changed = True
            if changed:
                user.save(update_fields=["is_staff", "is_superuser"])
                self.stdout.write(
                    self.style.SUCCESS(f"bootstrap_staff_from_env: promoted {email} to staff/superuser.")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"bootstrap_staff_from_env: {email} already staff; no change.")
                )
            return

        if not username:
            username = email

        User.objects.create_superuser(
            email=email,
            username=username,
            password=password,
        )
        self.stdout.write(
            self.style.SUCCESS(f"bootstrap_staff_from_env: created superuser {email}.")
        )
