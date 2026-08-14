// backend/src/routes/boardRoutes.ts
import { Router } from 'express';
import { getDb } from '../db';
import { getBoard, countTasksPerColumn, tasksByPriorityNewestFirst } from '../repositories/boardRepository';
import { HttpError, notFound } from '../errors';

export const boardRoutes = Router();

boardRoutes.get('/:boardId', (req, res) => {
  const boardId = Number(req.params.boardId);
  if (!Number.isInteger(boardId) || boardId <= 0) throw notFound('Board not found.');
  const board = getBoard(getDb(), boardId);
  if (!board) throw notFound('Board not found.');
  res.json(board);
});

boardRoutes.get('/:boardId/counts', (req, res) => {
  const boardId = Number(req.params.boardId);
  if (!Number.isInteger(boardId) || boardId <= 0) throw notFound('Board not found.');
  res.json(countTasksPerColumn(getDb(), boardId));
});

boardRoutes.get('/:boardId/priority/:priority', (req, res) => {
  const boardId = Number(req.params.boardId);
  const priority = req.params.priority;
  if (!Number.isInteger(boardId) || boardId <= 0) throw notFound('Board not found.');
  if (!['Low', 'Medium', 'High'].includes(priority)) throw new HttpError(400, 'Invalid priority.');
  res.json(tasksByPriorityNewestFirst(getDb(), boardId, priority as any));
});