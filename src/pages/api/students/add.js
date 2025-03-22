import pool from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
      const { name, batch, joined_date } = req.body;
  
      if (!name || !batch || !joined_date) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      try {
        const [result] = await pool.query(
          "INSERT INTO students (name, batch, joined_date, status) VALUES (?, ?, ?, ?)",
          [name, batch, joined_date , 1]
        );
  
        res.status(201).json({ message: "Student added successfully", studentId: result.insertId });
      } catch (error) {
        res.status(500).json({ message: "Database error", error });
      }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  }