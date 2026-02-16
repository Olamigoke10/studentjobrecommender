from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, views
from rest_framework.response import Response
from .serializers import RegisterSerializer, StudentProfileSerializer, SkillSerializer, User
from .models import StudentProfile, Skill
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


