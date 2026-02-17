from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import StudentProfile, Skill, Education, Experience

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    course = serializers.CharField(required=False, allow_blank=True, max_length=150)

    class Meta:
        model = User
        fields = ["email", "password", "name", "course"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        name = (validated_data.get("name") or "").strip()
        course = (validated_data.get("course") or "").strip() or "Not Specified"

        user = User(email=email, username=email)
        user.set_password(password)
        user.save()
        # Signal creates StudentProfile; update with name/course from registration
        profile = StudentProfile.objects.get(user=user)
        profile.name = name
        profile.course = course
        profile.save(update_fields=["name", "course"])

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
        fields = ["email", "name", "skills", "skills_ids", "preferred_job_type", "preferred_location", "course", "cv_summary"]

    def update(self, instance, validated_data):
        skills_ids = validated_data.pop("skills_ids", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if skills_ids is not None:
            skills = Skill.objects.filter(id__in=skills_ids)
            instance.skills.set(skills)

        instance.save()
        return instance


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "institution", "degree", "subject", "start_date", "end_date", "description", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "company", "role", "start_date", "end_date", "description", "order"]


class CVSerializer(serializers.Serializer):
    """Read: full CV data. Write: summary + education + experience lists."""
    summary = serializers.CharField(required=False, allow_blank=True)
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
