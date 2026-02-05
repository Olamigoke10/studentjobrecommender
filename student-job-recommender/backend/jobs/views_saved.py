from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Job, SavedJob
from .serializers import JobSerializer


class SavedJobListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = request.user.studentprofile  # assumes OneToOne user->StudentProfile
        qs = Job.objects.filter(saved_by_students__student=student).order_by("-saved_by_students__saved_at")
        return Response(JobSerializer(qs, many=True).data)


class SaveJobToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        student = request.user.studentprofile
        job = get_object_or_404(Job, id=job_id)

        obj, created = SavedJob.objects.get_or_create(student=student, job=job)
        if created:
            return Response({"saved": True}, status=status.HTTP_201_CREATED)
        return Response({"saved": True}, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        student = request.user.studentprofile
        job = get_object_or_404(Job, id=job_id)

        SavedJob.objects.filter(student=student, job=job).delete()
        return Response({"saved": False}, status=status.HTTP_200_OK)
