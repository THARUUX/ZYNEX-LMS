import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import { toast } from 'react-toastify';
import PieChartComponent from '../components/PieChart';
import Tasks from '../components/Tasks';

export default function Class() {
    const router = useRouter();
    const { id } = router.query;
    const [classData, setClassData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [classStudents, setClassStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // Store attendance state
    const [present, setPresent] = useState(0);
    const [absent, setAbsent] = useState(0);

    useEffect(() => {
        const presentCount = Object.values(attendance).filter(value => value).length;
        setPresent(presentCount);
        setAbsent(classStudents.length - presentCount);
    }, [attendance, classStudents]); // Runs only when these dependencies change

    const attendanceData = [
        { name: "Present", value: present },
        { name: "Absent", value: absent },
    ];

    // Fetch class details
    const fetchClass = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classes/${id}`);
            if (!res.ok) {
                toast.error('Error! fetching data.' , {position: "top-center"})
            }

            const data = await res.json();
            setClassData(data[0]);

            let attendanceData = data[0]?.attendance; // Check if attendance exists
            if (attendanceData) {
                if (typeof attendanceData === "string") {
                    attendanceData = JSON.parse(attendanceData); // Ensure it's parsed if stored as a string
                }

                // Assuming attendanceData.students is an array of students
                const attendanceMap = attendanceData.students.reduce((acc, student) => {
                    acc[student.student_id] = student.status; // Create a map of student_id to status
                    return acc;
                }, {});

                setAttendance(attendanceMap); // Set the attendance state with the map
            } else {
                setAttendance({}); // If no attendance data exists, set attendance to an empty object
            }
            
            fetchClassStudents(data[0].type);
        } catch (error) {
            toast.error('Error!' , {position: "top-center"})
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (className) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classStudents/class?className=${encodeURIComponent(className)}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                toast.error('Error!' , {position: "top-center"})
            }

            const data = await res.json();
            setClassStudents(data);
        } catch (error) {
            toast.error('Error!' , {position: "top-center"})
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId) => {
        setAttendance((prev) => {
            // Toggle the attendance status of the student
            return {
                ...prev,
                [studentId]: !prev[studentId], 
            };
        });
    };

    const submitAttendance = async () => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: id,
                    attendance: classStudents.map(student => ({
                        student_id: student.student_id,
                        name: student.student_name,
                        status: attendance[student.student_id] || false,
                    })),
                }),
            });

            if (!res.ok){
                toast.error('Error!' , {position: "top-center"})
            }

            toast.success('Attendance saved.' , {position: "top-center"})
        } catch (error) {
            toast.error('Error! saving attendance.' , {position: "top-center"})
        }
    };

    useEffect(() => {
        if (id) fetchClass();
    }, [id]);

    if (isLoading) return <Loading />;

    if (!classData) {
        return (
            <Layout>
                <Alert ref={alertRef} />
                <div className="p-5">
                    <div className="w-full tracking-wider px-5 py-3 text-3xl text-slate-900">
                        Class not found or failed to fetch data.
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-5">
                <div className="w-full tracking-wider sm:px-5 py-3 text-lg sm:text-3xl text-slate-900 flex justify-between">
                    <div>Class: {classData.type}</div>
                    <div>{classData.date.split('T')[0]}</div>
                </div>
                <div className="w-full flex flex-col sm:flex-row py-5 gap-10">
                    <div className='sm:w-2/5 shadow-lg rounded py-5 px-2'>
                        <div className='w-full text-center uppercase'>Student Attendance</div>
                        <table className="w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Index</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {
                                classStudents.length > 0 ? (
                                    classStudents.map((cs) => {
                                    // Find student by ID within the map
                                    
                                    return (
                                        <tr key={cs.student_id}>
                                        <td className="py-2 px-4">{cs.student_id}</td>
                                        <td className="py-2 px-4">{cs.student_name}</td>
                                        <td className="py-2 px-4 flex justify-center">
                                            <input
                                            type="checkbox"
                                            checked={attendance[cs.student_id] || false} // Bind the checkbox to the attendance state
                                            onChange={() => handleAttendanceChange(cs.student_id)} // Toggle attendance status
                                            className="checkbox checkbox-success"
                                            />
                                        </td>
                                        </tr>
                                    );
                                    })
                                ) : (
                                    <tr>
                                    <td colSpan="3" className="text-center py-2">No students assigned</td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                        <button
                            onClick={submitAttendance}
                            className="mt-4 w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700 cursor-pointer transition"
                        >
                            Save Attendance
                        </button>
                    </div>
                    <div className='sm:w-2/5 py-10 shadow-lg rounded'>
                        <div className='w-full text-center uppercase'>Student Attendance Report</div>

                        <PieChartComponent data={attendanceData} />
                    </div>
                </div>
                <div className="w-full flex flex-row sm:flex-col">
                    <div className='w-full sm:w-2/5 shadow-lg rounded'>
                    <Tasks id={classData.id} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
