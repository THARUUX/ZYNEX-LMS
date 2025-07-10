import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import { toast } from 'react-toastify';
import Tasks from '../components/Tasks';
import { FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Class() {
    const router = useRouter();
    const { id } = router.query;
    const [isLoading, setLoading] = useState(true);
    const [classType, setClassType] = useState(null);
    const [students, setStudents] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        if (id) {
            fetchClassType();
            fetchStudents();
            fetchAssignedStudents();
        }
    }, [id]);

    const fetchClassType = async () => {
        try {
            const res = await fetch(`/api/classTypes/${id}`);
            if (!res.ok) throw new Error("Error fetching class type.");
            const data = await res.json();
            setClassType(data);
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
        const res = await fetch("/api/students");
        const data = await res.json();
        setStudents(data);
        } catch (error) {
        toast.error('Error! fetching students' , {position: "top-center"})
        console.error("Error fetching students:", error);
        } finally {
        setLoading(false);
        }
    };

    const fetchAssignedStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/classStudents/");
            if (!res.ok) {
            toast.error('Error! fetching assigned students.' , {position: "top-center"})
            }
            const data = await res.json();
            setAssignedStudents(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching assigned students:", error);
            toast.error('Error! fetching assigned students.' , {position: "top-center"})
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredStudents(students.filter((s) => s.name.toLowerCase().includes(term)));
    };

    const assignStudent = async () => {
        setLoading(true);
        if (!selectedClass || !searchTerm) {
        if (alertRef.current) {
            toast.error('Error!' , {position: "top-center"});
        }
        return;
        }
    
        const student = students.find((s) => s.name.toLowerCase() === searchTerm.toLowerCase());
        if (!student) {
         toast.error('Student not found!', { position: "top-center" });
         setLoading(false);
        return;
        }
    
        try {
        console.log("Assigning Student:", { student_id: student.id, class_id: selectedClass });
        const res = await fetch("/api/classStudents/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: student.id, class_id: selectedClass }),
        });
    
        const data = await res.json(); // Read the response body
    
        if (!res.ok) {
            toast.error(data.error || "Error assigning student!", { position: "top-center" });
            return;
        }
    
        setSearchTerm("");
        toast.success("Student assigned.", { position: "top-center" });
        } catch (error) {
            toast.error("An unexpected error occurred!", { position: "top-center" });
        } finally {
            setLoading(false);
            fetchAssignedStudents();
        }
    }

    const handleDelete = async (id) => {
        setLoading(true);
        try {
        const res = await fetch(`/api/classStudents/${id}` , {
            method: "DELETE"
        });

        if(!res.ok){
            toast.error('Error!' , {position: "top-center"})
        } else {
            toast.success('Student removed.' , {position: "top-center"})
        }

        } catch (error) {
        toast.error('Error!' , {position: "top-center"})
        } finally {
        fetchAssignedStudents();
        setLoading(false);
        }
    }

    const searchedStudents = Array.isArray(assignedStudents) ? assignedStudents.filter(
        (entry) =>
            entry.class_name.toLowerCase().includes(filterText.toLowerCase()) ||
            entry.student_name.toLowerCase().includes(filterText.toLowerCase())
    ) : [];

    const downloadStudentList = (_rdata) => {
        const doc = new jsPDF();
        const tableColumn = ["Index", "Name"];
        const tableRows = _rdata.map((c) => [
            c.student_id,
            c.student_name,
        ]);
        //console.log(tableRows)

        doc.setFontSize(16);
        doc.text(`Student list of ${classType.name}`, 14, 15);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 10 },
            theme: "striped",
            headStyles: { fillColor: [52, 73, 94] },
            margin: { top: 25 },
            didDrawPage: (data) => {
                // Add footer
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

        doc.save(`${classType.name}-scores.pdf`);
    };

    return (
        <Layout isLoading={isLoading} title="Class Data">
            <div className="p-5">
                <div className="w-full tracking-wider py-3 text-lg sm:text-3xl text-slate-900 flex justify-between">
                    <div>Class: {classType ? classType.name : 'Not Found'}</div>
                </div>
                <div className='w-full flex flex-col py-5 gap-5'>
                    <div className='w-full text-xl'>Edit Class Name</div>
                    <form action="">
                        <div className='flex flex-col sm:flex-row gap-5'>
                            <input
                                type="text"
                                placeholder='Class Name'
                                value={classType ? classType.name : ''}
                                onChange={(e) => setClassType({ ...classType, name: e.target.value })}
                                className='px-4 py-2 shadow rounded w-full sm:w-1/3'
                            />
                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setLoading(true);
                                    try {
                                        const res = await fetch(`/api/classTypes/${id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name: classType.name }),
                                        });
                                        if (!res.ok) {
                                            const data = await res.json();
                                            toast.error(data.error || "Error updating class name.", { position: "top-center" });
                                            return;
                                        }
                                        toast.success("Class name updated successfully.", { position: "top-center" });
                                        fetchClassType(); // Refresh class type data
                                        fetchAssignedStudents(); // Refresh assigned students
                                    } catch (error) {
                                        toast.error("An unexpected error occurred while updating class name.", { position: "top-center" });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className='bg-slate-800 text-white px-4 py-2 rounded cursor-pointer hover:bg-slate-700 transition duration-200'
                            >
                                Update Class Name
                            </button>
                        </div>
                    </form>
                </div>
                <div className='flex flex-col sm:flex-row gap-5 mt-5'>
                    <div className='flex-col w-full sm:w-1/3 max-h-[70vh] sm:max-h-[70vh] overflow-y-auto shadow'>
                        <Tasks id={id}/>
                    </div>

                    <div className='flex-col p-5 w-full gap-4 flex sm:w-1/3 max-h-[70vh] sm:max-h-[70vh] overflow-y-auto shadow'>
                        <div className='text-lg'>Class Students</div>
                        <div className='w-full flex flex-col gap-4'>

                            <div className="w-full flex gap-3">
                                <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search for a student"
                                className="px-4 py-2 shadow rounded w-full peer focus:outline-none bg-slate-100"
                                />
                                {searchTerm && filteredStudents.length > 0 && (
                                <div id="inputDropdown" className="absolute mt-1 w-64 bg-white shadow-lg rounded z-10 peer-focus:block">
                                    {filteredStudents.filter((student) => student.status === 1).map((student) => (
                                    <div
                                        key={student.id}
                                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                                        onClick={() => {setSearchTerm(student.name); document.getElementById("inputDropdown").style.display="none";}}
                                    >
                                        {student.name}
                                    </div>
                                    ))}
                                </div>
                                )}
                                <button onClick={() => assignStudent()} className="bg-slate-800 text-white px-4 py-2 rounded">
                                    Assign
                                </button>
                            </div>

                            <div onClick={() => {
                                if (searchedStudents.filter(((entry) => entry.class_name === classType.name )) && searchedStudents.filter(((entry) => entry.class_name === classType.name )).length > 0) {
                                    downloadStudentList(searchedStudents.filter(((entry) => entry.class_name === classType.name )));
                                } else {
                                    alert("No students to download.");
                                }}
                                } className='py-2 px-3 bg-slate-200 flex gap-5 cursor-pointer justify-center items-center'>
                                    Download Student List
                                <FaDownload />
                            </div>

                            <label className="input bg-transparent shadow w-full">
                                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                                <input type="search" className="grow" placeholder="Search" value={filterText} onChange={(e) => setFilterText(e.target.value)}/>
                            </label>

                            <div className="min-w-1/3 max-h-[50vh] overflow-y-scroll">
                                <table className=" divide-y divide-gray-200 w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Students</th>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {searchedStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-2">No students found</td>
                                            </tr>
                                        ) : (
                                            searchedStudents.filter(((entry) => entry.class_name === classType?.name )).map((entry) => {
                                                return (
                                                    <tr key={`${entry.class_id}-${entry.student_id}`} className="hover:bg-gray-100" onClick={() => router.push(`/dashboard/Students/${entry.student_id}`)}>
                                                        <td className="px-6 py-4 text-sm text-gray-800">{entry.student_name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-800">
                                                            <button
                                                                onClick={(e) => {e.stopPropagation(); handleDelete(entry.id)}}
                                                                className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
