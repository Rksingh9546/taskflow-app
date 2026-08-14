// backend/src/validation.ts
export type Priority = 'Low' | 'Medium' | 'High';
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export interface TaskInput {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  columnId?: unknown;
}

export function validateTask(input: TaskInput): {
  title: string;
  description: string | null;
  priority: Priority;
} {
  const rawTitle = typeof input.title === 'string' ? input.title.trim() : '';
  if (rawTitle.length === 0) {
    throw new Error('Title is required and cannot be empty.');
  }
  if (rawTitle.length > 200) {
    throw new Error('Title must be 200 characters or fewer.');
  }

  const description =
    typeof input.description === 'string' && input.description.trim().length > 0
      ? input.description.trim()
      : null;

  const priority =
    typeof input.priority === 'string' && PRIORITIES.includes(input.priority as Priority)
      ? (input.priority as Priority)
      : 'Medium';

  return { title: rawTitle, description, priority };
}

export function parseColumnId(v: unknown): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('columnId must be a positive integer.');
  }
  return n;
}