// backend/src/routes/taskRoutes.ts
import { Router } from 'express';
import { getDb } from '../db';
import { validateTask, parseColumnId } from '../validation';
import { createTask, updateTask, moveTask, deleteTask, getTask } from '../repositories/taskRepository';
import { HttpError, notFound, badRequest } from '../errors';

export const taskRoutes = Router();

taskRoutes.post('/', (req, res) => {
  let columnId: number;
  try { columnId = parseColumnId(req.body?.columnId); } 
  catch { throw badRequest('columnId is required and must be a positive integer.'); }

  const db = getDb();
  const col = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!col) throw notFound('Target column does not exist.');

  let payload;
  try { payload = validateTask(req.body ?? {}); } 
  catch (e: any) { throw badRequest(e.message); }

  const created = createTask(db, columnId, payload.title, payload.description, payload.priority);
  res.status(201).json(created);
});

taskRoutes.patch('/:taskId', (req, res) => {
  const id = Number(req.params.taskId);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('taskId must be a positive integer.');

  const db = getDb();
  const existing = getTask(db, id);
  if (!existing) throw notFound('Task not found.');

  const patch: { title?: string; description?: string | null; priority?: any } = {};
  if (req.body?.title !== undefined) {
    try { patch.title = validateTask({ title: req.body.title }).title; } 
    catch (e: any) { throw badRequest(e.message); }
  }
  if (req.body?.description !== undefined) {
    patch.description = typeof req.body.description === 'string' && req.body.description.trim().length > 0
      ? req.body.description.trim() : null;
  }
  if (req.body?.priority !== undefined) {
    if (!['Low', 'Medium', 'High'].includes(req.body.priority)) throw badRequest('priority must be Low, Medium, or High.');
    patch.priority = req.body.priority;
  }

  const updated = updateTask(db, id, patch);
  res.json(updated);
});

taskRoutes.patch('/:taskId/move', (req, res) => {
  const id = Number(req.params.taskId);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('taskId must be a positive integer.');

  let targetColumnId: number;
  try { targetColumnId = parseColumnId(req.body?.columnId); } 
  catch { throw badRequest('columnId is required and must be a positive integer.'); }

  try {
    const moved = moveTask(getDb(), id, targetColumnId);
    res.json(moved);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') throw notFound('Task not found.');
    if (e.message === 'TARGET_NOT_FOUND') throw notFound('Target column does not exist.');
    if (e.message === 'CROSS_BOARD') throw badRequest('Cannot move a task across boards.');
    throw e;
  }
});

taskRoutes.delete('/:taskId', (req, res) => {
  const id = Number(req.params.taskId);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('taskId must be a positive integer.');
  const ok = deleteTask(getDb(), id);
  if (!ok) throw notFound('Task not found.');
  res.status(204).end();
});