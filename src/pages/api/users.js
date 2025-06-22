import { pool } from "../../../lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { name, email, password, role = "user" } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );

      return res.status(201).json({ message: "User registered successfully" });
    }

    if (req.method === "GET") {
      const [users] = await pool.query("SELECT id, name, email, role FROM users");
      return res.status(200).json(users);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "User ID is required for deletion" });
      }

      const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "User deleted successfully" });
    }

    // Method not allowed
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("User API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
