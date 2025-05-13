import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { className } = req.query; // Use req.query instead of req.body

        if (!className) {
            return res.status(400).json({ message: "Class name is required" });
        }

        try {
            const [students] = await pool.query(
                `SELECT s.id AS student_id, s.name AS student_name
                 FROM students s
                 INNER JOIN class_students cs ON s.id = cs.student_id
                 INNER JOIN class_types ct ON cs.class_id = ct.id
                 WHERE ct.name = ?`, 
                [className] // Use parameterized query to prevent SQL injection
            );

            res.status(200).json(students);
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ message: "Database error", error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
