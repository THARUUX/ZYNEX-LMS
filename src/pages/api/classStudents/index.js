import pool from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT cs.id, cs.class_id, c.name AS class_name, s.id AS student_id, s.name AS student_name
      FROM class_students cs
      JOIN class_types c ON cs.class_id = c.id
      JOIN students s ON cs.student_id = s.id
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
