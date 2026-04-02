from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import StudentProfile, Skill, SkillField, Education, Experience
from .skill_query import allowed_skill_ids_for_course

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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)


class SkillFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillField
        fields = ["id", "name"]


class SkillSerializer(serializers.ModelSerializer):
    fields = SkillFieldSerializer(many=True, read_only=True)
    field_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Skill
        fields = ["id", "name", "fields", "field_ids"]

    def validate_name(self, value):
        v = (value or "").strip()
        if not v:
            raise serializers.ValidationError("This field may not be blank.")
        return v

    def validate_field_ids(self, value):
        if value is None:
            return None
        unique_ids = list({int(x) for x in value})
        existing = set(SkillField.objects.filter(id__in=unique_ids).values_list("id", flat=True))
        unknown = set(unique_ids) - existing
        if unknown:
            raise serializers.ValidationError(
                f"Unknown field id(s): {', '.join(str(i) for i in sorted(unknown))}"
            )
        return unique_ids

    def create(self, validated_data):
        field_ids = validated_data.pop("field_ids", None)
        instance = super().create(validated_data)
        if field_ids is not None:
            instance.fields.set(SkillField.objects.filter(id__in=field_ids))
        return instance

    def update(self, instance, validated_data):
        field_ids = validated_data.pop("field_ids", None)
        instance = super().update(instance, validated_data)
        if field_ids is not None:
            instance.fields.set(SkillField.objects.filter(id__in=field_ids))
        return instance


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    is_staff = serializers.BooleanField(source="user.is_staff", read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    profile_completeness_percent = serializers.SerializerMethodField()

    skills_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = StudentProfile
        fields = [
            "email",
            "is_staff",
            "name",
            "skills",
            "skills_ids",
            "preferred_job_type",
            "preferred_location",
            "course",
            "cv_summary",
            "profile_completeness_percent",
        ]

    def get_profile_completeness_percent(self, obj):
        """0–100 based on course, skills, location, and display name (four equal weights)."""
        score = 0
        total = 4
        course = (obj.course or "").strip()
        if course and course.lower() != "not specified":
            score += 1
        if obj.skills.exists():
            score += 1
        if (obj.preferred_location or "").strip():
            score += 1
        if (obj.name or "").strip():
            score += 1
        return round(100 * score / total)

    def update(self, instance, validated_data):
        skills_ids = validated_data.pop("skills_ids", None)
        next_course = (validated_data.get("course", instance.course) or "").strip()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if skills_ids is not None:
            if next_course:
                allowed_ids = allowed_skill_ids_for_course(next_course)
                invalid_ids = [sid for sid in set(skills_ids) if sid not in allowed_ids]
                if invalid_ids:
                    raise serializers.ValidationError(
                        {"skills_ids": "Some selected skills are not available for the selected course."}
                    )
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
