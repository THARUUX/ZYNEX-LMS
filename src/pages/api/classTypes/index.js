import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "GET") {
        let connection;
        try {
            connection = await pool.getConnection();
            const [students] = await connection.query("SELECT * FROM class_types ORDER BY id");

            if (students.length === 0) {
                return res.status(404).json({ message: "No class types found" });
            }

            res.status(200).json(students);
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ message: "Database error", error: error.message });
        } finally {
            if (connection) connection.release(); // Safely release
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
