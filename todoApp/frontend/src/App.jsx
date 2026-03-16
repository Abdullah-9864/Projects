import { useState, useEffect } from "react";

const API = "http://localhost:3001";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // Runs once when app loads — fetches todos from backend
  useEffect(() => {
    fetchTodos();
  }, []);

  // GET — fetch all todos from server
  async function fetchTodos() {
    const res = await fetch(`${API}/todos`);
    const data = await res.json();
    setTodos(data);
  }

  // POST — send new todo to server
  async function addTodo() {
    if (!task.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);  // React updates UI on device
    setTask("");
  }

  // DELETE — tell server to delete a todo
  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));  // React updates UI on device
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📝 Todo List</h1>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Enter a task..."
        />
        <button style={styles.addBtn} onClick={addTodo}>
          Add
        </button>
      </div>

      {/* List */}
      <ul style={styles.list}>
        {todos.length === 0 && (
          <p style={styles.empty}>No tasks yet. Add one above!</p>
        )}
        {todos.map((todo) => (
          <li key={todo.id} style={styles.item}>
            <span>{todo.task}</span>
            <button
              style={styles.deleteBtn}
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "50px auto",
    background: "white",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: { marginBottom: 20, color: "#333" },
  inputRow: { display: "flex", gap: 10, marginBottom: 30 },
  input: {
    flex: 1, padding: 10, border: "1px solid #ddd",
    borderRadius: 6, fontSize: 14,
  },
  addBtn: {
    padding: "10px 20px", background: "#4f46e5", color: "white",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14,
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  item: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "12px 0",
    borderBottom: "1px solid #eee", fontSize: 15, color: "#444",
  },
  deleteBtn: {
    padding: "5px 12px", background: "#ef4444", color: "white",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
  },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", padding: "20px 0" },
};
