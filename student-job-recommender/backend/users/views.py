from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

# Create your views here.
from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .skill_query import skills_queryset_for_course
from .serializers import (
    RegisterSerializer,
    StudentProfileSerializer,
    SkillSerializer,
    SkillFieldSerializer,
    EducationSerializer,
    ExperienceSerializer,
    CVSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    User,
)
from .models import StudentProfile, Skill, SkillField, Education, Experience
from .token import EmailTokenObtainPairSerializer
from jobs.models import Job, SavedJob, ApplicationTracker
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()  
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    

class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class PasswordResetRequestView(views.APIView):
    """POST { email } — sends reset link (same response whether user exists)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()

        generic_msg = (
            "If an account exists for this email, you will receive password reset instructions shortly."
        )

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
            query = urlencode({"uid": uid, "token": token})
            reset_url = f"{frontend}/reset-password?{query}"
            subject = "Reset your Talent Path password"
            body = (
                f"Hi,\n\n"
                f"We received a request to reset the password for your account.\n\n"
                f"Open this link to choose a new password (it expires after a while):\n{reset_url}\n\n"
                f"If you did not request this, you can ignore this email.\n"
            )
            try:
                send_mail(
                    subject,
                    body,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception:
                return Response(
                    {
                        "detail": "We could not send the reset email. Check server email settings or try again later.",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        return Response({"detail": generic_msg}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    """POST { uid, token, new_password } — completes reset after user follows email link."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid_b64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid or expired reset link. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response(
                {"new_password": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Your password has been reset. You can sign in now."}, status=status.HTTP_200_OK)


class SkillListView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        course = (request.query_params.get("course") or "").strip()
        if not course and request.user and request.user.is_authenticated:
            profile = getattr(request.user, "profile", None)
            course = (getattr(profile, "course", "") or "").strip()
        if course:
            skills = skills_queryset_for_course(course)
        else:
            skills = Skill.objects.all().prefetch_related("fields").order_by("name")
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)


class SkillFieldListView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        fields = SkillField.objects.all().order_by("name")
        return Response(SkillFieldSerializer(fields, many=True).data)


class AdminStatsView(views.APIView):
    """Aggregate counts for staff dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            "users_count": User.objects.count(),
            "student_profiles_count": StudentProfile.objects.count(),
            "jobs_count": Job.objects.count(),
            "skills_count": Skill.objects.count(),
            "skill_fields_count": SkillField.objects.count(),
            "saved_jobs_count": SavedJob.objects.count(),
            "applications_count": ApplicationTracker.objects.count(),
        })


class AdminSkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Skill.objects.all().prefetch_related("fields").order_by("name")
    serializer_class = SkillSerializer


class AdminSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Skill.objects.all().prefetch_related("fields").order_by("name")
    serializer_class = SkillSerializer


class CourseListView(views.APIView):
    """Return list of course/degree names for sign-up and profile. No auth required."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .courses_data import COURSES
        return Response(COURSES)


class CVView(views.APIView):
    """GET: full CV data. PUT: update summary, education, experience."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        education = Education.objects.filter(student=profile)
        experience = Experience.objects.filter(student=profile)
        skills = list(profile.skills.values_list("name", flat=True))
        return Response({
            "summary": profile.cv_summary or "",
            "course": profile.course or "",
            "skills": skills,
            "email": request.user.email,
            "name": (profile.name or "").strip() or None,
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
        })

    def put(self, request):
        profile = get_object_or_404(StudentProfile, user=request.user)
        summary = request.data.get("summary", "")
        education_data = request.data.get("education") or []
        experience_data = request.data.get("experience") or []

        profile.cv_summary = (summary or "").strip()
        profile.save()

        Education.objects.filter(student=profile).delete()
        for i, item in enumerate(education_data):
            Education.objects.create(
                student=profile,
                institution=(item.get("institution") or "").strip(),
                degree=(item.get("degree") or "").strip(),
                subject=(item.get("subject") or "").strip(),
                start_date=(item.get("start_date") or "").strip(),
                end_date=(item.get("end_date") or "").strip(),
                description=(item.get("description") or "").strip(),
                order=i,
            )

        Experience.objects.filter(student=profile).delete()
        for i, item in enumerate(experience_data):
            Experience.objects.create(
                student=profile,
                company=(item.get("company") or "").strip(),
                role=(item.get("role") or "").strip(),
                start_date=(item.get("start_date") or "").strip(),
                end_date=(item.get("end_date") or "").strip(),
                description=(item.get("description") or "").strip(),
                order=i,
            )

        education = Education.objects.filter(student=profile)
        experience = Experience.objects.filter(student=profile)
        skills = list(profile.skills.values_list("name", flat=True))
        return Response({
            "summary": profile.cv_summary or "",
            "course": profile.course or "",
            "skills": skills,
            "email": request.user.email,
            "name": (profile.name or "").strip() or None,
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
        }, status=status.HTTP_200_OK)


def _build_cv_context(education_data, experience_data):
    """Build a short text context from education and experience for the AI prompt."""
    parts = []
    if education_data:
        parts.append("Education:")
        for e in education_data:
            if e.get("institution") or e.get("degree") or e.get("subject"):
                line = " - "
                if e.get("degree") and e.get("subject"):
                    line += f"{e.get('degree')} {e.get('subject')}"
                else:
                    line += e.get("degree") or e.get("subject") or ""
                if e.get("institution"):
                    line += f" at {e.get('institution')}"
                if e.get("start_date") or e.get("end_date"):
                    line += f" ({e.get('start_date', '')} – {e.get('end_date', '')})"
                if e.get("description"):
                    line += f". {e.get('description')}"
                parts.append(line)
    if experience_data:
        parts.append("Experience:")
        for x in experience_data:
            if x.get("company") or x.get("role"):
                line = f" - {x.get('role', '')} at {x.get('company', '')}"
                if x.get("start_date") or x.get("end_date"):
                    line += f" ({x.get('start_date', '')} – {x.get('end_date', '')})"
                if x.get("description"):
                    line += f". {x.get('description')}"
                parts.append(line)
    return "\n".join(parts) if parts else "No education or experience listed yet."


class CVAISummaryView(views.APIView):
    """POST: generate a professional CV summary using AI from education + experience."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import os
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return Response(
                {"detail": "AI summary is not configured. Add OPENAI_API_KEY on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        education_data = request.data.get("education") or []
        experience_data = request.data.get("experience") or []
        current_summary = (request.data.get("current_summary") or "").strip()
        job_id = request.data.get("job_id")
        context = _build_cv_context(education_data, experience_data)
        if not context or context == "No education or experience listed yet.":
            return Response(
                {"detail": "Add at least one education or experience entry so we can generate a summary."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        job_context = ""
        if job_id:
            job = Job.objects.filter(id=job_id).first()
            if job:
                desc = (job.description or "")[:800]
                job_context = (
                    f"\n\nTarget job:\n"
                    f"Title: {job.title}\n"
                    f"Company: {job.company or 'N/A'}\n"
                    f"Location: {job.location or 'N/A'}\n"
                    f"Type: {job.job_type or 'N/A'}\n"
                    f"Description: {desc}\n"
                )
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = (
                "You are a professional CV writer for students and graduates. "
                "Based on the following CV information, write a short professional summary (2–4 sentences) "
                "suitable for a CV. Be concise, positive, and focus on strengths and goals. "
                "Write only the summary, no headings or labels."
            )
            if job_context:
                prompt += (
                    " Tailor the summary towards the following target job, but keep it reusable for similar roles."
                )
            prompt += f"\n\nCV information:\n{context}{job_context}\n"
            if current_summary:
                prompt += f"\nCurrent summary (they can keep or replace): {current_summary}\n"
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
            )
            summary = (response.choices[0].message.content or "").strip()
            if not summary:
                return Response(
                    {"detail": "AI did not return a summary. Please try again."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response({"summary": summary}, status=status.HTTP_200_OK)
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "quota" in err_str or "insufficient_quota" in err_str:
                return Response(
                    {"detail": "AI service limit reached. Check your OpenAI plan and billing at platform.openai.com, or try again later."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            if "rate" in err_str or "limit" in err_str:
                return Response(
                    {"detail": "AI is busy. Please wait a moment and try again."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response(
                {"detail": "AI summary is temporarily unavailable. Please try again later."},
                status=status.HTTP_502_BAD_GATEWAY,
            )


