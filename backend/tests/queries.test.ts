// backend/tests/queries.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { resetDb } from '../src/db';
import { countTasksPerColumn, tasksByPriorityNewestFirst } from '../src/repositories/boardRepository';
import fs from 'fs';
import os from 'os';
import path from 'path';

let tmpDb: string;

beforeAll(() => {
  tmpDb = path.join(os.tmpdir(), `taskflow-queries-${Date.now()}.db`);
  process.env.DB_PATH = tmpDb;
  if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);
  resetDb(tmpDb);
});

describe('DB-layer queries', () => {
  it('countTasksPerColumn returns correct counts for known seed data', () => {
    const db = resetDb(tmpDb);
    const counts = countTasksPerColumn(db, 1);
    expect(counts).toHaveLength(3);
    const byId = Object.fromEntries(counts.map((c) => [c.column_id, c.task_count]));
    expect(byId[1]).toBe(3);
    expect(byId[2]).toBe(2);
    expect(byId[3]).toBe(2);
  });

  it('tasksByPriorityNewestFirst returns only matching tasks, newest first', () => {
    const db = resetDb(tmpDb);
    const rows = tasksByPriorityNewestFirst(db, 1, 'High');
    expect(rows.every((r) => r.priority === 'High')).toBe(true);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe(4); // July 2
    expect(rows[1].id).toBe(2); // July 1
  });
});
