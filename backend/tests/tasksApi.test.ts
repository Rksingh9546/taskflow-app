// backend/tests/tasksApi.test.ts
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { resetDb } from '../src/db';
import app from '../src/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

let tmpDb: string;

beforeAll(() => {
  tmpDb = path.join(os.tmpdir(), `taskflow-test-${Date.now()}.db`);
  process.env.DB_PATH = tmpDb;
  resetDb(tmpDb);
});

beforeEach(() => {
  if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);
  resetDb(tmpDb);
});

describe('Tasks API', () => {
  it('rejects creating a task with an empty title', async () => {
    const res = await request(app).post('/api/tasks').send({ columnId: 1, title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('moves a task to a new column and the change persists', async () => {
    const before = await request(app).get('/api/boards/1');
    const col1 = before.body.columns.find((c: any) => c.id === 1);
    expect(col1.tasks.some((t: any) => t.id === 1)).toBe(true);

    const move = await request(app).patch('/api/tasks/1/move').send({ columnId: 2 });
    expect(move.status).toBe(200);
    expect(move.body.column_id).toBe(2);

    const after = await request(app).get('/api/boards/1');
    const afterCol1 = after.body.columns.find((c: any) => c.id === 1);
    const afterCol2 = after.body.columns.find((c: any) => c.id === 2);
    expect(afterCol1.tasks.some((t: any) => t.id === 1)).toBe(false);
    expect(afterCol2.tasks.some((t: any) => t.id === 1)).toBe(true);
  });
});