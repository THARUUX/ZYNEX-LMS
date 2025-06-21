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
      const { type, typeID, student_id } = req.query;

      try {
        let query = "SELECT * FROM scores WHERE 1=1";
        const values = [];

        if (type && typeID) {
          query += " AND type = ? AND type_id = ?";
          values.push(type, typeID);
        }

        if (student_id) {
          query += " AND student_id = ?";
          values.push(student_id);
        }

        const [rows] = await pool.execute(query, values);
        res.status(200).json(rows);
      } catch (error) {
        console.error("Database fetch error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Missing score ID." });
    }

    try {
      const [result] = await pool.execute("DELETE FROM scores WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Score not found." });
      }

      res.status(200).json({ message: "Score deleted successfully." });
    } catch (error) {
      console.error("Database delete error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

  } else {
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
