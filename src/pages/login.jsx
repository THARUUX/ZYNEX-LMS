import { useState } from "react";
import { useRouter } from "next/router";
import Cookie from "js-cookie";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    
    if (res.ok) {
      Cookie.set("token", data.token, { path: "/" });
      router.push("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-cover bg-center bg-[url('/Assets/bg.png')] bg-bl">
      <form onSubmit={handleSubmit} className="backdrop-blur-md bg-white/10 brightness-150 py-10 w-full sm:w-auto flex px-10 flex-col rounded-lg">
        <h1 className="w-full  text-white/75 py-5 flex flex-col items-center justify-center"><span className="tracking-widest text-4xl">ZYNEX LMS</span> <span className="uppercase tracking-[100%] text-sm mt-2">login</span></h1>
        <div className="flex flex-col gap-10 py-10 sm:w-96">
          <input name="email" className="border-b border-white focus:outline-0 text-white px-2 py-2" placeholder="Email" onChange={handleChange} required />
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="border-b border-white focus:outline-0 text-white px-2 py-2"
            onChange={handleChange}
            required
          />
        </div>
        <div className="w-full flex justify-center items-center mb-10">
          <button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 w-full py-2 rounded text-white cursor-pointer hover:brightness-125 duration-300">Login</button>
        </div>
      </form>
    </div>
  );
}

