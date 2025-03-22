import pool from "../../../../lib/db";

export default async function handler(req, res) {
    const { id } = req.query;  // Accessing 'id' instead of 'taskId'

    if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
    }

    if (req.method === "PATCH") {
        try {
            const { status } = req.body;

            const [result] = await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            return res.status(200).json({ message: "Task status updated successfully" });
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    if (req.method === "DELETE") {
        try {
            const [existingTask] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);  // Use 'id' instead of 'taskId'

            if (existingTask.length === 0) {
                return res.status(404).json({ message: "Task not found" });
            }

            const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(500).json({ message: "Failed to delete task. Please try again." });
            }

            return res.status(200).json({ message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error deleting task:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    res.setHeader("Allow", ["PATCH", "DELETE"]);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
}
