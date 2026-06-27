import api from './api';

export const login = async (payload) => {
  // If user provided an email, send it as `email` so backend can resolve username
  const { username, password } = payload;
  const body = username && username.includes('@') ? { email: username, password } : { username, password };
  const response = await api.post('/api/auth/login/', body);
  localStorage.setItem('accessToken', response.data.access);
  localStorage.setItem('refreshToken', response.data.refresh);
  return response.data;
};

export const signup = async (payload) => {
  return api.post('/api/users/', payload);
};

export const getProfile = async () => {
  return api.get('/api/users/me/');
};

export const updateRole = async (role) => {
  // Fetch current user to get their id, then PATCH to update role
  const profile = await getProfile();
  const userId = profile.data.id;
  return api.patch(`/api/users/${userId}/`, { role });
};
