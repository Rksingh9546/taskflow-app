// backend/src/repositories/taskRepository.ts
import { DB } from '../db';
import { Priority } from '../validation';

export interface TaskRow {
  id: number; column_id: number; title: string; description: string | null;
  priority: Priority; created_at: string; updated_at: string;
}

export function getTask(db: DB, id: number): TaskRow | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
}

export function createTask(db: DB, columnId: number, title: string, description: string | null, priority: Priority): TaskRow {
  const info = db.prepare(
    `INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)`
  ).run(columnId, title, description, priority);
  return getTask(db, Number(info.lastInsertRowid))!;
}

export function updateTask(db: DB, id: number, patch: { title?: string; description?: string | null; priority?: Priority }): TaskRow | undefined {
  const sets: string[] = [];
  const values: unknown[] = [];
  if (patch.title !== undefined) { sets.push('title = ?'); values.push(patch.title); }
  if (patch.description !== undefined) { sets.push('description = ?'); values.push(patch.description); }
  if (patch.priority !== undefined) { sets.push('priority = ?'); values.push(patch.priority); }
  if (sets.length === 0) return getTask(db, id);
  
  sets.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getTask(db, id);
}

export function moveTask(db: DB, taskId: number, targetColumnId: number): TaskRow | undefined {
  const tx = db.transaction(() => {
    const task = getTask(db, taskId);
    if (!task) throw new Error('NOT_FOUND');
    const currentCol = db.prepare('SELECT board_id FROM columns WHERE id = ?').get(task.column_id) as { board_id: number } | undefined;
    const targetCol = db.prepare('SELECT board_id FROM columns WHERE id = ?').get(targetColumnId) as { board_id: number } | undefined;
    if (!targetCol) throw new Error('TARGET_NOT_FOUND');
    if (currentCol?.board_id !== targetCol.board_id) throw new Error('CROSS_BOARD');
    db.prepare(`UPDATE tasks SET column_id = ?, updated_at = datetime('now') WHERE id = ?`).run(targetColumnId, taskId);
    return getTask(db, taskId)!;
  });
  return tx();
}

export function deleteTask(db: DB, id: number): boolean {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return info.changes > 0;
}