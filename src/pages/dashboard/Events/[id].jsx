import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { MdDelete } from "react-icons/md";
import { useConfirm } from '../../../../components/Dialog';
import { FaDownload } from "react-icons/fa";
import BarGraph from '../components/BarGraph';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaCrown } from "react-icons/fa6";
import { FaMedal } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";
import { PiRanking } from "react-icons/pi";

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
    const [topThree, setTopThree] = useState([]);


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
                    name: data.title,  
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
                fetchEvent();
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
                setSearchTerm("");
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
                const sorted = [...data].sort((a, b) => b.score - a.score);
                const top3 = sorted.slice(0, 3); 
                setTopThree(top3);
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
        //console.log(tableRows)

        doc.setFontSize(16);
        doc.text(`${event?.title}`, 14, 15);

        doc.setFontSize(10);
        doc.text(`Event Date: ${event?.date?.split("T")[0]} - Deadline: ${event?.deadline?.split("T")[0]}`, 14, 25);

        doc.setFontSize(10);
        doc.text(`1st Place - ${topThree?.[0].student_name}  ${topThree?.[0].score}%`, 14, 35);
        doc.text(`2nd Place - ${topThree?.[1].student_name}  ${topThree?.[1].score}%`, 14, 40);
        doc.text(`3rd Place - ${topThree?.[2].student_name}  ${topThree?.[2].score}%`, 14, 45);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10 },
            theme: "striped",
            headStyles: { fillColor: [52, 73, 94] },
            margin: { top: 55 },
            didDrawPage: (data) => {
                const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                doc.setFontSize(8);
                doc.text(
                    `Page ${doc.internal.getNumberOfPages()}`, 
                    data.settings.margin.left, 
                    pageHeight - 10
                );

                doc.text(
                    "ZYNEX LMS | lms.zynex.info", 
                    doc.internal.pageSize.getWidth() - data.settings.margin.right, 
                    pageHeight - 10,
                    { align: "right" }
                );
            }
        });

        doc.save(`${event?.title}-scores.pdf`);
    };


    const downloadParticipantsPDF = (_rdata) => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Batch" , "Participated"];
        
        const tableRows = _rdata.map((c) => {
            const participated = scoreStudentsIds.includes(Number(c.id));
            return [c.name, c.batch , participated ? 'Yes' : 'No'];
        });

        doc.setFontSize(16);
        doc.text(`Participation report of ${event?.title}`, 14, 15);

        doc.setFontSize(10);
        doc.text(
            `Event Date: ${event?.date?.split("T")[0]} | Deadline: ${event?.deadline?.split("T")[0]}`,
            14,
            25
        );

        doc.setFontSize(12);
        doc.text(
            `${participationFilter === "All Statuses" ? 'All participants' : `${participationFilter} students`} ${
            selectedBatch === "All Batches" ? "" : `of ${selectedBatch} batch`
            }`,
            14,
            35
        );

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10 },
            theme: "striped",
            headStyles: { fillColor: [52, 73, 94] },
            margin: { top: 38 },
            willDrawCell: function (data) {
                const rowIndex = data.row.index;
                const participated = tableRows[rowIndex]?.[tableRows[rowIndex].length - 1] === "Yes";

                if (data.section === 'body' && !participated) {
                doc.setFillColor(255, 230, 230); 
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                }
            },
            didDrawPage: (data) => {
            const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
            doc.setFontSize(8);
            doc.text(
                `Page ${doc.internal.getNumberOfPages()}`,
                data.settings.margin.left,
                pageHeight - 10
            );

            doc.text(
                "ZYNEX LMS | lms.zynex.info",
                doc.internal.pageSize.getWidth() - data.settings.margin.right,
                pageHeight - 10,
                { align: "right" }
            );
            }
        });

        doc.save(`${event?.title} - participation report.pdf`);
    };


    const [scoreStudentsIds, setScoreStudentsIds] = useState([]);

    useEffect(() => {
    if (scores && scores.length > 0) {
        const transedData = scores.map((item) => ({
        name: item.student_name,
        Marks: Number(item.score),
        uv: 0,
        amt: 0,
        }));

        setReportData(transedData);
        setScoreStudentsIds(scores.map(score => score.student_id));
    }
    }, [scores]);


    const [searchTermParticipate, setSearchTermParticipate] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All Batches');
    const [participationFilter, setParticipationFilter] = useState('All Statuses');

    const allBatches = ['All Batches', ...new Set(students.map(student => student.batch))];

    const filteredStudentsParticipate = students.filter((student) => {
        const nameMatch = student.name.toLowerCase().includes(searchTermParticipate.toLowerCase());

        const batchMatch = selectedBatch === 'All Batches' || String(student.batch) === String(selectedBatch);

        const participated = scoreStudentsIds.includes(Number(student.id));

        const participationMatch =
            participationFilter === 'All Statuses' ||
            (participationFilter === 'Participated' && participated) ||
            (participationFilter === 'Not Participated' && !participated);

        return nameMatch && batchMatch && participationMatch;
    });

    

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
                                                        setShowDropdown(false); 
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
                    <div className="w-full hidden sm:flex items-center justify-center sm:w-1/2">
                        <BarGraph data={reportData} />
                    </div>
                </div>

                <div className='flex pt-5 sm:p-5'>
                    <div className='w-full sm:w-2/5 bg-green-100 flex justify-center items-start p-10 rounded-lg shadow-lg flex-col gap-5'>
                    <div className="w-full text-center text-xl flex gap-2 justify-center items-center font-bold"><PiRanking className='text-2xl'/> TOP 3</div>
                    <table className='w-full'>
                        <thead>
                            <tr>
                                <th className='text-lg text-gray-700 py-2'>Rank</th>
                                <th className='text-lg text-gray-700 py-2'>Name</th>
                                <th className='text-lg text-gray-700 py-2'>Score</th>
                            </tr>
                        </thead>
                        <tbody className=''>
                            {topThree.length === 0 ? (
                                <tr>
                                    <td className='text-center text-gray-500'>No scores available</td>
                                </tr>
                            ) : (
                                topThree.map((student, index) => (
                                    <tr key={index} onClick={() => {router.push(`/dashboard/Students/${student.student_id}`); setLoading(true)}} className='hover:bg-green-200 cursor-pointer duration-300 py-3'>
                                        <td className='text-gray-700 flex items-center gap-2 text-center justify-center px-3 py-2'>
                                            {index === 0 ? <FaCrown className='text-yellow-500' /> : index === 1 ? <PiMedalFill className='text-slate-500' /> : <FaMedal className='text-orange-500' />}
                                            {index + 1}
                                        </td>
                                        <td className='text-gray-700 px-3 py-2'>{student.student_name || '-'}</td>
                                        <td className='text-gray-700 text-center py-2'>{student.score || '-'}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
                <div className="sm:p-5 mt-10 sm:mt-0">
                    <div className="w-full p-5 flex flex-col shadow-lg rounded">
                        <div className="text-xl">Student participating report</div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 ">
                            <div className='w-full sm:w-1/2 flex items-end'>
                                <input
                                    type="text"
                                    placeholder="Search by name"
                                    value={searchTermParticipate}
                                    onChange={(e) => setSearchTermParticipate(e.target.value)}
                                    className="px-3 py-2 rounded shadow text-sm w-full" 
                                />
                            </div>

                            <div className='flex flex-col grow'>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    className="px-3 py-2 rounded shadow text-sm"
                                >
                                    {allBatches.map((batch, index) => (
                                    <option key={index} value={String(batch)}>{batch}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col grow'>
                                <select
                                    value={participationFilter}
                                    onChange={(e) => setParticipationFilter(e.target.value)}
                                    className="px-3 py-2 rounded shadow text-sm"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Participated">Participated</option>
                                    <option value="Not Participated">Not Participated</option>
                                </select>
                            </div>



                            <div  onClick={() => {
                                if (filteredStudentsParticipate && filteredStudentsParticipate.length > 0) {
                                downloadParticipantsPDF(filteredStudentsParticipate);
                                } else {
                                    alert("No data to download.");
                                }}
                                } className='py-2 px-3 bg-slate-200 flex gap-5 cursor-pointer justify-center items-center grow rounded'>
                                    Download PDF
                                <FaDownload />
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Participated</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredStudentsParticipate.length > 0 ? (
                                filteredStudentsParticipate.map((student, index) => {
                                const participated = scoreStudentsIds.includes(Number(student.id));
                                return (
                                    <tr
                                    key={index}
                                    onClick={() => {
                                        router.push(`/dashboard/Students/${student.id}`);
                                        setLoading(true);
                                    }}
                                    className="hover:bg-green-50 cursor-pointer"
                                    >
                                    <td className="text-xs sm:text-sm px-6 py-4">{student.name}</td>
                                    <td className="text-xs sm:text-sm px-6 py-4">{student.batch}</td>
                                    <td className={participated ? 'text-green-600 text-xs sm:text-sm px-6 py-4 flex justify-center' : 'text-red-500 text-xs sm:text-sm px-6 py-4 flex justify-center'}>
                                        {participated ? '✅' : '❌'}
                                    </td>
                                    </tr>
                                );
                                })
                            ) : (
                                <tr>
                                <td colSpan={2} className="text-center text-gray-500 py-3">No students found</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
