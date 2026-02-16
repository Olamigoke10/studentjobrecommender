from django.urls import path
from .views import (
    EmailTokenObtainPairView,
    RegisterView,
    StudentProfileView,
    SkillListView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", StudentProfileView.as_view(), name="student_profile"),
    path("skills/", SkillListView.as_view(), name="skill_list"),
]



