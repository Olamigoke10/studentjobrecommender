from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .serializers import (
    RegisterSerializer,
    StudentProfileSerializer,
    SkillSerializer,
    EducationSerializer,
    ExperienceSerializer,
    CVSerializer,
    User,
)
from .models import StudentProfile, Skill, Education, Experience
from .token import EmailTokenObtainPairSerializer
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


class SkillListView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        skills = Skill.objects.all().order_by('name')
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)


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
        context = _build_cv_context(education_data, experience_data)
        if not context or context == "No education or experience listed yet.":
            return Response(
                {"detail": "Add at least one education or experience entry so we can generate a summary."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = f"""You are a professional CV writer for students and graduates. Based on the following CV information, write a short professional summary (2–4 sentences) suitable for a CV. Be concise, positive, and focus on strengths and goals. Write only the summary, no headings or labels.

CV information:
{context}
"""
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


