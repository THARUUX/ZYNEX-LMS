import { clerkClient } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const response = await clerkClient.users.createUser({
      firstName: 'Test',
      lastName: 'User',
      emailAddress: [email],
      password: password,
    });

    return res.status(201).json({ message: "User created successfully", user: response });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
}