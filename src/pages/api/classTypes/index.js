import pool from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Query the database to get all students
      const [students] = await pool.query("SELECT * FROM class_types ORDER BY id");

      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: "Database error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
