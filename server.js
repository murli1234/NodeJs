// server.js

const express = require('express');
const path = require('path');

// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// --- Middleware ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// To parse JSON request bodies
app.use(express.json());

// --- API Routes for CRUD operations ---

// GET: Read all tasks
app.get('/api/tasks', (req, res) => {
    res.json({
        "message": "success",
        "data": [...tasks].sort((a, b) => a.id - b.id)
    });
});

// POST: Create a new task
app.post('/api/tasks', (req, res) => {
    const { task, completed = false } = req.body;
    if (!task) {
        res.status(400).json({ "error": "Task content is required" });
        return;
    }
    
    const newTask = {
        id: nextId++,
        task,
        completed: Boolean(completed)
    };
    
    tasks.push(newTask);
    res.json({
        "message": "success",
        "data": newTask
    });
});

// PUT: Update a task (toggle completed status)
app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { completed } = req.body;
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
        res.status(404).json({ "error": "Task not found" });
        return;
    }
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        completed: Boolean(completed)
    };
    
    res.json({ 
        message: "success", 
        changes: 1 
    });
});

// DELETE: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    
    res.json({ 
        "message": "deleted", 
        changes: initialLength - tasks.length 
    });
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
