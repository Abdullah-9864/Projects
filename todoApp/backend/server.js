const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3001;
const DB_FILE = "./db.json";

// Middleware
app.use(cors());            // allows React (port 5173) to talk to this server
app.use(express.json());    // allows server to read JSON from requests

// Helper: read todos from file
function readTodos() {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

// Helper: write todos to file
function writeTodos(todos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(todos, null, 2));
}

// GET /todos — return all todos
app.get("/todos", (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// POST /todos — add a new todo
app.post("/todos", (req, res) => {
  const todos = readTodos();
  const newTodo = {
    id: Date.now(),
    task: req.body.task,
  };
  todos.push(newTodo);
  writeTodos(todos);
  res.json(newTodo);
});

// DELETE /todos/:id — delete a todo by id
app.delete("/todos/:id", (req, res) => {
  let todos = readTodos();
  todos = todos.filter((t) => t.id !== parseInt(req.params.id));
  writeTodos(todos);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
