// server.js

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database
// The database file will be created if it doesn't exist
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a 'tasks' table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
    )`);
});

// --- Middleware ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// To parse JSON request bodies
app.use(express.json());

// --- API Routes for CRUD operations ---

// GET: Read all tasks
app.get('/api/tasks', (req, res) => {
    const sql = "SELECT * FROM tasks ORDER BY id";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// POST: Create a new task
app.post('/api/tasks', (req, res) => {
    const { task, completed } = req.body;
    if (!task) {
        res.status(400).json({ "error": "Task content is required" });
        return;
    }
    const sql = 'INSERT INTO tasks (task, completed) VALUES (?, ?)';
    const params = [task, completed ? 1 : 0];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, task, completed },
        });
    });
});

// PUT: Update a task (toggle completed status)
app.put('/api/tasks/:id', (req, res) => {
    const { completed } = req.body;
    const sql = 'UPDATE tasks SET completed = ? WHERE id = ?';
    db.run(sql, [completed ? 1 : 0, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success", changes: this.changes });
    });
});

// DELETE: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
