import { pool } from "../../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { student_id, class_id } = req.body;

    const numericClassId = String(class_id);
    const numericStudentId = String(student_id);

    if (!numericClassId || !numericStudentId) {
      return res.status(400).json({ error: "Missing class_id or student_id" });
    }

    // Check if class exists
    const [classExists] = await pool.query("SELECT id FROM class_types WHERE id = ?", [numericClassId]);
    if (classExists.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check if student exists
    const [studentExists] = await pool.query("SELECT id FROM students WHERE id = ?", [numericStudentId]);
    if (studentExists.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if student is already assigned to the class
    const [alreadyAssigned] = await pool.query(
      "SELECT id FROM class_students WHERE class_id = ? AND student_id = ?",
      [numericClassId, numericStudentId]
    );

    if (alreadyAssigned.length > 0) {
      return res.status(409).json({ error: "Student is already assigned to this class" });
    }

    // Assign student to class
    await pool.query("INSERT INTO class_students (class_id, student_id) VALUES (?, ?)", [
      numericClassId,
      numericStudentId,
    ]);

    return res.status(200).json({ message: "Student assigned successfully" });
  } catch (error) {
    console.error("Error assigning student:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
