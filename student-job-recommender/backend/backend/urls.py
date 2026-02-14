from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "status": "running",
        "message": "Student Job Recommender API is live 🚀",
        "endpoints": {
            "jobs": "/api/jobs/",
            "users": "/api/users/",
            "recommendations": "/api/recommendations/",
            "admin": "/admin/"
        }
    })


urlpatterns = [
    path("", home, name="home"),   # ✅ add this line

    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/recommendations/', include('recommendations.urls')),
]
