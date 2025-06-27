import React, { useEffect, useState } from 'react';
import Loading from '../../../../components/Loading';
import { toast } from 'react-toastify';
import { FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Tasks({id}) {
    const [isLoading, setLoading] = useState(true);
    const [task, setTask] = useState('');
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (id) {
            fetchTasks();
        }
    }, [id]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks?classTypeId=${id}`);
            if (!res.ok) throw new Error("Error fetching tasks.");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!task.trim()) {
            toast.error("Task cannot be empty.", { position: "top-center" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classTypeId: id, taskName: task }),
            });

            if (!res.ok) throw new Error("Error adding task.");

            setTask('');
            toast.success("Task added successfully!", { position: "top-center" });
            fetchTasks();
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });

            if (!res.ok) throw new Error("Error deleting task.");

            toast.success("Task deleted successfully!", { position: "top-center" });
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, currentStatus) => {
        const newStatus = (currentStatus > 0 ? 0 : 1);

        console.log(newStatus);

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error("Error updating task status.");

            toast.success("Task status updated!", { position: "top-center" });
            fetchTasks();
        } catch (error) {
            toast.error(error.message, { position: "top-center" });
        }
    };

    const downloadTaskList = (taskList) => {
        const doc = new jsPDF();
        const tableColumn = ["Task No.", "Task"];
        const tableRows = taskList.map((t, index) => [
            index + 1,
            t.task_name,
        ]);
        doc.setFontSize(16);
        doc.text(`Task List`, 14, 15);
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
        doc.save(`task-list-${id}.pdf`);
    };

    if (isLoading) return <Loading />;

    return (
        <div className='p-5 flex flex-col w-full'>
            <div className='text-lg'>Tasks</div>
            <div className="flex gap-2 mt-4">
                <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter task"
                    className="px-4 py-2 bg-slate-100 grow focus:outline-none shadow rounded"
                />
                <button onClick={addTask} className="bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">
                    Add
                </button>
            </div>
            <div onClick={() => {
                if (tasks && tasks.length > 0) {
                    downloadTaskList(tasks);
                } else {
                    alert("No students to download.");
                }}
                } className='py-2 px-3 bg-slate-200 mt-4 flex gap-5 cursor-pointer justify-center items-center'>
                    Download Tasks List
                <FaDownload />
            </div>
            <div className="mt-4">
                <table className="w-full min-w-full divide-y divide-gray-200 ">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Task No.</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase w-full">Task</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tasks.length === 0 ? (
                            <tr>
                            <td colSpan="3" className="text-center py-2">No tasks assigned</td>
                            </tr>
                        ) : (
                            tasks.map((t, index) => (
                            <tr key={t.id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 text-sm text-gray-800">{index + 1}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{t.task_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-800 text-center">
                                <button
                                    onClick={() => updateTaskStatus(t.id, t.status)}
                                    className={`px-4 py-1 rounded text-white ${
                                    t.status > 0 ? "bg-green-500" : "bg-yellow-500"
                                    }`}
                                    title={t.status > 0 ? "Mark as Incompleted" : "Mark as Completed"}
                                >
                                    {t.status > 0 ? "Completed" : "Incompleted"}
                                </button>
                                </td>
                                <td className="flex px-6 py-4 text-xl justify-center items-center">
                                <button
                                    onClick={() => deleteTask(t.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✖
                                </button>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
