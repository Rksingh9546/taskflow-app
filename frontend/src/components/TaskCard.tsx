// frontend/src/components/TaskCard.tsx
import React, { useState } from 'react';
import type { Column, Priority, Task } from '../types';

interface Props {
  task: Task;
  columns: Column[];
  onEdit: () => void;
  onDelete: () => void;
  onMove: (targetColumnId: number) => void;
  onDragStart: (e: React.DragEvent) => void;
}

const priorityClass: Record<Priority, string> = {
  Low: 'p-low', Medium: 'p-medium', High: 'p-high',
};

export const TaskCard: React.FC<Props> = ({ task, columns, onEdit, onDelete, onMove, onDragStart }) => {
  const [busy, setBusy] = useState(false);

  const handleMove = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = Number(e.target.value);
    if (target === task.column_id) return;
    setBusy(true);
    try { onMove(target); } finally { setBusy(false); }
  };

  return (
    <div className={`task-card ${priorityClass[task.priority]}`} draggable onDragStart={onDragStart} data-task-id={task.id}>
      <div className="task-card-head">
        <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
        <div className="task-card-actions">
          <button onClick={onEdit} aria-label="Edit task">✎</button>
          <button onClick={onDelete} aria-label="Delete task">🗑</button>
        </div>
      </div>
      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-move">
        <label>
          Move to:
          <select value={task.column_id} onChange={handleMove} disabled={busy}>
            {columns.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </label>
      </div>
    </div>
  );
};