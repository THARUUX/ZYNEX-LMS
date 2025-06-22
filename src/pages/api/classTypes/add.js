import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name } = req.body;
  console.log("Received class type name:", name);

  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Class type name is required" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM class_types WHERE name = ?", [name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Class type already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO class_types (name) VALUES (?)",
      [name.trim()]
    );

    return res.status(201).json({ message: "Class type added", id: result.insertId });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
}
