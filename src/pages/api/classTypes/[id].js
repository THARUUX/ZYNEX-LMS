import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "Class type ID is required" });
    }

    if (req.method === "GET") {
        try {
            // Attempt to fetch the class type with the given ID
            const [rows] = await pool.query("SELECT * FROM class_types WHERE id = ?", [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Class type not found" });
            }

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error("Database error:", error);
            // Specific handling for connection issues
            if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
                return res.status(500).json({ message: "Database connection issue. Please try again later." });
            }

            res.status(500).json({ message: "Error fetching class type", error: error.message });
        }
    } else if (req.method === "DELETE") {
        try {
            // Attempt to delete the class type with the given ID
            const [result] = await pool.query("DELETE FROM class_types WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Class type not found" });
            }

            res.status(200).json({ message: "Class type deleted successfully" });
        } catch (error) {
            console.error("Database error:", error);
            // Specific handling for connection issues
            if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
                return res.status(500).json({ message: "Database connection issue. Please try again later." });
            }

            res.status(500).json({ message: "Error deleting class type", error: error.message });
        }
    } else if (req.method === "PUT") {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Class type name is required" });
        } else {
            try {
                // Attempt to update the class type with the given ID
                const [result] = await pool.query("UPDATE class_types SET name = ? WHERE id = ?", [name, id]);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Class type not found" });
                }

                res.status(200).json({ message: "Class type updated successfully" });
            } catch (error) {
                console.error("Database error:", error);
                // Specific handling for connection issues
                if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
                    return res.status(500).json({ message: "Database connection issue. Please try again later." });
                }

                res.status(500).json({ message: "Error updating class type", error: error.message });
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
