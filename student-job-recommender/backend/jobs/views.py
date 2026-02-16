from rest_framework import generics, permissions, views, status
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer
from jobs.services.adzuna import fetch_jobs, upsert_jobs_from_adzuna


# Create your views here.
class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Job.objects.all().order_by('-cached_at')
    

def _do_fetch_jobs(request):
    """Shared logic for fetching jobs from Adzuna and saving to DB."""
    search = request.data.get("search", "graduate")
    location = request.data.get("location", "United Kingdom")
    results_per_page = int(request.data.get("results_per_page", 50))
    page = int(request.data.get("page", 1))

    data, err = fetch_jobs(search, location, results_per_page, page)
    if err:
        return None, err

    results = data.get("results", [])
    saved_jobs, created_count, updated_count = upsert_jobs_from_adzuna(results)
    return (
        {
            "source_count": data.get("count"),
            "saved": len(saved_jobs),
            "created": created_count,
            "updated": updated_count,
            "jobs": JobSerializer(saved_jobs, many=True).data,
        },
        None,
    )


class FetchJobsView(views.APIView):
    """Admin-only: fetch jobs from Adzuna."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        payload, err = _do_fetch_jobs(request)
        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)
        return Response(payload, status=status.HTTP_200_OK)


class RefreshJobsView(views.APIView):
    """Any authenticated user can trigger a one-time fetch so the job list is populated."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        payload, err = _do_fetch_jobs(request)
        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)
        return Response(payload, status=status.HTTP_200_OK)
