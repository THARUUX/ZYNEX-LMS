import pool from "../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { classId, attendance } = req.body;

            if (!classId || !attendance || !Array.isArray(attendance)) {
                return res.status(400).json({ message: "Invalid data" });
            }

            // Convert attendance array to JSON format
            const attendanceJson = JSON.stringify({ students: attendance });

            // Update attendance in the database
            const query = `UPDATE classes SET attendance = ? WHERE id = ?`;
            await pool.query(query, [attendanceJson, classId]);

            res.status(200).json({ message: "Attendance saved successfully" });
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ message: "Database error", error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
