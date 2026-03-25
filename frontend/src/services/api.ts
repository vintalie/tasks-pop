const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : `${window.location.origin}/api`);

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.errors?.email?.[0] || 'Erro na requisição');
  }

  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request<User>('/auth/me'),
  },
  tasks: {
    list: (params?: { type?: string; all?: boolean }) => {
      const sp = new URLSearchParams();
      if (params?.type) sp.set('type', params.type);
      if (params?.all) sp.set('all', '1');
      const q = sp.toString() ? `?${sp}` : '';
      return request<{ data: Task[] }>(`/tasks${q}`);
    },
    get: (id: number) => request<Task>(`/tasks/${id}`),
    create: (data: TaskCreate) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<TaskCreate>) => request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  pendingTasks: {
    list: () => request<{ date: string; data: PendingTask[] }>('/pending-tasks'),
  },
  taskLogs: {
    list: (params?: { date?: string; user_id?: number; task_id?: number; status?: string }) => {
      const search = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ data: TaskLog[] }>(`/task-logs${search ? `?${search}` : ''}`);
    },
    export: async (params?: { date?: string; user_id?: number; task_id?: number; status?: string; format?: string }) => {
      const sp = new URLSearchParams(params as Record<string, string>);
      const token = getToken();
      const res = await fetch(`${API_BASE}/task-logs/export?${sp.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Erro ao exportar');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] || `task-logs-${params?.date || new Date().toISOString().slice(0, 10)}.${params?.format === 'xlsx' ? 'xlsx' : 'csv'}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    correct: (id: number, data: { status: 'completed' | 'pending'; correction_reason: string }) =>
      request<{ data: { id: number; status: string; corrected_at: string } }>(`/task-logs/${id}/correct`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    create: (data: { task_id: number; status: string; observation?: string; photo?: File; media?: File[] }) => {
      const formData = new FormData();
      formData.append('task_id', String(data.task_id));
      formData.append('status', data.status);
      if (data.observation) formData.append('observation', data.observation);
      if (data.photo) formData.append('photo', data.photo);
      if (data.media?.length) {
        data.media.forEach((f) => formData.append('media[]', f));
      }

      const token = getToken();
      return fetch(`${API_BASE}/task-logs`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Erro ao registrar');
        return json;
      });
    },
  },
  users: {
    list: (all?: boolean) => request<{ data: User[] }>(`/users${all ? '?all=1' : ''}`),
    ranking: (period?: 'week' | 'month') =>
      request<{ period: string; data: RankingItem[] }>(`/users/ranking${period ? `?period=${period}` : ''}`),
    stats: (id: number) => request<{ completion_percentage: number }>(`/users/${id}/stats`),
    create: (data: UserCreate) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<UserCreate>) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
  },
  sectors: {
    list: (all?: boolean) => request<{ data: Sector[] }>(`/sectors${all ? '?all=1' : ''}`),
    create: (data: { name: string; slug?: string }) => request<Sector>('/sectors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Sector>) => request<Sector>(`/sectors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`/sectors/${id}`, { method: 'DELETE' }),
  },
  shifts: {
    list: (all?: boolean) => request<{ data: Shift[] }>(`/shifts${all ? '?all=1' : ''}`),
    create: (data: ShiftCreate) => request<Shift>('/shifts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ShiftCreate>) => request<Shift>(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`/shifts/${id}`, { method: 'DELETE' }),
  },
};

export interface Sector {
  id: number;
  name: string;
  slug: string;
  active?: boolean;
}

export interface Shift {
  id: number;
  name: string;
  slug: string;
  start_time?: string | null;
  end_time?: string | null;
  active?: boolean;
}

export interface ShiftCreate {
  name: string;
  slug?: string;
  start_time?: string;
  end_time?: string;
  active?: boolean;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  sector_id?: number | null;
  shift_id?: number | null;
}

export interface TaskCreate {
  name: string;
  type: string;
  recurrence?: string;
  due_date?: string | null;
  description?: string | null;
  requires_photo?: boolean;
  requires_observation?: boolean;
  min_interval_minutes?: number | null;
  notification_time?: string | null;
  order?: number;
  sector_id?: number | null;
  shift_id?: number | null;
  user_id?: number | null;
}

export interface RankingItem {
  rank: number;
  user: { id: number; name: string; sector?: { id: number; name: string } | null; shift?: { id: number; name: string } | null };
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
}

export interface PendingTask {
  id: number;
  name: string;
  sector?: { id: number; name: string } | null;
  shift?: { id: number; name: string } | null;
  user?: { id: number; name: string } | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  sector?: { id: number; name: string } | null;
  shift?: { id: number; name: string } | null;
}

export interface Task {
  id: number;
  name: string;
  type: string;
  recurrence?: string;
  due_date?: string | null;
  description?: string;
  requires_photo: boolean;
  requires_observation?: boolean;
  min_interval_minutes?: number | null;
  notification_time?: string | null;
  order: number;
  active?: boolean;
  sector?: { id: number; name: string } | null;
  shift?: { id: number; name: string } | null;
  user?: { id: number; name: string } | null;
}

export interface TaskLogMedia {
  url: string;
  type: 'image' | 'video';
}

export interface TaskLog {
  id: number;
  task: { id: number; name: string; type?: string; sector?: { id: number; name: string } | null; shift?: { id: number; name: string } | null };
  user: { id: number; name: string; sector?: { id: number; name: string } | null; shift?: { id: number; name: string } | null };
  log_date: string;
  completed_at: string | null;
  observation: string | null;
  photo_url: string | null;
  media?: TaskLogMedia[];
  status: string;
}
