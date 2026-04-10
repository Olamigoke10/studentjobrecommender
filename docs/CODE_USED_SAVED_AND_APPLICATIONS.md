# Code Used - Saved Jobs and Applications

## Source files

- `frontend/src/api/jobs.api.js`
- `student-job-recommender/backend/jobs/views_saved.py`
- `student-job-recommender/backend/jobs/views_applications.py`
- `student-job-recommender/backend/jobs/urls.py`

## 1) Frontend saved/applications API

```javascript
export const jobsAPI = {
  getSavedJobs: () => axiosInstance.get('/api/jobs/saved/'),
  saveJob: (jobId) => axiosInstance.post(`/api/jobs/${jobId}/`),
  unsaveJob: (jobId) => axiosInstance.delete(`/api/jobs/${jobId}/`),
  getApplications: () => axiosInstance.get('/api/jobs/applications/'),
  createApplication: (jobId, data = {}) =>
    axiosInstance.post('/api/jobs/applications/', { job_id: jobId, ...data }),
  updateApplication: (applicationId, data) =>
    axiosInstance.patch(`/api/jobs/applications/${applicationId}/`, data),
  deleteApplication: (applicationId) =>
    axiosInstance.delete(`/api/jobs/applications/${applicationId}/`),
};
```

## 2) Backend save/unsave toggle

```python
class SaveJobToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        student = get_object_or_404(StudentProfile, user=request.user)
        job = get_object_or_404(Job, id=job_id)
        obj, created = SavedJob.objects.get_or_create(student=student, job=job)
        return Response({"saved": True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, job_id):
        student = get_object_or_404(StudentProfile, user=request.user)
        job = get_object_or_404(Job, id=job_id)
        SavedJob.objects.filter(student=student, job=job).delete()
        return Response({"saved": False}, status=status.HTTP_200_OK)
```

## 3) Backend application tracker create/update

```python
class ApplicationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student = get_object_or_404(StudentProfile, user=request.user)
        job_id = request.data.get("job_id")
        job = get_object_or_404(Job, id=job_id)
        status_val = request.data.get("status", "applied")
        notes = (request.data.get("notes") or "").strip()
        obj, created = ApplicationTracker.objects.update_or_create(
            student=student,
            job=job,
            defaults={"status": status_val, "notes": notes},
        )
        return Response(ApplicationTrackerSerializer(obj).data, status=201 if created else 200)
```

## 4) Saved and applications routes

```python
urlpatterns = [
    path("saved/", SavedJobListView.as_view(), name="saved_jobs"),
    path("applications/", ApplicationListView.as_view(), name="application_list"),
    path("applications/<int:pk>/", ApplicationDetailView.as_view(), name="application_detail"),
    path("<int:job_id>/", SaveJobToggleView.as_view(), name="save_job"),
]
```
