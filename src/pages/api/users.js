import { pool } from "../../../lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password, role = "user" } = req.body;

  const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (existing.length > 0) return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
    name,
    email,
    hashedPassword,
    role,
  ]);

  res.status(201).json({ message: "User registered successfully" });
}
