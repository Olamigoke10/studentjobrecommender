import re
from collections import Counter

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, views
from rest_framework.response import Response

from users.models import StudentProfile
from jobs.models import ApplicationTracker, Job, JobFeedback, SavedJob
from .serializers import RecommendedJobSerializer


# Common English stopwords for lightweight keyword extraction (saved/applied job similarity).
_INTEREST_STOPWORDS = frozenset(
    """
    the and for with your this that from have will are our you all not been was has can job work
    team our you will are this that from they their what when where which while about after also
    any both each few more most other some such than then these those through under until very
    into over such only same just even must well back much before here there being during off
    own same such both able based being using including make made make making make makes
    """.split()
)


def _extract_interest_keywords(jobs_qs, max_keywords=12):
    """Tokenize titles/descriptions from jobs the user saved or applied to."""
    texts = []
    for job in jobs_qs[:80]:
        texts.append(f"{job.title or ''} {job.description or ''}")
    blob = " ".join(texts).lower()
    words = re.findall(r"[a-z]{4,}", blob)
    counts = Counter(w for w in words if w not in _INTEREST_STOPWORDS)
    return [w for w, _ in counts.most_common(max_keywords)]


class RecommendedJobsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = StudentProfile.objects.filter(user=request.user).first()
        if not student:
            return Response({"detail": "Student profile not found."}, status=404)

        saved_job_ids = list(
            SavedJob.objects.filter(student=student).values_list("job_id", flat=True)
        )
        feedback_job_ids = list(
            JobFeedback.objects.filter(student=student).values_list("job_id", flat=True)
        )

        exclude_ids = set(saved_job_ids) | set(feedback_job_ids)
        qs = Job.objects.exclude(id__in=exclude_ids) if exclude_ids else Job.objects.all()

        # Jobs the user engaged with (saved or in application tracker) — for implicit similarity.
        interest_ids = set(saved_job_ids) | set(
            ApplicationTracker.objects.filter(student=student).values_list("job_id", flat=True)
        )
        interest_jobs = Job.objects.filter(id__in=interest_ids) if interest_ids else Job.objects.none()
        interest_keywords = _extract_interest_keywords(interest_jobs)

        keywords = []
        if student.course:
            keywords.append(student.course)

        skill_names = list(student.skills.values_list("name", flat=True))
        keywords.extend(skill_names)

        preferred_job_type = student.preferred_job_type
        preferred_location = student.preferred_location

        search_q = Q()

        if preferred_location:
            search_q |= Q(location__icontains=preferred_location)

        if preferred_job_type:
            search_q |= Q(job_type__icontains=preferred_job_type)

        for kw in keywords:
            search_q |= Q(title__icontains=kw) | Q(description__icontains=kw) | Q(company__icontains=kw)

        for kw in interest_keywords:
            search_q |= Q(title__icontains=kw) | Q(description__icontains=kw)

        qs = qs.filter(search_q).distinct().order_by("-posted_date", "-cached_at")[:50]

        results = []
        for job in qs:
            score = 0
            reasons = []

            if preferred_location and preferred_location.lower() in (job.location or "").lower():
                score += 2
                reasons.append(f"Matches preferred location: {preferred_location}")

            if preferred_job_type and (job.job_type or "").lower() == preferred_job_type.lower():
                score += 3
                reasons.append(f"Matches preferred job type: {preferred_job_type}")

            if student.course:
                c = student.course.lower()
                if c in (job.title or "").lower() or c in (job.description or "").lower():
                    score += 3
                    reasons.append(f"Related to your course: {student.course}")

            matched_skills = []
            blob = f"{job.title or ''} {job.description or ''} {job.company or ''}".lower()
            for s in skill_names:
                if s.lower() in blob:
                    matched_skills.append(s)

            if matched_skills:
                score += min(len(matched_skills), 5)
                reasons.append("Matches your skills: " + ", ".join(matched_skills))

            if interest_keywords:
                matched_interest = [w for w in interest_keywords if w in blob]
                if matched_interest:
                    boost = min(len(matched_interest) * 2, 8)
                    score += boost
                    shown = ", ".join(matched_interest[:5])
                    reasons.append(
                        "Similar to roles you've saved or applied to"
                        + (f" (e.g. {shown})" if shown else "")
                    )

            if score > 0:
                job.match_score = score
                job.recommended_reason = reasons
                results.append(job)

        results.sort(
            key=lambda j: (getattr(j, "match_score", 0), j.posted_date or "", j.cached_at or ""),
            reverse=True,
        )

        return Response(RecommendedJobSerializer(results, many=True).data)


class RecommendationFeedbackView(views.APIView):
    """Record 'not interested' (or future types) so recommendations can exclude the job."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"job_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        job = get_object_or_404(Job, id=job_id)
        JobFeedback.objects.update_or_create(
            student=student,
            job=job,
            defaults={"feedback_type": JobFeedback.NOT_INTERESTED},
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)
