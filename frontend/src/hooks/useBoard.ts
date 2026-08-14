// frontend/src/hooks/useBoard.ts
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Board, Task, TaskDraft, TaskPatch } from '../types';

export function useBoard(boardId = 1) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await api.getBoard(boardId);
      setBoard(b);
    } catch (e: any) {
      setError(e.message || 'Failed to load board.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { load(); }, [load]);

  const createTask = useCallback(async (draft: TaskDraft) => {
    const created = await api.createTask(draft);
    setBoard((prev) => prev ? {
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === created.column_id ? { ...c, tasks: [...c.tasks, created] } : c
      ),
    } : prev);
    return created;
  }, []);

  const updateTask = useCallback(async (id: number, patch: TaskPatch) => {
    const updated = await api.updateTask(id, patch);
    setBoard((prev) => prev ? {
      ...prev,
      columns: prev.columns.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) => (t.id === id ? updated : t)),
      })),
    } : prev);
    return updated;
  }, []);

  const moveTask = useCallback(async (id: number, targetColumnId: number) => {
    let prevBoard = board;
    setBoard((prev) => {
      if (!prev) return prev;
      prevBoard = prev;
      let moved: Task | undefined;
      const columns = prev.columns.map((c) => {
        const without = c.tasks.filter((t) => {
          if (t.id === id) { moved = t; return false; }
          return true;
        });
        return { ...c, tasks: without };
      });
      if (!moved) return prev;
      return {
        ...prev,
        columns: columns.map((c) =>
          c.id === targetColumnId
            ? { ...c, tasks: [...c.tasks, { ...moved!, column_id: targetColumnId }] }
            : c
        ),
      };
    });
    try {
      await api.moveTask(id, targetColumnId);
    } catch (e: any) {
      setBoard(prevBoard); // Rollback on failure
      throw e;
    }
  }, [board]);

  const deleteTask = useCallback(async (id: number) => {
    await api.deleteTask(id);
    setBoard((prev) => prev ? {
      ...prev,
      columns: prev.columns.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== id) })),
    } : prev);
  }, []);

  return { board, loading, error, reload: load, createTask, updateTask, moveTask, deleteTask, setError };
}