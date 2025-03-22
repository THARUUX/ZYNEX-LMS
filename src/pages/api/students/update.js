import pool from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { id, name, batch, joined_date } = req.body;

        if (!id || !name || !batch || !joined_date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            const [result] = await pool.query(
                "UPDATE students SET name = ?, batch = ?, joined_date = ? WHERE id = ?",
                [name, batch, joined_date, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({ message: "Student updated successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else if (req.method === "PUT") {
        const { id, status } = req.body;

        // Allow status = 0 (falsey values)
        if (id === undefined || status === undefined) {
            return res.status(400).json({ message: "ID and status are required" });
        }

        try {
            const [result] = await pool.query(
                "UPDATE students SET status = ? WHERE id = ?",
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({ message: "Student status updated successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
