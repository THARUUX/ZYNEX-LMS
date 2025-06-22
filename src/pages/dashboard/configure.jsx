import React, { useState}  from 'react';
import Layout from './components/Layout';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import Loading from '../../../components/Loading';
import { MdDelete } from 'react-icons/md';

export default function Configure() {
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoading, setLoading] = useState(true);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Registration successful!");
      //router.push("/login");
      setLoading(false);
      setForm({ name: "", email: "", password: "", role: "user" });
      fetchUsers(); // Refresh the user list after successful registration
    } else if (res.status === 400) {
      toast.error(data.message || "Invalid input. Please check your data.");
      setLoading(false);
    } else if (res.status === 409) {
      toast.error(data.message || "Email already exists. Please use a different email.");
      setLoading(false);
    } else {
      toast.error(data.message || "Registration failed.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Error fetching users: " + error.message, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    if (!confirm("Are you sure you want to delete this user?")){
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete user", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Error deleting user: " + error.message , { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      {/*<iframe 
        src={`https://dashboard.clerk.com`} 
        className='w-full h-screen z-10' 
        allowFullScreen
        style={{ border: "none" }} 
      />*/}
      <div className='p-10'>
        <div className='sm:text-3xl'>Configure</div>
        <div className='sm:py-10'>
          <div className='sm:text-2xl'>Users</div>
          <div className='py-5'>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-5 justify-center items-center'>
              <div className='grow'>
                <input
                  className='outline-none w-full border-b-2 border-gray-300 focus:border-slate-500 px-2 py-1'
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grow'>
                <input
                  className='outline-none w-full border-b-2 border-gray-300 focus:border-slate-500 px-2 py-1'
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grow'>
                <input
                  className='outline-none w-full border-b-2 border-gray-300 focus:border-slate-500 px-2 py-1'
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='grow'>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className='outline-none border-b-2 border-gray-300 focus:border-slate-500 px-2 py-1 w-full'
                >
                  <option value="" disabled>Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className='bg-slate-900 text-white px-4 py-2 rounded grow'
              >
                Register
              </button>
            </form>
          </div>

          <div className='py-10 flex flex-col gap-3'>
            <h2 className="text-xl">Registered Users</h2>
              <ul className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id} className="flex justify-between items-center p-4 px-10 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email} ({user.role})</p>
                    </div>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      <MdDelete className='text-2xl' />
                    </button>
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
