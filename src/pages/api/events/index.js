import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
            return res.status(200).json(rows);
        }

        if (req.method === "POST") {
            const { title, date, deadline } = req.body;

            if (!title || !date || !deadline) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const [result] = await pool.query(
                "INSERT INTO events (title, date, deadline) VALUES (?, ?, ?)",
                [title, date, deadline]
            );

            return res.status(201).json({
                id: result.insertId,
                title,
                date,
                deadline,
                status: "pending"
            });
        }

        if (req.method === "PUT") {
            const { id, status } = req.body;

            if (!id || status === undefined) {
                return res.status(400).json({ error: "Event ID and status are required" });
            }

            const [result] = await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({ message: "Event updated successfully" });
        }

        if (req.method === "DELETE") {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: "Event ID is required" });
            }

            const [result] = await pool.query("DELETE FROM events WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Event not found" });
            }

            return res.status(200).json({ message: "Event deleted successfully" });
        }

        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });

    } catch (error) {
        console.error("Event handler error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
