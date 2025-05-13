import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;
    try {
      const result = await pool.query("INSERT INTO class_types (name) VALUES (?)", [name]);
      res.status(201).json({ message: "Class type added", id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: "Database error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
