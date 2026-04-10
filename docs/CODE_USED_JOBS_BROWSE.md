# Code Used - Jobs Browse and Refresh

## Source files

- `frontend/src/api/jobs.api.js`
- `student-job-recommender/backend/jobs/views.py`
- `student-job-recommender/backend/jobs/urls.py`

## 1) Frontend jobs API

```javascript
export const jobsAPI = {
  getJobs: (params = {}) => axiosInstance.get('/api/jobs/', { params }),
  refreshJobs: (body = {}) => axiosInstance.post('/api/jobs/refresh/', body),
};
```

## 2) Backend jobs list filter logic

```python
class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = JobListPagination

    def get_queryset(self):
        qs = Job.objects.all().order_by("-posted_date", "-cached_at")
        search = (self.request.query_params.get("search") or "").strip()
        location = (self.request.query_params.get("location") or "").strip()
        job_type = (self.request.query_params.get("job_type") or "").strip()
        if search:
            qs = qs.filter(_keyword_search_q(search))
        if location:
            qs = qs.filter(location__icontains=location)
        if job_type:
            qs = qs.filter(_job_type_filter_q(job_type))
        return qs
```

## 3) Backend refresh jobs from Adzuna

```python
class RefreshJobsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        payload, err = _do_fetch_jobs(request)
        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)
        return Response(payload, status=status.HTTP_200_OK)
```

## 4) Jobs routes

```python
urlpatterns = [
    path("", JobListView.as_view(), name="job_list"),
    path("fetch/", FetchJobsView.as_view(), name="fetch_jobs"),
    path("refresh/", RefreshJobsView.as_view(), name="refresh_jobs"),
]
```
