from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.db import transaction
import uuid

from .models import StudentProfile, Skill

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "username"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def _generate_username(self, email: str) -> str:
        base = slugify(email.split("@")[0]) or "user"
        candidate = base
        if User.objects.filter(username=candidate).exists():
            candidate = f"{base}-{uuid.uuid4().hex[:6]}"
        return candidate

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]

        username = (validated_data.get("username") or "").strip()
        if not username:
            username = self._generate_username(email)

        user = User(email=email, username=username)
        user.set_password(password)
        user.save()

        # ✅ prevents 500 if profile already created by a signal
        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                "course": "Not Specified",
                "preferred_job_type": "graduate",
                "preferred_location": "Not Specified",
            },
        )

        return user
