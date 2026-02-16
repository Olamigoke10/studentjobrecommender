from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from users.models import StudentProfile
from .models import Job, ApplicationTracker
from .serializers import ApplicationTrackerSerializer


class ApplicationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)
        qs = ApplicationTracker.objects.filter(student=student).select_related("job").order_by("-updated_at")
        return Response(ApplicationTrackerSerializer(qs, many=True).data)

    def post(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)
        job_id = request.data.get("job_id")
        if not job_id:
            return Response({"job_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        job = get_object_or_404(Job, id=job_id)
        status_val = request.data.get("status", "applied")
        if status_val not in dict(ApplicationTracker.APPLICATION_STATUS_CHOICES):
            status_val = "applied"
        notes = (request.data.get("notes") or "").strip()
        obj, created = ApplicationTracker.objects.update_or_create(
            student=student,
            job=job,
            defaults={"status": status_val, "notes": notes},
        )
        return Response(
            ApplicationTrackerSerializer(obj).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ApplicationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        student = get_object_or_404(StudentProfile, user=request.user)
        app = get_object_or_404(ApplicationTracker, id=pk, student=student)
        if "status" in request.data:
            val = request.data["status"]
            if val in dict(ApplicationTracker.APPLICATION_STATUS_CHOICES):
                app.status = val
        if "notes" in request.data:
            app.notes = (request.data["notes"] or "").strip()
        app.save()
        return Response(ApplicationTrackerSerializer(app).data)

    def delete(self, request, pk):
        student = get_object_or_404(StudentProfile, user=request.user)
        app = get_object_or_404(ApplicationTracker, id=pk, student=student)
        app.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
