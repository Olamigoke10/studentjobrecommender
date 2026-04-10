# Code Used - Admin Module

## Source files

- `frontend/src/api/admin.api.js`
- `frontend/src/pages/AdminDashboard.jsx`
- `student-job-recommender/backend/users/views.py`

## 1) Frontend admin API

```javascript
export const adminAPI = {
  getStats: () => axiosInstance.get('/api/users/admin/stats/'),
  getSkills: () => axiosInstance.get('/api/users/admin/skills/'),
  getSkillFields: () => axiosInstance.get('/api/users/admin/skill-fields/'),
  createSkill: (name, fieldIds = []) =>
    axiosInstance.post('/api/users/admin/skills/', { name: name.trim(), field_ids: fieldIds }),
  updateSkill: (id, name, fieldIds) =>
    axiosInstance.patch(`/api/users/admin/skills/${id}/`, {
      name: name.trim(),
      ...(fieldIds !== undefined ? { field_ids: fieldIds } : {}),
    }),
  deleteSkill: (id) => axiosInstance.delete(`/api/users/admin/skills/${id}/`),
};
```

## 2) Frontend admin page data loading

```javascript
const loadStats = useCallback(async () => {
  const res = await adminAPI.getStats();
  setStats(res.data);
}, []);

const loadSkills = useCallback(async () => {
  const res = await adminAPI.getSkills();
  setSkills(res.data || []);
}, []);
```

## 3) Backend admin stats and skill endpoints

```python
class AdminStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        return Response({
            "users_count": User.objects.count(),
            "student_profiles_count": StudentProfile.objects.count(),
            "jobs_count": Job.objects.count(),
            "skills_count": Skill.objects.count(),
            "skill_fields_count": SkillField.objects.count(),
            "saved_jobs_count": SavedJob.objects.count(),
            "applications_count": ApplicationTracker.objects.count(),
        })

class AdminSkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Skill.objects.all().prefetch_related("fields").order_by("name")
    serializer_class = SkillSerializer
```
