import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', 
});

let token: string | null = null;

export const setAuthToken = (newToken: string | null) => {
  token = newToken;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const loginUser = async (credentials: any) => {
  return apiClient.post('/api/auth/login', credentials);
};

export const registerUser = async (userData: any) => {
  return apiClient.post('/api/auth/register', userData);
};

// Example of a protected route, can be expanded later
export const getMyProfile = async () => {
  return apiClient.get('/api/me');
};

export const postMurmur = async (text: string) => {
  return apiClient.post('/api/me/murmurs', { text });
};

export const likeMurmur = async (murmurId: number) => {
  return apiClient.post(`/api/murmurs/${murmurId}/like`);
};

export const unlikeMurmur = async (murmurId: number) => {
  return apiClient.delete(`/api/murmurs/${murmurId}/like`);
};

// Function to get user's own timeline
export const getMyTimeline = async (page: number = 1, limit: number = 10) => {
  return apiClient.get('/api/me/timeline', { params: { page, limit } });
};

// Function to get all murmurs (public feed)
export const getAllMurmurs = async (page: number = 1, limit: number = 10) => {
  return apiClient.get('/api/murmurs', { params: { page, limit } });
};

export const getMurmurById = async (id: number) => {
  return apiClient.get(`/api/murmurs/${id}`);
};

// User profile related APIs
export const getUserById = async (userId: number) => {
  return apiClient.get(`/api/users/${userId}`);
};

export const getMurmursByUserId = async (userId: number, page: number = 1, limit: number = 10) => {
  return apiClient.get(`/api/users/${userId}/murmurs`, { params: { page, limit } });
};

export const followUser = async (userId: number) => {
  return apiClient.post(`/api/users/${userId}/follow`);
};

export const unfollowUser = async (userId: number) => {
  return apiClient.delete(`/api/users/${userId}/follow`);
};

// Murmur deletion API - note the path from the subtask description
export const deleteMurmur = async (murmurId: number) => {
  return apiClient.delete(`/api/me/murmurs/${murmurId}`);
};

export default apiClient;
