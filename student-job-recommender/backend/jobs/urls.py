from django.urls import path

from jobs.views_saved import SavedJobListView, SaveJobToggleView
from jobs.views_applications import ApplicationListView, ApplicationDetailView
from .views import JobListView, FetchJobsView, RefreshJobsView

urlpatterns = [
    path("", JobListView.as_view(), name="job_list"),
    path("fetch/", FetchJobsView.as_view(), name="fetch_jobs"),
    path("refresh/", RefreshJobsView.as_view(), name="refresh_jobs"),
    path("saved/", SavedJobListView.as_view(), name="saved_jobs"),
    path("applications/", ApplicationListView.as_view(), name="application_list"),
    path("applications/<int:pk>/", ApplicationDetailView.as_view(), name="application_detail"),
    path("<int:job_id>/", SaveJobToggleView.as_view(), name="save_job"),
]