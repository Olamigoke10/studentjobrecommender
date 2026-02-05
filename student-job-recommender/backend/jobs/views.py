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
    

class FetchJobsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        search = request.data.get("search", "graduate")
        location = request.data.get("location", "London")
        results_per_page = int(request.data.get("results_per_page", 20))
        page = int(request.data.get("page", 1))

        data, err = fetch_jobs(search, location, results_per_page, page)
        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)

        results = data.get("results", [])
        saved_jobs, created_count, updated_count = upsert_jobs_from_adzuna(results)

        # Return clean response + saved jobs (serialized)
        return Response(
            {
                "source_count": data.get("count"),
                "saved": len(saved_jobs),
                "created": created_count,
                "updated": updated_count,
                "jobs": JobSerializer(saved_jobs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )    
