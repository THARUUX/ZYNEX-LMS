import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, batch, joined_date } = req.body;

    if (!name || !batch || !joined_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const [result] = await pool.execute(
        "INSERT INTO students (name, batch, joined_date, status) VALUES (?, ?, ?, ?)",
        [name, batch, joined_date, 1]
      );

      return res.status(201).json({
        message: "Student added successfully",
        studentId: result.insertId,
      });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
