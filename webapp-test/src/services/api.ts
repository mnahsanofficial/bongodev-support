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
  return apiClient.get('/api/auth/me');
};

export const createPost = async (text: string) => {
  return apiClient.post('/api/me/posts', { text });
};

export const likePost = async (postId: number) => {
  return apiClient.post(`/api/posts/${postId}/like`);
};

export const unlikePost = async (postId: number) => {
  return apiClient.delete(`/api/posts/${postId}/like`);
};

// Function to get user's own timeline
export const getMyTimeline = async (page: number = 1, limit: number = 10) => {
  return apiClient.get('/api/me/timeline', { params: { page, limit } });
};

// Function to get all posts (public feed)
export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  return apiClient.get('/api/posts', { params: { page, limit } });
};

export const getPostById = async (id: number, loggedInUserId?: number) => {
  const config = loggedInUserId ? { headers: { 'user-id': loggedInUserId } } : {};
  return apiClient.get(`/api/posts/${id}`, config);
};


// User profile related APIs
export const getUserById = async (userId: number) => {
  return apiClient.get(`/api/users/${userId}`);
};

export const getPostsByUserId = async (userId: number, page: number = 1, limit: number = 10) => {
  return apiClient.get(`/api/users/${userId}/posts`, { params: { page, limit } });
};

export const followUser = async (userId: number) => {
  return apiClient.post(`/api/users/${userId}/follow`);
};

export const unfollowUser = async (userId: number) => {
  return apiClient.delete(`/api/users/${userId}/follow`);
};

// Post deletion API
export const deletePost = async (postId: number) => {
  return apiClient.delete(`/api/me/posts/${postId}`);
};
export const getIsFollowing = async (userId: number) => {
  return apiClient.get<{ isFollowing: boolean }>(`/api/users/${userId}/is-following`);
};

// Comment APIs
export const createComment = async (commentData: { text: string; postId: number; parentId?: number }) => {
  return apiClient.post('/api/comments', commentData);
};

export const getCommentsByPostId = async (postId: number) => {
  return apiClient.get(`/api/comments/post/${postId}`);
};

export const addCommentReaction = async (commentId: number, reactionType: string) => {
  return apiClient.post(`/api/comments/${commentId}/reactions`, { reactionType });
};

export const removeCommentReaction = async (commentId: number, reactionType: string) => {
  return apiClient.delete(`/api/comments/${commentId}/reactions`, { data: { reactionType } });
};

export default apiClient;
