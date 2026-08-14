// frontend/src/components/TaskModal.tsx
import React, { useEffect, useState } from 'react';
import type { Priority, Task } from '../types';

interface Props {
  open: boolean;
  initial?: Task | null;
  defaultColumnId?: number;
  columns: { id: number; name: string }[];
  onClose: () => void;
  onSubmit: (values: { title: string; description: string; priority: Priority }) => Promise<void>;
}

export const TaskModal: React.FC<Props> = ({ open, initial, columns, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setPriority(initial?.priority ?? 'Medium');
      setLocalError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length === 0) {
      setLocalError('Title is required.');
      return;
    }
    setSubmitting(true);
    setLocalError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), priority });
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Could not save the task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{initial ? 'Edit task' : 'New task'}</h3>
        {localError && <div className="modal-error">{localError}</div>}
        <label>Title<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required /></label>
        <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></label>
        <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></label>
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
        </div>
        {columns.length > 0 && (<p className="modal-hint">Column: {columns.find((c) => c.id === (initial?.column_id ?? 0))?.name ?? '—'}</p>)}
      </form>
    </div>
  );
};