import { useState, useEffect } from "react";

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const API_URL = "http://localhost/todo-api-new/index.php?path=tasks";

  // Handle theme switch
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch tasks from API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Add Task
  const addTask = async () => {
    if (task.trim() === "") return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: task, status: "pending" }),
      });

      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setTask("");
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  // Remove Task (Database + Frontend)
  const removeTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}&id=${id}`, { method: "DELETE" });

      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
      } else {
        console.error("Delete error: ", await res.text());
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Toggle Task Status (Database + Frontend)
  const toggleStatus = async (task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";

    try {
      const res = await fetch(`${API_URL}&id=${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
      } else {
        console.error("Status toggle error: ", await res.text());
      }
    } catch (error) {
      console.error("Status toggle error:", error);
    }
  };

  // Edit Task (Frontend only, prepare for DB)
  const startEdit = (task) => {
    setEditingIndex(task.id);
    setEditingText(task.text);
  };

  // Save Task Edit (Database + Frontend)
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_URL}&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      });

      if (res.ok) {
        setTasks(
          tasks.map((t) =>
            t.id === id ? { ...t, text: editingText } : t
          )
        );
        setEditingIndex(null);
        setEditingText("");
      } else {
        console.error("Edit error: ", await res.text());
      }
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  return (
    <div className="task-wrapper">
      <header>
        <h2>To-Do List</h2>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "🌑 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      <div className="input-section">
        <input
          type="text"
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button className="add-btn" onClick={addTask}>Add</button>
      </div>

      <ul className="task-list">
        {tasks.map((t) => (
          <li className="task-item" key={t.id}>
            {editingIndex === t.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(t.id)}>Save</button>
              </>
            ) : (
              <>
                <span className="task-text">{t.text}</span>{" "}
                <span className={`task-status ${t.status}`}>({t.status})</span>

                <div className="task-controls">
                  <button onClick={() => toggleStatus(t)}>
                    {t.status === "pending" ? "✅ Completed" : "Pending"}
                  </button>
                  <button onClick={() => startEdit(t)}>✏️</button>
                  <button onClick={() => removeTask(t.id)}>🗑️</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
