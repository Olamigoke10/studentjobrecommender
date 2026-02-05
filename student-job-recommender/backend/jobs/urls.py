from django.urls import path

from jobs.views_saved import SavedJobListView, SaveJobToggleView
from .views import JobListView, FetchJobsView

urlpatterns = [
    path("", JobListView.as_view(), name="job_list"),
    path("fetch/", FetchJobsView.as_view(), name="fetch_jobs"),
    
    path("saved/", SavedJobListView.as_view(), name="saved_jobs"),
    path("<int:job_id>/", SaveJobToggleView.as_view(), name="save_job"),
]