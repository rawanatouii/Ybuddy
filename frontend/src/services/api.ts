import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => err.config?.url?.includes(url));
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?reason=session-expired';
    }
    return Promise.reject(err);
  },
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  me: () => api.get('/auth/me'),
};

export const clientsApi = {
  saveProfile: (data: object) => api.post('/clients/profile', data),
  getProfile: () => api.get('/clients/profile'),
  getAll: () => api.get('/clients'),
  getById: (id: number) => api.get(`/clients/${id}`),
};

export const coachesApi = {
  getAll: () => api.get('/coaches'),
  getBySlug: (slug: string) => api.get(`/coaches/slug/${slug}`),
};

export const requestsApi = {
  create: (coachSlug: string) => api.post(`/requests/${coachSlug}`),
  getCoachRequests: () => api.get('/requests/coach/mine'),
  getClientRequests: () => api.get('/requests/client/mine'),
  updateStatus: (id: number, status: string) => api.patch(`/requests/${id}/status`, { status }),
};

export const exercisesApi = {
  getAll: (muscleGroup?: string) => api.get('/exercises', { params: muscleGroup ? { muscleGroup } : {} }),
  create: (data: object) => api.post('/exercises', data),
  update: (id: number, data: object) => api.put(`/exercises/${id}`, data),
  delete: (id: number) => api.delete(`/exercises/${id}`),
};

export const programsApi = {
  create: (data: object) => api.post('/programs', data),
  getCoachPrograms: () => api.get('/programs/coach/mine'),
  getClientPrograms: () => api.get('/programs/client/mine'),
  getById: (id: number) => api.get(`/programs/${id}`),
  send: (id: number) => api.post(`/programs/${id}/send`),
  addExercise: (dayId: number, data: object) => api.post(`/programs/day/${dayId}/exercises`, data),
  removeExercise: (peId: number) => api.delete(`/programs/day/exercise/${peId}`),
  setDayType: (dayId: number, type: string) => api.patch(`/programs/day/${dayId}/type`, { type }),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};
