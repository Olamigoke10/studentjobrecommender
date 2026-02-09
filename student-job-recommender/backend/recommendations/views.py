from django.db.models import Q
from rest_framework import views, permissions
from rest_framework.response import Response

from users.models import StudentProfile
from jobs.models import Job, SavedJob
from .serializers import RecommendedJobSerializer


class RecommendedJobsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = StudentProfile.objects.filter(user=request.user).first()
        if not student:
            return Response({"detail": "Student profile not found."}, status=404)

        # Exclude saved jobs
        saved_job_ids = SavedJob.objects.filter(student=student).values_list("job_id", flat=True)

        qs = Job.objects.exclude(id__in=saved_job_ids)

        keywords = []
        if student.course:
            keywords.append(student.course)

        skill_names = list(student.skills.values_list("name", flat=True))
        keywords.extend(skill_names)

        preferred_job_type = student.preferred_job_type
        preferred_location = student.preferred_location

        # Soft matching query
        search_q = Q()

        if preferred_location:
            search_q |= Q(location__icontains=preferred_location)

        if preferred_job_type:
            search_q |= Q(job_type__icontains=preferred_job_type)

        for kw in keywords:
            search_q |= Q(title__icontains=kw) | Q(description__icontains=kw) | Q(company__icontains=kw)

        qs = qs.filter(search_q).distinct().order_by("-posted_date", "-cached_at")[:50]

        # Build scored results + reasons
        results = []
        for job in qs:
            score = 0
            reasons = []

            # Location
            if preferred_location and preferred_location.lower() in (job.location or "").lower():
                score += 2
                reasons.append(f"Matches preferred location: {preferred_location}")

            # Job type
            if preferred_job_type and (job.job_type or "").lower() == preferred_job_type.lower():
                score += 3
                reasons.append(f"Matches preferred job type: {preferred_job_type}")

            # Course
            if student.course:
                c = student.course.lower()
                if c in (job.title or "").lower() or c in (job.description or "").lower():
                    score += 3
                    reasons.append(f"Related to your course: {student.course}")

            # Skills
            matched_skills = []
            blob = f"{job.title or ''} {job.description or ''} {job.company or ''}".lower()
            for s in skill_names:
                if s.lower() in blob:
                    matched_skills.append(s)

            if matched_skills:
                score += min(len(matched_skills), 5)  # cap skill boost
                reasons.append("Matches your skills: " + ", ".join(matched_skills))

            # only include jobs with some meaningful match
            if score > 0:
                job.match_score = score
                job.recommended_reason = reasons
                results.append(job)

        # Sort by match_score first, then date
        results.sort(
            key=lambda j: (getattr(j, "match_score", 0), j.posted_date or "", j.cached_at or ""),
            reverse=True
        )

        return Response(RecommendedJobSerializer(results, many=True).data)
