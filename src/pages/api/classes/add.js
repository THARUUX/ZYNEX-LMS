import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { type, date, start_time, end_time, status } = req.body;

  // Basic validation
  if (!type || !date || !start_time || !end_time || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Insert into database using the existing pool
    const [result] = await pool.query(
      `INSERT INTO classes (type, date, start_time, end_time, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [type, date, start_time, end_time, status]
    );

    return res.status(201).json({ message: "Class added successfully", id: result.insertId });
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
