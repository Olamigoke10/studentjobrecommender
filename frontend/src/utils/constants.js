export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  JOBS: '/jobs',
  SAVED_JOBS: '/saved-jobs',
  APPLICATIONS: '/applications',
  RECOMMENDATIONS: '/recommendations',
  PROFILE: '/profile',
  CV: '/cv',
};

export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'saved', label: 'Saved' },
];

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Remote',
];

export const COURSES = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science',
  'Cybersecurity',
  'Business Information Systems',
  'Other',
];