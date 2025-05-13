import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { id, name, batch, joined_date } = req.body;

      if (!id || !name || !batch || !joined_date) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const [result] = await pool.execute(
        "UPDATE students SET name = ?, batch = ?, joined_date = ? WHERE id = ?",
        [name, batch, joined_date, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json({ message: "Student updated successfully" });
    }

    if (req.method === "PUT") {
      const { id, status } = req.body;

      if (typeof id === "undefined" || typeof status === "undefined") {
        return res.status(400).json({ message: "ID and status are required" });
      }

      const [result] = await pool.execute(
        "UPDATE students SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      return res.status(200).json({ message: "Student status updated successfully" });
    }

    res.setHeader("Allow", ["POST", "PUT"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
