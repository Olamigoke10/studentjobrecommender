from django.urls import path
from .views import (
    EmailTokenObtainPairView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    RegisterView,
    StudentProfileView,
    SkillListView,
    AdminStatsView,
    AdminSkillListCreateView,
    AdminSkillDetailView,
    SkillFieldListView,
    CourseListView,
    CVView,
    CVAISummaryView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", StudentProfileView.as_view(), name="student_profile"),
    path("skills/", SkillListView.as_view(), name="skill_list"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("admin/skills/", AdminSkillListCreateView.as_view(), name="admin_skill_list"),
    path("admin/skills/<int:pk>/", AdminSkillDetailView.as_view(), name="admin_skill_detail"),
    path("admin/skill-fields/", SkillFieldListView.as_view(), name="admin_skill_fields"),
    path("courses/", CourseListView.as_view(), name="course_list"),
    path("me/cv/", CVView.as_view(), name="cv"),
    path("me/cv/ai-summary/", CVAISummaryView.as_view(), name="cv_ai_summary"),
]



