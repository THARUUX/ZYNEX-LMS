import pool from "../../../../lib/db";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { classTypeId, taskName } = req.body;

        if (!classTypeId || !taskName) {
            return res.status(400).json({ message: "Class Type ID and Task Name are required." });
        }

        try {
            await pool.query("INSERT INTO tasks (class_type_id, task_name, status) VALUES (?, ?, ?)", [classTypeId, taskName, "0"]);
            res.status(201).json({ message: "Task added successfully." });
        } catch (error) {
            res.status(500).json({ message: "Database error", error });
        }
    } else if (req.method === "GET") {
        const { classTypeId } = req.query;
        if (!classTypeId) {
            return res.status(400).json({ message: "Class Type ID is required." });
        }

        try {
            const [tasks] = await pool.query("SELECT * FROM tasks WHERE class_type_id = ?", [classTypeId]);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: "Database error", error });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
