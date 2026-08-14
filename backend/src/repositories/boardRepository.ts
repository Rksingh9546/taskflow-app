// backend/src/repositories/boardRepository.ts
import { DB } from '../db';

export interface BoardColumn {
  id: number; board_id: number; name: string; position: number;
}
export interface BoardTask {
  id: number; column_id: number; title: string; description: string | null;
  priority: 'Low' | 'Medium' | 'High'; created_at: string; updated_at: string;
}
export interface BoardWithColumns {
  id: number; name: string;
  columns: Array<BoardColumn & { tasks: BoardTask[] }>;
}

export function getBoard(db: DB, boardId: number): BoardWithColumns | null {
  const board = db.prepare('SELECT id, name FROM boards WHERE id = ?').get(boardId) as { id: number; name: string } | undefined;
  if (!board) return null;

  const columns = db.prepare(
    `SELECT id, board_id, name, position FROM columns WHERE board_id = ? ORDER BY position ASC, id ASC`
  ).all(boardId) as BoardColumn[];

  const tasks = db.prepare(
    `SELECT id, column_id, title, description, priority, created_at, updated_at
     FROM tasks WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?) ORDER BY created_at ASC`
  ).all(boardId) as BoardTask[];

  const tasksByColumn = new Map<number, BoardTask[]>();
  for (const t of tasks) {
    const list = tasksByColumn.get(t.column_id) ?? [];
    list.push(t);
    tasksByColumn.set(t.column_id, list);
  }

  return { ...board, columns: columns.map((c) => ({ ...c, tasks: tasksByColumn.get(c.id) ?? [] })) };
}

// REQUIRED QUERY #1: Count of tasks per column on a board
export interface ColumnCount { column_id: number; column_name: string; task_count: number; }
export function countTasksPerColumn(db: DB, boardId: number): ColumnCount[] {
  return db.prepare(
    `SELECT c.id AS column_id, c.name AS column_name, COUNT(t.id) AS task_count
     FROM columns c
     LEFT JOIN tasks t ON t.column_id = c.id
     WHERE c.board_id = ?
     GROUP BY c.id, c.name
     ORDER BY c.position ASC, c.id ASC`
  ).all(boardId) as ColumnCount[];
}

// REQUIRED QUERY #2: Tasks with a given priority, newest first
export interface PrioritizedTask { id: number; title: string; priority: string; column_id: number; column_name: string; created_at: string; }
export function tasksByPriorityNewestFirst(db: DB, boardId: number, priority: 'Low' | 'Medium' | 'High'): PrioritizedTask[] {
  return db.prepare(
    `SELECT t.id, t.title, t.priority, t.column_id, c.name AS column_name, t.created_at
     FROM tasks t
     JOIN columns c ON c.id = t.column_id
     WHERE c.board_id = ? AND t.priority = ?
     ORDER BY t.created_at DESC, t.id DESC`
  ).all(boardId, priority) as PrioritizedTask[];
}