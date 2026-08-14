// frontend/src/components/Column.tsx
import React from 'react';
import type { Column as ColumnType } from '../types';
import { TaskCard } from './TaskCard';

interface Props {
  column: ColumnType;
  allColumns: ColumnType[];
  visibleTaskCount: number;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onMoveTask: (taskId: number, targetColumnId: number) => void;
  onDrop: (targetColumnId: number, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export const Column: React.FC<Props> = ({ column, allColumns, visibleTaskCount, onEditTask, onDeleteTask, onMoveTask, onDrop, onDragOver }) => {
  return (
    <section className="column" onDrop={(e) => onDrop(column.id, e)} onDragOver={onDragOver}>
      <header className="column-head">
        <h3>{column.name}</h3>
        <span className="count" title="Visible / total">{visibleTaskCount} / {column.tasks.length}</span>
      </header>
      <div className="column-body">
        {column.tasks.length === 0 && <p className="empty">No tasks.</p>}
        {column.tasks.map((t) => (
          <TaskCard key={t.id} task={t} columns={allColumns} onEdit={() => onEditTask(t.id)} onDelete={() => onDeleteTask(t.id)} onMove={(target) => onMoveTask(t.id, target)} onDragStart={(e) => e.dataTransfer.setData('text/plain', String(t.id))} />
        ))}
      </div>
    </section>
  );
};