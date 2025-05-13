import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            // Query the database to get all class types, ordered by ID
            const [students] = await pool.query("SELECT * FROM class_types ORDER BY id");

            // Check if no records are returned
            if (students.length === 0) {
                return res.status(404).json({ message: "No class types found" });
            }

            res.status(200).json(students);
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ message: "Database error", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
