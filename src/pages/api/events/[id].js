import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    const { id } = req.query;

    // Check if 'id' is present in the query
    if (!id) {
        return res.status(400).json({ message: "ID required" });
    }

    try {
        // Handling GET method to fetch event by ID
        if (req.method === "GET") {
            const [result] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);

            if (result.length === 0) {
                return res.status(404).json({ message: "Event not found" });
            }

            return res.status(200).json(result[0]);
        }

        // Handling PUT method to update event
        else if (req.method === "PUT") {
            const { name, starting_date, deadline } = req.body;

            // Input validation
            if (!name || !starting_date || !deadline) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const [updateResult] = await pool.query(
                "UPDATE events SET title = ?, date = ?, deadline = ? WHERE id = ?",
                [name, starting_date, deadline, id]
            );

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ message: "Event not found or no changes made" });
            }

            return res.status(200).json({ message: "Event updated successfully" });
        }

        // Handling POST method to add students to the event
        else if (req.method === "POST") {
            const { students } = req.body;

            // Validate that 'students' is an array
            if (!Array.isArray(students)) {
                return res.status(400).json({ error: "Students should be an array" });
            }

            const [eventResult] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);

            if (eventResult.length === 0) {
                return res.status(404).json({ message: "Event not found" });
            }

            const currentStudents = eventResult[0]?.students || [];
            const updatedStudents = [...currentStudents, ...students];

            await pool.query(
                "UPDATE events SET students = ? WHERE id = ?",
                [JSON.stringify(updatedStudents), id]
            );

            return res.status(200).json({ message: "Student(s) added successfully" });
        } else if (req.method === "DELETE") {
            // Handling DELETE method to remove the event
            const [deleteResult] = await pool.query("DELETE FROM events WHERE id = ?", [id]);

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: "Event not found" });
            }

            return res.status(200).json({ message: "Event deleted successfully" });
        }

        // Method not allowed for other requests
        else {
            return res.status(405).json({ message: "Method not allowed" });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
