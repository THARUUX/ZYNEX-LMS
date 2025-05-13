import { dbError } from "../../../lib/db";

export default async function handler(req, res) {
  if (dbError) {
    return res.status(500).json({ error: "Database connection error" });
  }

  // Always send a response if no error exists
  return res.status(200).json({ message: "Database is connected" });
}
