import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import Loading from "../../../components/Loading";

export default function EditClass() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    type: "",
    batch: "",
    date: "",
    start_time: "",
    end_time: "",
    status: "done",
  });
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchClassDetails = async () => {
      try {
        const res = await fetch(`/api/classes/${id}`);
        const data = await res.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching class details.");
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        const data = await res.json();
        setStudents(data);
        setAttendance(
          data.reduce((acc, student) => ({ ...acc, [student.id]: false }), {})
        );
      } catch (error) {
        console.error("Error fetching students.");
      }
    };

    Promise.all([fetchClassDetails(), fetchStudents()]).then(() =>
      setLoading(false)
    );
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAttendanceChange = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/classes/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attendance }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Class updated successfully!");
      setTimeout(() => router.push("/dashboard/classes"), 2000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold">Edit Class</h1>
        {message && <p className="text-green-600">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            placeholder="Class Type"
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="batch"
            value={formData.batch}
            onChange={handleInputChange}
            placeholder="Batch"
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="done">Done</option>
            <option value="missed">Missed</option>
          </select>

          <h2 className="text-xl font-bold">Mark Attendance</h2>
          {students.map((student) => (
            <div key={student.id} className="flex items-center">
              <input
                type="checkbox"
                id={`attend-${student.id}`}
                checked={attendance[student.id]}
                onChange={() => handleAttendanceChange(student.id)}
                className="mr-2"
              />
              <label htmlFor={`attend-${student.id}`}>{student.name}</label>
            </div>
          ))}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Class
          </button>
        </form>
      </div>
    </Layout>
  );
}
