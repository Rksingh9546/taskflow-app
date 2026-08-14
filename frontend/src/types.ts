// frontend/src/types.ts
export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
}

export type TaskDraft = {
  columnId: number;
  title: string;
  description?: string;
  priority?: Priority;
};

export type TaskPatch = {
  title?: string;
  description?: string | null;
  priority?: Priority;
};