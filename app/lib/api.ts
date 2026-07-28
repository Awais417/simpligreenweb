import type { Job, InstallerType, Role, Task, TaskMedia, User } from './types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> | undefined) };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(data.error || data.message || 'Something went wrong', res.status);
  }
  return data as T;
}

function toFormData(fields: Record<string, string | File | undefined | null>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) fd.append(key, value);
  }
  return fd;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  installerTypeId?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  installerTypeId?: string | null;
}

export interface CreateInstallerTypePayload {
  name: string;
  requiresCertificate: boolean;
}

export interface CreateJobPayload {
  title: string;
  address?: string;
  description?: string;
  managerId: string;
  qaId: string;
}

export interface CreateTaskPayload {
  description: string;
  installerId: string;
  sequenceNumber: number;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
        false,
      ),

    me: () => request<User>('/api/auth/me'),

    updateProfile: (fields: { name?: string; avatar?: File }) =>
      request<User>('/api/auth/profile', { method: 'POST', body: toFormData(fields) }),

    forgotPassword: (email: string) =>
      request<{ message: string }>(
        '/api/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) },
        false,
      ),

    resetPassword: (token: string, password: string) =>
      request<{ message: string }>(
        '/api/auth/reset-password',
        { method: 'POST', body: JSON.stringify({ token, password }) },
        false,
      ),
  },

  admin: {
    listUsers: (role?: Role) => request<User[]>(`/api/admin/users${role ? `?role=${role}` : ''}`),
    createUser: (payload: CreateUserPayload) =>
      request<User>('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
    updateUser: (id: string, payload: UpdateUserPayload) =>
      request<User>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteUser: (id: string) => request<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),

    listInstallerTypes: () => request<InstallerType[]>('/api/admin/installer-types'),
    createInstallerType: (payload: CreateInstallerTypePayload) =>
      request<InstallerType>('/api/admin/installer-types', { method: 'POST', body: JSON.stringify(payload) }),
    updateInstallerType: (id: string, payload: Partial<CreateInstallerTypePayload>) =>
      request<InstallerType>(`/api/admin/installer-types/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteInstallerType: (id: string) =>
      request<void>(`/api/admin/installer-types/${id}`, { method: 'DELETE' }),

    listJobs: () => request<Job[]>('/api/admin/jobs'),
    createJob: (payload: CreateJobPayload) =>
      request<Job>('/api/admin/jobs', { method: 'POST', body: JSON.stringify(payload) }),
    getJob: (id: string) => request<Job>(`/api/admin/jobs/${id}`),
    downloadJobPdf: async (id: string): Promise<Blob> => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/jobs/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new ApiError('Failed to download PDF report', res.status);
      return res.blob();
    },
  },

  manager: {
    listInstallers: () => request<User[]>('/api/manager/installers'),
    listJobs: () => request<Job[]>('/api/manager/jobs'),
    getJob: (id: string) => request<Job>(`/api/manager/jobs/${id}`),
    createTask: (jobId: string, payload: CreateTaskPayload) =>
      request<Task>(`/api/manager/jobs/${jobId}/tasks`, { method: 'POST', body: JSON.stringify(payload) }),
    submitJobToQA: (jobId: string) =>
      request<{ message: string }>(`/api/manager/jobs/${jobId}/submit-to-qa`, { method: 'POST' }),
    approveTask: (taskId: string, comments?: string) =>
      request<{ message: string; nextTaskUnlocked: boolean }>(`/api/manager/tasks/${taskId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      }),
    rejectTask: (taskId: string, comments: string, newInstallerId?: string) =>
      request<{ message: string }>(`/api/manager/tasks/${taskId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comments, newInstallerId }),
      }),
  },

  installer: {
    listTasks: () => request<Task[]>('/api/installer/tasks'),
    getTask: (id: string) => request<Task>(`/api/installer/tasks/${id}`),
    uploadMedia: (taskId: string, file: File, fileType: 'image' | 'certificate') =>
      request<TaskMedia>(`/api/installer/tasks/${taskId}/media`, {
        method: 'POST',
        body: toFormData({ file, fileType }),
      }),
    deleteMedia: (taskId: string, mediaId: string) =>
      request<void>(`/api/installer/tasks/${taskId}/media/${mediaId}`, { method: 'DELETE' }),
    submitTask: (taskId: string) =>
      request<{ message: string }>(`/api/installer/tasks/${taskId}/submit`, { method: 'POST' }),
  },

  qa: {
    listJobs: () => request<Job[]>('/api/qa/jobs'),
    getJob: (id: string) => request<Job>(`/api/qa/jobs/${id}`),
    approveJob: (jobId: string, comments?: string) =>
      request<{ message: string }>(`/api/qa/jobs/${jobId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      }),
    rejectJob: (jobId: string, comments: string) =>
      request<{ message: string }>(`/api/qa/jobs/${jobId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      }),
  },
};

export function avatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) return null;
  return `${API_BASE}/uploads/${avatar}`;
}

export function mediaUrl(filePath: string): string {
  const clean = filePath.replace(/\\/g, '/');
  return clean.startsWith('uploads/') ? `${API_BASE}/${clean}` : `${API_BASE}/uploads/${clean.split('/').pop()}`;
}
