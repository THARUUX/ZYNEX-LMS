import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { method } = req;

  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const classId = method === "GET" ? req.query.classId : req.body.classId;
  if (!classId) return res.status(400).json({ error: "classId is required" });

  try {
    const [rows] = await pool.execute("SELECT todos FROM classes WHERE id = ?", [classId]);
    let todos = rows.length ? JSON.parse(rows[0].todos || "[]") : [];

    if (method === "GET") {
      return res.status(200).json({ success: true, todos });
    }

    if (method === "POST") {
      const { todo } = req.body;
      if (!todo) return res.status(400).json({ error: "todo text is required" });

      todos.push({ id: Date.now(), text: todo, completed: false });

    } else if (method === "PUT") {
      const { id } = req.body;
      todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);

    } else if (method === "DELETE") {
      const { id } = req.body;
      todos = todos.filter(t => t.id !== id);
    }

    // Update the todos in the database (for POST, PUT, DELETE)
    if (method !== "GET") {
      await pool.execute("UPDATE classes SET todos = ? WHERE id = ?", [JSON.stringify(todos), classId]);
      return res.status(200).json({ success: true, todos });
    }

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Database error", details: error.message });
  }
}
