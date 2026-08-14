# TaskFlow 📝

A full-stack, lightweight task board (like a mini Trello) built for small teams. It allows users to create, edit, move, and delete tasks across different columns with data persisting in a real relational database.

![alt text](<Screenshot 2026-08-14 at 15.45.18.png>)
![alt text](<Screenshot 2026-08-14 at 15.45.29.png>)

## 🛠 Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** SQLite (via `better-sqlite3`)
*   **Testing:** Vitest, Supertest

---

## 🚀 Setup & Installation (From a clean clone)

You need Node.js (v18+) and npm installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone <https://github.com/Rksingh9546/taskflow-app>
   cd taskflow
   ```

2. **Setup & Start the Backend:**
   Open a terminal, navigate to the backend folder, install dependencies, and start the server.
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend API will start on `http://localhost:4000`. On first run, it will automatically create the SQLite database and seed it with sample data.*

3. **Setup & Start the Frontend:**
   Open a **second terminal**, navigate to the frontend folder, install dependencies, and start the dev server.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Open your browser and go to `http://localhost:5173` to view the app.*

---

## ✨ Features Implemented

### Core Requirements
*   **Board View:** Displays columns (To Do, In Progress, Done) and their tasks.
*   **CRUD Operations:** Create, edit, and delete tasks. Title is required and validated on **both** frontend and backend.
*   **Move Tasks:** Move tasks between columns via **Drag-and-Drop** (HTML5 native) AND a dropdown fallback for accessibility.
*   **Persistence:** All data is saved in a real SQLite database. Reloading the page persists all changes.
*   **Filtering:** Filter tasks by priority (Low/Medium/High) and search by title.
*   **Error Handling:** Global error banner with "Retry" and "Dismiss" buttons if the backend is unreachable. Failed drag-and-drops roll back to the previous state automatically.

### Database & Queries
The schema is written in pure SQL (`backend/schema.sql`) with proper Primary Keys, Foreign Keys (`ON DELETE CASCADE`), and `CHECK` constraints.
Two non-trivial SQL queries are implemented in the repository layer:
1.  **Tasks per column:** Uses `LEFT JOIN` and `GROUP BY` to count tasks per column (including empty columns).
2.  **Tasks by priority (Newest First):** Uses `JOIN` and `ORDER BY created_at DESC` to filter and sort at the database level.

### Stretch Goals
*   Drag-and-drop with optimistic UI updates.
*   Text search by task title.
*   "Visible / Total" task count shown in each column header.

---

## 🧪 Running Tests

To run the backend tests (which use an isolated temporary database):
```bash
cd backend
npm test
```
Tests include:
1. Rejecting task creation with an empty title.
2. Moving a task to a new column (and verifying it persists).
3. Hitting the DB layer directly to verify the "tasks per column" and "tasks by priority" queries return correct rows.

---

## 📝 Assumptions & Decisions

*   **Single Default Board:** Since user accounts/multi-team was explicitly out of scope, I assumed a single default board (`id = 1`) seeded into the database. The schema is fully relational and supports multiple boards if needed later.
*   **`better-sqlite3` over an ORM:** The prompt emphasized wanting to see real SQL queries, not ORM magic. I used `better-sqlite3` to write raw, parameterized SQL queries directly.
*   **DB-level Constraints:** I relied on SQLite `CHECK` constraints (e.g., `length(trim(title)) > 0`) to enforce data integrity at the database level, not just in JavaScript.
*   **Optimistic UI:** For drag-and-drop, the UI updates instantly before the server responds. If the server fails, the state rolls back and shows an error.

## 🔮 What I'd Improve With More Time

*   Replace the native `confirm()` dialog for deletion with a proper custom modal.
*   Add optimistic concurrency control (e.g., using `updated_at` as a version key) to prevent accidental overwrites if two tabs edit the same task simultaneously.
*   Add End-to-End (E2E) tests using Playwright for the drag-and-drop flows.
*   Improve keyboard accessibility for drag-and-drop (currently reliant on the dropdown fallback).

## ⏱ Time Spent
Roughly **7–8 hours** end-to-end: DB schema & repositories (~1.5h), Backend routes/validation (~1.5h), Frontend React UI (~3h), Testing & cleanup (~1.5h).

