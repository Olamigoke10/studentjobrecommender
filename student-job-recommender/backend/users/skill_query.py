"""Shared queryset helpers for course-scoped skills (M2M-safe "global" skills)."""

from django.db.models import Count, Q

from .models import Skill


def skills_queryset_for_course(course):
    """
    Skills visible for a course: unmapped (no SkillField rows) OR mapped to this course name.
    Uses Count instead of fields__isnull=True, which is unreliable for empty M2M.
    """
    course = (course or "").strip()
    if not course:
        return Skill.objects.all().prefetch_related("fields").order_by("name")
    return (
        Skill.objects.annotate(_field_count=Count("fields", distinct=True))
        .filter(Q(_field_count=0) | Q(fields__name__iexact=course))
        .distinct()
        .prefetch_related("fields")
        .order_by("name")
    )


def allowed_skill_ids_for_course(course):
    """Set of Skill PKs allowed for the given course (same rules as skills_queryset_for_course)."""
    return set(skills_queryset_for_course(course).values_list("id", flat=True))
