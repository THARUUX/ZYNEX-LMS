import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Query to get the class-student assignments
        const [rows] = await pool.query(`
            SELECT cs.id, cs.class_id, c.name AS class_name, s.id AS student_id, s.name AS student_name
            FROM class_students cs
            JOIN class_types c ON cs.class_id = c.id
            JOIN students s ON cs.student_id = s.id
        `);

        // Return the result as a JSON response
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching assigned students:", error);
        
        // Specific connection error handling
        if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
            return res.status(500).json({ error: "Database connection issue. Please try again later." });
        }

        // General internal server error
        res.status(500).json({ error: "Internal Server Error" });
    }
}
