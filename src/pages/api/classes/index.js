import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [rows] = await pool.query(`SELECT 
          c.id, 
          ct.name AS type,
          c.date,
          c.start_time, 
          c.end_time, 
          c.status,
          c.attendance
      FROM classes c
      INNER JOIN class_types ct ON c.type = ct.id
      ORDER BY c.id;
      `);
        //console.log(rows);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: "Database error", error });
    }
  } else if (req.method === "PUT") {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing event ID or status" });

    try {
        await pool.query("UPDATE classes SET status = ? WHERE id = ?", [status, id]);
        return res.status(200).json({ message: "Class updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Error updating event" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
