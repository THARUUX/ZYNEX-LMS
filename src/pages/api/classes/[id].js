import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        try {
            const [rows] = await pool.query(
                `SELECT 
                    ct.name AS type,
                    ct.id,
                    c.date,
                    c.start_time, 
                    c.end_time, 
                    c.status,
                    c.attendance
                FROM classes c
                INNER JOIN class_types ct ON c.type = ct.id
                WHERE c.id = ?`,
                [id] 
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Class not found" });
            }

            console.log(rows);
            res.status(200).json(rows);
        } catch (error) {
            console.error("Database error: ", error);
            res.status(500).json({ message: "Database error", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
