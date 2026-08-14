// frontend/src/App.tsx
import React, { useState } from 'react';
import { useBoard } from './hooks/useBoard';
import { Board as BoardView } from './components/Board';
import { FilterBar } from './components/FilterBar';
import { ErrorBanner } from './components/ErrorBanner';
import { TaskModal } from './components/TaskModal';
import type { Priority } from './types';

export default function App() {
  const { board, loading, error, reload, createTask, updateTask, moveTask, deleteTask, setError } = useBoard(1);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState<number | null>(null);

  const editingTask = board?.columns.flatMap((c) => c.tasks).find((t) => t.id === editingTaskId) ?? null;

  const handleDrop = async (targetColumnId: number, e: React.DragEvent) => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!id) return;
    try { await moveTask(id, targetColumnId); } catch (err: any) { setError(err.message || 'Could not move the task.'); }
  };

  const handleMoveTask = async (id: number, target: number) => {
    try { await moveTask(id, target); } catch (err: any) { setError(err.message || 'Could not move the task.'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); } catch (err: any) { setError(err.message || 'Could not delete the task.'); }
  };

  const handleSubmit = async (values: { title: string; description: string; priority: Priority }) => {
    if (editingTask) {
      await updateTask(editingTask.id, values);
    } else if (newTaskColumnId != null) {
      await createTask({ columnId: newTaskColumnId, title: values.title, description: values.description || undefined, priority: values.priority });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TaskFlow</h1>
        <p className="subtitle">{board?.name ?? 'Loading...'}</p>
      </header>

      <ErrorBanner message={error} onDismiss={() => setError(null)} onRetry={reload} />

      <div className="toolbar">
        <FilterBar priority={priorityFilter} onPriorityChange={setPriorityFilter} search={search} onSearchChange={setSearch} />
      </div>

      {loading && <p className="state">Loading board...</p>}
      {!loading && board && (
        <BoardView columns={board.columns} priorityFilter={priorityFilter} search={search} onEditTask={(id) => { setEditingTaskId(id); setModalOpen(true); }} onDeleteTask={handleDelete} onMoveTask={handleMoveTask} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} />
      )}

      <div className="add-buttons">
        {board?.columns.map((c) => (
          <button key={c.id} onClick={() => { setNewTaskColumnId(c.id); setEditingTaskId(null); setModalOpen(true); }}>+ Add to {c.name}</button>
        ))}
      </div>

      <TaskModal open={modalOpen} initial={editingTask} defaultColumnId={newTaskColumnId ?? undefined} columns={board?.columns ?? []} onClose={() => { setModalOpen(false); setEditingTaskId(null); setNewTaskColumnId(null); }} onSubmit={handleSubmit} />
    </div>
  );
}