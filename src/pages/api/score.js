import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id, name, score, type, typeId, date } = req.body;

    if (!id || !name || !score || !date || !typeId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      await pool.execute(
        "INSERT INTO scores (student_name, student_id, score, type, type_id, date) VALUES (?, ?, ?, ?, ?, ?)",
        [name, id, score, type, typeId, date]
      );

      res.status(200).json({ message: "Score added successfully!" });
    } catch (error) {
      console.error("Database insert error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

  } else if (req.method === "GET") {
    const { type, typeID } = req.query;

    if (!type || !typeID) {
      return res.status(400).json({ message: "Missing query parameters." });
    }

    try {
      const [rows] = await pool.execute(
        "SELECT * FROM scores WHERE type = ? AND type_id = ?",
        [type, typeID]
      );

      res.status(200).json(rows);
    } catch (error) {
      console.error("Database fetch error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
