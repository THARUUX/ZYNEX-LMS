import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { MdDelete } from "react-icons/md";
import { useConfirm } from '../components/Dialog';
import { FaDownload } from "react-icons/fa";
import BarGraph from '../components/BarGraph';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EventPage() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setLoading] = useState(true);
    const [event, setEvent] = useState({});
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        starting_date: "",
        deadline: ""
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [ engageStudentData , setEngageStudentData ] = useState({
        id: "",
        name: "",
        typeId: id,
        score: "",
        type: "event",
        date: ""
    });
    const [scores , setScores] = useState([]);
    const [reportData , setReportData] = useState([]);

    const fetchEvent = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
                setFormData({
                    id: data.id,
                    name: data.title,  // Adjust according to API response
                    starting_date: data.date.split('T')[0],
                    deadline: data.deadline.split('T')[0]
                });
            } else {
                toast.error("Error fetching event", { position: "top-center" });
            }
        } catch (error) {
            toast.error("Error fetching event", { position: "top-center" });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            fetchEvent();
            fetchStudents();
            fetchScores();
        }
    }, [id]); 
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Event updated successfully!", { position: "top-center" });
                fetchEvent(); // Refresh data after update
            } else {
                toast.error("Failed to update event", { position: "top-center" });
            }
        } catch (error) {
            toast.error("Error updating event", { position: "top-center" });
        }
    };

    const { ask } = useConfirm();

    const confirmDelete = async (name , _id) => {
        const result = await ask(`Are you sure you want to delete ${name}'s score?`);
        if (result) {
         try {
            await fetch(`/api/score?id=${_id}`, {
            method: "DELETE"
            });
            fetchScores();
         } catch {
            toast.error("Error deleting score", { position: "top-center" });
         }
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/students");
            if (!res.ok) toast.error("Error fetching students", { position: "top-center" });
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Error fetching students", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };
    

    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredStudents(students.filter((s) => s.name.toLowerCase().includes(term)));
        setShowDropdown(term.length > 0);
    };


    const engageStudent = async () => {
        if (!engageStudentData.id || !engageStudentData.name || !engageStudentData.score || !engageStudentData.type || !engageStudentData.date) {
            //console.log(engageStudentData);
            return toast.error("Please select a student and enter a score!", { position: "top-center" });
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...engageStudentData, type: "event", typeId: id }),
            });

            if (res.ok) {
                toast.success("Student added successfully!", { position: "top-center" });
                fetchScores();
                setEngageStudentData({ id: "", name: "", score: "", typeId: id , date: "", type: "event" });
                setSearchTerm(""); // Clear search input
            } else {
                toast.error("Failed to add student", { position: "top-center" });
            }
        } catch {
            toast.error("Error adding student", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const fetchScores = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/score?type=event&typeID=${id}`, { method: 'GET' }); // ✅ Added await
    
            if (res.ok) {
                const data = await res.json();
                console.log('Scores' , data);
                setScores(data);
            } else {
                toast.error("Error fetching scores from database", { position: "top-center" });
            }
        } catch (error) {
            console.error("Error fetching scores:", error);
            toast.error("Error fetching scores", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };
    
    const downloadScoresPDF = (_rdata) => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Score (%)", "Submitted Date"];
        const tableRows = _rdata.map((c) => [
            c.student_name,
            `${c.score}%`,
            c.date,
        ]);
        console.log(tableRows)

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10 },
            theme: "striped",
            headStyles: { fillColor: [52, 73, 94] },
            margin: { top: 20 },
        });

        doc.save("scores-table.pdf");
    };

    useEffect(() => {
    if (scores && scores.length > 0) {
        const transedData = scores.map((item) => ({
        name: item.student_name,
        Marks: Number(item.score), // Score shown in the bar chart
        uv: 0,
        amt: 0,
        }));

        setReportData(transedData);
    }
    }, [scores]); // ✅ Run only when `scores` changes

    

    return (
        <Layout isLoading={isLoading}>
            <div className="p-5">
                <div className="w-full tracking-wider sm:px-5 py-3 text-xl sm:text-3xl text-slate-900">
                    Event: {event?.title} | {event?.date?.split("T")[0]} - {event?.deadline?.split("T")[0]}
                </div>
                <div className="w-full flex flex-col  py-5">
                    <form onSubmit={handleSubmit} className="flex  w-full sm:px-5 flex-wrap items-end gap-4 justify-between sm:justify-normal">
                        <div className="flex w-full sm:w-2/5 gap-2">
                            <div className=" sm:max-w-sm">
                                <label htmlFor="id">Event ID</label>
                                <input
                                    type="text"
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                                    disabled
                                />
                            </div>
                            <div className="grow-1 sm:max-w-sm">
                                <label htmlFor="name">Event name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-2/5 flex gap-2">
                            <div className="grow-1 flex-col sm:max-w-sm flex justify-center">
                                <label htmlFor="starting_date">Starting Date</label>
                                <input
                                    type="date"
                                    id="starting_date"
                                    name="starting_date"
                                    value={formData.starting_date}
                                    onChange={handleChange}
                                    className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="grow-1 flex-col sm:max-w-sm flex justify-center">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <button className="bg-slate-900 h-fit w-full sm:w-fit text-white px-5 py-2 shadow-md cursor-pointer gap-2 rounded duration-200 hover:bg-slate-600 flex justify-center items-center" type="submit">
                            Update
                        </button>
                    </form>
                </div>
                <div className='w-full flex gap-5 flex-col sm:flex-row sm:p-5'>
                    <div className='w-full sm:w-2/5 p-5 flex-col sm:flex-row rounded max-h-screen sm:max-h-[70vh] overflow-y-scroll shadow-lg'>
                        <div className="w-full text-xl my-3">Score Board</div>
                        <div className="flex flex-wrap gap-2 justify-between">
                            <div className="relative w-full flex gap-3">
                                <div className='w-full'>
                                    <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search for a student"
                                    className="px-4 py-2 shadow rounded w-full focus:outline-none bg-slate-100 peer"
                                    />
                                    {showDropdown && filteredStudents.length > 0 && (
                                        <div className="absolute mt-1 w-64 bg-white shadow-lg rounded z-10">
                                            {filteredStudents.filter((student) => student.status === 1).map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                                                    onClick={() => {
                                                        setSearchTerm(student.name);
                                                        setEngageStudentData({...engageStudentData, name: student.name, id: student.id });
                                                        setShowDropdown(false); // ✅ Close dropdown when selecting
                                                    }}
                                                >
                                                    {student.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='flex gap-2 w-full flex-wrap sm:flex-nowrap'>
                                <label className="input bg-slate-100  grow-1">
                                    Score
                                    <input
                                        max={100}
                                        min={0}
                                        type="number"
                                        value={engageStudentData.score}
                                        onChange={(e) => setEngageStudentData({ ...engageStudentData, score: e.target.value })}
                                        placeholder="%"
                                        className=" px-4 py-2 rounded focus:outline-none "
                                    />
                                </label>
                                <label className="input bg-slate-100 grow-1">
                                    Date
                                    <input
                                        type="date"
                                        value={engageStudentData.date}
                                        onChange={(e) => {setEngageStudentData({ ...engageStudentData, date: e.target.value })}}
                                        className="w-full px-4 py-2 rounded focus:outline-none "
                                    />
                                </label>
                                <button onClick={() => engageStudent()} className="bg-slate-800 grow text-white px-4 py-2 rounded">
                                    Submit
                                </button>
                            </div>
                        </div>
                        <div className="overflow-scroll mt-5">
                            <div onClick={() => {
                                if (scores && scores.length > 0) {
                                downloadScoresPDF(scores);
                                } else {
                                    alert("No scores to download.");
                                }}
                                } className='py-2 px-3 bg-slate-200 flex gap-5 cursor-pointer justify-center items-center'>
                                    Download PDF
                                <FaDownload />
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 max-h-screen overflow-y-scroll ">
                                {scores.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-2">No students scored</td>
                                </tr>
                                ) : (
                                scores.map((c) => (
                                    <tr key={c.id}  className={c.status === "done" ? 'bg-green-200 duration-300 hover:bg-green-50 cursor-pointer' : 'bg-blue-50 duration-300 hover:bg-blue-100 cursor-pointer'}>
                                    <td className="text-xs sm:text-sm px-6 py-4">{c.student_name}</td>
                                    <td className="text-xs sm:text-sm px-6 py-4">{c.score}%</td>
                                    <td className="text-xs sm:text-sm px-6 py-4">{c.date}</td>
                                    <td className="text-xs sm:text-sm px-6 py-4 flex justify-center">
                                        <button
                                                className="cursor-pointer"
                                                type="button"
                                                onClick={(event) => {
                                                    confirmDelete(c.student_name , c.id)
                                                }}
                                            >
                                                <MdDelete className='text-red-500 text-xl' />
                                        </button>
                                    </td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="w-full hidden sm:flex sm:w-1/2">
                        <BarGraph data={reportData} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
