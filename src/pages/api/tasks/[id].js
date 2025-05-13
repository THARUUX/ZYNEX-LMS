import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Task ID is required" });
  }

  try {
    if (req.method === "PATCH") {
      const { status } = req.body;

      if (typeof status === "undefined") {
        return res.status(400).json({ error: "Status is required" });
      }

      const [result] = await pool.execute(
        "UPDATE tasks SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.status(200).json({ message: "Task status updated successfully" });
    }

    if (req.method === "DELETE") {
      const [result] = await pool.execute("DELETE FROM tasks WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found or already deleted" });
      }

      return res.status(200).json({ message: "Task deleted successfully" });
    }

    res.setHeader("Allow", ["PATCH", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
