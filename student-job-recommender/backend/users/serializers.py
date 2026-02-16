from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.db import transaction
import uuid

from .models import StudentProfile, Skill

User = get_user_model()


from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import StudentProfile, Skill

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]

        # ✅ IMPORTANT: username must match email for SimpleJWT login consistency
        user = User(email=email, username=email)
        user.set_password(password)
        user.save()

        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                "course": "Not Specified",
                "preferred_job_type": "graduate",
                "preferred_location": "Not Specified",
            },
        )

        return user


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    skills_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = StudentProfile
        fields = ["email", "skills", "skills_ids", "preferred_job_type", "preferred_location", "course"]

    def update(self, instance, validated_data):
        skills_ids = validated_data.pop("skills_ids", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if skills_ids is not None:
            skills = Skill.objects.filter(id__in=skills_ids)
            instance.skills.set(skills)

        instance.save()
        return instance
