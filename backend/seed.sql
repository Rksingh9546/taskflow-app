-- backend/seed.sql
INSERT INTO boards (id, name) VALUES (1, 'Main Board');

INSERT INTO columns (id, board_id, name, position) VALUES
  (1, 1, 'To Do',      0),
  (2, 1, 'In Progress', 1),
  (3, 1, 'Done',       2);

INSERT INTO tasks (id, column_id, title, description, priority, created_at) VALUES
  (1, 1, 'Write project README',         'Cover setup, schema, and design notes.',  'Medium', '2026-07-01 10:00:00'),
  (2, 1, 'Design database schema',       'Boards -> Columns -> Tasks.',             'High',   '2026-07-01 09:30:00'),
  (3, 1, 'Pick a CSS approach',          NULL,                                       'Low',    '2026-07-01 11:00:00'),
  (4, 2, 'Implement task CRUD endpoints', NULL,                                      'High',   '2026-07-02 14:00:00'),
  (5, 2, 'Add priority filter on client', NULL,                                      'Medium', '2026-07-02 15:30:00'),
  (6, 3, 'Set up Vitest',                'At least 3 tests covering the spec.',      'Medium', '2026-07-03 09:00:00'),
  (7, 3, 'Seed sample board',            NULL,                                       'Low',    '2026-07-03 10:00:00');