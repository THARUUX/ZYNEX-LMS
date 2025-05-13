import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { classId, attendance } = req.body;

      // ✅ Basic validation
      if (!classId || !Array.isArray(attendance)) {
        return res.status(400).json({ message: "Invalid data." });
      }

      // ✅ Convert attendance array to JSON
      const attendanceJson = JSON.stringify({ students: attendance });

      // ✅ Use `pool.execute` to avoid unnecessary overhead
      const query = `UPDATE classes SET attendance = ? WHERE id = ?`;
      await pool.execute(query, [attendanceJson, classId]);

      return res.status(200).json({ message: "Attendance saved successfully." });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  // Method not allowed
  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
