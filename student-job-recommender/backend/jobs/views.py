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
    search = request.data.get("search")  # None = use defaults/fallbacks
    location = request.data.get("location")
    results_per_page = int(request.data.get("results_per_page", 50))
    page = int(request.data.get("page", 1))

    # Try primary query then fallbacks so we get results even if one query is empty
    queries = [
        (search or "graduate", location or "United Kingdom"),
        ("graduate", "London"),
        ("job", "United Kingdom"),
        ("software", "London"),
    ]
    all_saved_jobs = []
    total_created = 0
    total_updated = 0
    last_count = 0

    for search_term, loc in queries:
        data, err = fetch_jobs(search_term, loc or "United Kingdom", results_per_page, page)
        if err:
            if not all_saved_jobs:
                return None, err
            break
        # Adzuna can return list under "results" or (legacy) top-level list
        results = data.get("results")
        if results is None and isinstance(data, list):
            results = data
        results = results or []
        last_count = data.get("count", 0)
        if not results:
            continue
        saved_jobs, created_count, updated_count = upsert_jobs_from_adzuna(results)
        all_saved_jobs.extend(saved_jobs)
        total_created += created_count
        total_updated += updated_count
        if len(all_saved_jobs) >= 20:
            break

    # Deduplicate by id for response (same job might appear in multiple queries)
    seen_ids = set()
    unique_jobs = []
    for j in all_saved_jobs:
        if j.id not in seen_ids:
            seen_ids.add(j.id)
            unique_jobs.append(j)

    payload = {
        "source_count": last_count,
        "saved": len(unique_jobs),
        "created": total_created,
        "updated": total_updated,
        "jobs": JobSerializer(unique_jobs[:50], many=True).data,
    }
    if not unique_jobs:
        payload["hint"] = "The job partner returned no results. Check ADZUNA_APP_ID and ADZUNA_APP_KEY on Render and that your Adzuna app is for country 'gb'."
    return (payload, None)


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
