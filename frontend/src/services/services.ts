import api from './api';
import type { PreAuthRequest, DashboardStats } from '../types';

export const preauthService = {
  getStats: () => api.get<{ data: DashboardStats }>('/preauth/stats'),
  getAll: (params?: Record<string, string>) => api.get('/preauth', { params }),
  getById: (id: string) => api.get(`/preauth/${id}`),
  create: (data: Partial<PreAuthRequest>) => api.post('/preauth', data),
  update: (id: string, data: Partial<PreAuthRequest>) => api.put(`/preauth/${id}`, data),
  submit: (id: string) => api.post(`/preauth/${id}/submit`),
  updateStatus: (id: string, status: string, remarks?: string, approvedAmount?: number) =>
    api.patch(`/preauth/${id}/status`, { status, remarks, approvedAmount }),
  seedSamples: () => api.post('/preauth/seed-samples'),
};

export const documentService = {
  getByRequest: (requestId: string) => api.get(`/documents/${requestId}`),
  upload: (formData: FormData) =>
    api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/documents/${id}`),
  updateStatus: (id: string, verificationStatus: string, verificationNote?: string) =>
    api.patch(`/documents/${id}/status`, { verificationStatus, verificationNote }),
};

export const aiService = {
  analyze: (requestId: string) => api.post(`/ai/analyze/${requestId}`),
  getAnalysis: (requestId: string) => api.get(`/ai/analysis/${requestId}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: Record<string, string>) => api.put('/auth/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getPending: () => api.get('/admin/pending'),
  getAllUsers: (role?: string) => api.get('/admin/users', { params: role ? { role } : {} }),
  approveUser: (userId: string) => api.post(`/admin/approve/${userId}`),
  rejectUser: (userId: string) => api.post(`/admin/reject/${userId}`),
  deactivateUser: (userId: string) => api.post(`/admin/deactivate/${userId}`),
  addDoctor: (data: Record<string, string>) => api.post('/admin/add-doctor', data),
  addInsurer: (data: Record<string, string>) => api.post('/admin/add-insurer', data),
};

