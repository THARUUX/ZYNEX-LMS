import pool from "../../../../lib/db";

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
        const [rows] = await pool.query("SELECT * FROM class_students WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(rows[0]);
        } catch (error) {
        res.status(500).json({ message: "Database error", error });
        }
    } else if (req.method === "DELETE"){
        try {
        const result = await pool.query("DELETE FROM class_students WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Database error", error });
        }
    }
}
