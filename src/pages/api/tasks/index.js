import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { method } = req;

  if (!["GET", "POST"].includes(method)) {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    if (method === "POST") {
      const { classTypeId, taskName } = req.body;

      if (!classTypeId || !taskName) {
        return res.status(400).json({ message: "Class Type ID and Task Name are required." });
      }

      await pool.execute(
        "INSERT INTO tasks (class_type_id, task_name, status) VALUES (?, ?, ?)",
        [classTypeId, taskName, "0"]
      );

      return res.status(201).json({ message: "Task added successfully." });
    }

    if (method === "GET") {
      const { classTypeId } = req.query;

      if (!classTypeId) {
        return res.status(400).json({ message: "Class Type ID is required." });
      }

      const [tasks] = await pool.execute(
        "SELECT * FROM tasks WHERE class_type_id = ?",
        [classTypeId]
      );

      return res.status(200).json(tasks);
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
}
