// backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getDb } from './db';
import { boardRoutes } from './routes/boardRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { HttpError } from './errors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'TaskFlow API is running!' }));

app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

getDb(); // Initialize DB on boot

const PORT = Number(process.env.PORT) || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`TaskFlow API on http://localhost:${PORT}`));
}

export default app;
