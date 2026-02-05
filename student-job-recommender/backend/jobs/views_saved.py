from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from users.models import StudentProfile
from .models import Job, SavedJob
from .serializers import JobSerializer


class SavedJobListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)  # safe
        qs = Job.objects.filter(
            saved_by_students__student=student
        ).order_by("-saved_by_students__saved_at")
        return Response(JobSerializer(qs, many=True).data)


class SaveJobToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        student = get_object_or_404(StudentProfile, user=request.user)
        job = get_object_or_404(Job, id=job_id)

        obj, created = SavedJob.objects.get_or_create(student=student, job=job)
        return Response({"saved": True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, job_id):
        student = request.user.profile
        job = get_object_or_404(Job, id=job_id)

        SavedJob.objects.filter(student=student, job=job).delete()
        return Response({"saved": False}, status=status.HTTP_200_OK)
