import React, { useState}  from 'react';
import Layout from './components/Layout';
import Link from 'next/link';

export default function Configure() {
  const iframeurl = process.env.NEXT_PUBLIC_CLERK_UP_URL;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("User created successfully!");
      } else {
        setMessage(data.error || "Error creating user.");
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <Layout>
      {/*<iframe 
        src={`https://dashboard.clerk.com`} 
        className='w-full h-screen z-10' 
        allowFullScreen
        style={{ border: "none" }} 
      />*/}
      <div className='flex gap-3 p-10'><Link href={iframeurl} className='bg-slate-800 text-white px-3 py-2 rounded'>Add Users</Link></div>
      <div>
      <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Create Users</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-slate-800 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
      </div>
    </Layout>
  );
}
