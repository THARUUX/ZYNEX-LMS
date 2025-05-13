import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const [students] = await pool.execute("SELECT * FROM students ORDER BY id");
      return res.status(200).json(students);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
