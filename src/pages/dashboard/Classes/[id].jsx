import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import { toast } from 'react-toastify';
import PieChartComponent from '../components/PieChart';
import Tasks from '../components/Tasks';
import { MdDelete } from "react-icons/md";

export default function Class() {
    const router = useRouter();
    const { id } = router.query;
    const [classData, setClassData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [classStudents, setClassStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // Store attendance state
    const [present, setPresent] = useState(0);
    const [absent, setAbsent] = useState(0);
    const [todoInput , setTodoInput] = useState('');
    const [todos, setTodos] = useState([]);


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

    const fetchTodos = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/todos?classId=${id}`);
            const data = await res.json();
            if (data.success) setTodos(data.todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
            toast.error("Can't fetch to do list" , {position: 'top-center'});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTodos();
    }, [id]);

    const addTodo = async () => {
        setLoading(true);
        if (todoInput.trim() === '') {
            toast.loading('Please enter a value tin to do input.' , {position: "top-center"});
            setLoading(false);
        }
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: id, todo: todoInput })
            });

            const data = await res.json();
            if (data.success) setTodos(data.todos);
            setTodoInput('');
        } catch (error) {
            console.error('Error adding todo:', error);
            toast.error("Can't update to do list" , {position: 'top-center'});
        } finally {
            setLoading(false);
        }
    };

    const toggleTodo = async (d) => {
        setLoading(true);
        try {
            const res = await fetch('/api/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: id, id: d })
            });
            const data = await res.json();
            if (data.success) setTodos(data.todos);
        } catch (error) {
            console.error('Error updating todo:', error);
            toast.error('Error updating todo!' , {position: "top-center"});
        } finally {
            setLoading(false);
        }
    };

    const deleteTodo = async (d) => {
        setLoading(true);
        try {
            const res = await fetch('/api/todos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: id, id: d })
            });
            const data = await res.json();
            if (data.success) setTodos(data.todos);
        } catch (error) {
            console.error('Error deleting todo:', error);
            toast.error('Error deleting todo!' , {position: "top-center"});
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


    if (!classData) {
        return (
            <Layout>
                <div className="p-5">
                    <div className="w-full tracking-wider px-5 py-3 text-3xl text-slate-900">
                        Class not found or failed to fetch data.
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout isLoading={isLoading}>
            <div className="p-5">
                <div className="w-full tracking-wider sm:px-5 py-3 text-lg sm:text-3xl text-slate-900 flex justify-between">
                    <div>Class: {classData.type}</div>
                    <div>{classData.date.split('T')[0]}</div>
                </div>
                <div className="w-full flex flex-col sm:flex-row py-5 gap-10">
                    <div className='sm:w-2/5 shadow-lg rounded py-5 px-2 max-h-[100vh] '>
                        <div className='w-full text-center uppercase'>Student Attendance</div>
                        <table className="w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Index</th>
                                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 ">
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
                    <div className='sm:w-2/5 py-10 shadow-lg rounded max-h-[100vh] sm:max-h-[50vh]'>
                        <div className='w-full text-center uppercase'>Student Attendance Report</div>

                        <PieChartComponent data={attendanceData} />
                    </div>
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-10">
                    <div className='w-full sm:w-2/5 shadow-lg rounded max-h-[100vh] sm:max-h-[50vh] overflow-y-scroll'>
                        <Tasks id={classData.id} />
                    </div>
                    <div className='w-full sm:w-2/5 shadow-lg rounded p-5 max-h-[100vh] sm:max-h-[50vh] overflow-y-scroll flex flex-col gap-5'>
                        <div className='text-xl'>To Do List</div>
                        <div className='flex w-full gap-2'>
                            <input
                                type='text'
                                value={todoInput}
                                onChange={(e) => setTodoInput(e.target.value)}
                                placeholder='Enter task'
                                className='px-4 py-2 bg-slate-100 grow focus:outline-none shadow rounded'
                            />
                            <button onClick={addTodo} className='bg-slate-800 text-white px-4 py-2 rounded cursor-pointer'>ADD</button>
                        </div>
                        <table className='w-full divide-y divide-gray-200'>
                            <thead>
                                <tr >
                                    <th className='px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase w-full'>Task</th>
                                    <th className='px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase '>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {todos
                                    .sort((a, b) => a.completed - b.completed) // Move completed tasks to bottom
                                    .map(todo => (
                                        <tr key={todo.id} className='duration-300'>
                                            <td className={`py-2 px-4 ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</td>
                                            <td className='py-2 px-4'>
                                                <button onClick={() => toggleTodo(todo.id)} className='px-3 py-1 rounded cursor-pointer'>
                                                    {!todo.completed ? "❌" : '✅'}
                                                </button>
                                            </td>
                                            <td className='py-2 px-4 flex'>
                                                <button onClick={() => deleteTodo(todo.id)} className='bg-red-500 text-white px-3 py-1 rounded'>
                                                    <MdDelete />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
