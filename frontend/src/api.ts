// frontend/src/api.ts
// frontend/src/api.ts
import type { Board, Task, TaskDraft, TaskPatch } from './types';

// Agar VITE_API_URL env variable hai toh wo use kare, nahi toh local proxy '/api' use kare
const BASE = import.meta.env.VITE_API_URL || '/api';

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new Error('Network error — could not reach the server.');
  }

  if (res.status === 204) return undefined as T;

  let body: any = null;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    body = await res.json();
  }
  if (!res.ok) {
    const msg = body?.error || `Request failed (${res.status}).`;
    throw new Error(msg);
  }
  return body as T;
}

export const api = {
  getBoard: (id = 1) => req<Board>(`/boards/${id}`),
  createTask: (draft: TaskDraft) =>
    req<Task>(`/tasks`, { method: 'POST', body: JSON.stringify(draft) }),
  updateTask: (id: number, patch: TaskPatch) =>
    req<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  moveTask: (id: number, columnId: number) =>
    req<Task>(`/tasks/${id}/move`, { method: 'PATCH', body: JSON.stringify({ columnId }) }),
  deleteTask: (id: number) =>
    req<void>(`/tasks/${id}`, { method: 'DELETE' }),
};