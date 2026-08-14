// frontend/src/components/Board.tsx
import React, { useMemo, useState } from 'react';
import type { Column as ColumnType, Priority } from '../types';
import { Column } from './Column';

interface Props {
  columns: ColumnType[];
  priorityFilter: Priority | 'All';
  search: string;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onMoveTask: (taskId: number, targetColumnId: number) => void;
  onDrop: (targetColumnId: number, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export const Board: React.FC<Props> = ({ columns, priorityFilter, search, onEditTask, onDeleteTask, onMoveTask, onDrop, onDragOver }) => {
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return columns.map((c) => ({
      ...c,
      tasks: c.tasks.filter((t) => {
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      }),
    }));
  }, [columns, priorityFilter, search]);

  return (
    <div className="board">
      {filtered.map((c) => (
        <div key={c.id} className={dragOverCol === c.id ? 'column-wrap drag-over' : 'column-wrap'} onDragEnter={() => setDragOverCol(c.id)} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol((cur) => (cur === c.id ? null : cur)); }} onDrop={(e) => { setDragOverCol(null); onDrop(c.id, e); }} onDragOver={onDragOver}>
          <Column column={c} allColumns={columns} visibleTaskCount={c.tasks.length} onEditTask={onEditTask} onDeleteTask={onDeleteTask} onMoveTask={onMoveTask} onDrop={() => {}} onDragOver={() => {}} />
        </div>
      ))}
    </div>
  );
};