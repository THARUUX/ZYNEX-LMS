import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  const { eventId, noteId, text } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  try {
    const [rows] = await pool.query("SELECT notes FROM events WHERE id = ?", [eventId]);
    let notes = rows.length ? JSON.parse(rows[0].notes || "[]") : [];

    if (req.method === "POST") {
      if (!text) {
        return res.status(400).json({ error: "Note text is required for POST" });
      }
      notes.push({ id: Date.now(), text });

    } else if (req.method === "PUT") {
      if (!noteId || !text) {
        return res.status(400).json({ error: "Note ID and updated text are required for PUT" });
      }
      notes = notes.map(n => (n.id === noteId ? { ...n, text } : n));

    } else if (req.method === "DELETE") {
      if (!noteId) {
        return res.status(400).json({ error: "Note ID is required for DELETE" });
      }
      notes = notes.filter(n => n.id !== noteId);

    } else {
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    await pool.query("UPDATE events SET notes = ? WHERE id = ?", [JSON.stringify(notes), eventId]);
    res.status(200).json({ success: true, notes });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
}
