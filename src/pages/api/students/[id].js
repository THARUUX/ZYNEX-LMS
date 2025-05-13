import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const [result] = await pool.query("DELETE FROM students WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json({ message: "Student deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
}
