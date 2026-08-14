// frontend/src/components/FilterBar.tsx
import React from 'react';
import type { Priority } from '../types';

interface Props {
  priority: Priority | 'All';
  onPriorityChange: (p: Priority | 'All') => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export const FilterBar: React.FC<Props> = ({ priority, onPriorityChange, search, onSearchChange }) => {
  return (
    <div className="filter-bar">
      <label>
        Priority:
        <select value={priority} onChange={(e) => onPriorityChange(e.target.value as any)}>
          <option value="All">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label>
        Search:
        <input type="text" placeholder="Filter by title..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </label>
    </div>
  );
};