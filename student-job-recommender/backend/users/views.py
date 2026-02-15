from django.shortcuts import render

# Create your views here.
from rest_framework import generics,permissions
from .serializers import RegisterSerializer, StudentProfileSerializer
from .models import StudentProfile
from .token import EmailTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    

class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    

class EmailTokenObtainPairView(EmailTokenObtainPairSerializer):
    serializer_class = EmailTokenObtainPairSerializer
    
    
