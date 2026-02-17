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
            "name": (getattr(request.user, "first_name", "") or "").strip() or None,
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
            "name": (getattr(request.user, "first_name", "") or "").strip() or None,
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
        }, status=status.HTTP_200_OK)


