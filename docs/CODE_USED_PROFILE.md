# Code Used - Profile Management

## Source files

- `frontend/src/pages/Profile.jsx`
- `frontend/src/api/auth.api.js`
- `student-job-recommender/backend/users/views.py`

## 1) Frontend load profile and skills

```javascript
const loadProfile = useCallback(async () => {
  const response = await authAPI.getProfile();
  const d = response.data;
  updateUser(d);
  setFormData({
    name: d.name || '',
    course: d.course || '',
    preferred_job_type: d.preferred_job_type || 'graduate',
    preferred_location: d.preferred_location || '',
    skills_ids: d.skills ? d.skills.map((s) => s.id) : [],
  });
}, [updateUser]);

const loadSkills = useCallback(async (courseValue) => {
  const response = await authAPI.getSkills(courseValue);
  setSkills(Array.isArray(response.data) ? response.data : []);
}, []);
```

## 2) Frontend save profile

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  await authAPI.updateProfile(formData);
  const response = await authAPI.getProfile();
  updateUser(response.data);
};
```

## 3) Backend student profile endpoint

```python
class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile
```

## 4) Backend skills and courses support

```python
class SkillListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        course = (request.query_params.get("course") or "").strip()
        if course:
            skills = skills_queryset_for_course(course)
        else:
            skills = Skill.objects.all().prefetch_related("fields").order_by("name")
        return Response(SkillSerializer(skills, many=True).data)

class CourseListView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        from .courses_data import COURSES
        return Response(COURSES)
```
