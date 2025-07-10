'use client';
import React, { use, useEffect, useState } from 'react';
import Layout from './components/Layout';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'react-toastify';
import { RiFileList2Fill } from 'react-icons/ri';
import { FaUsers } from 'react-icons/fa';
import { MdPending } from 'react-icons/md';
import { Router, useRouter } from 'next/router';


export default function index({user}) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('');
  const [students, setStudents] = useState('');
  const [classTypes, setClassTypes] = useState([]);

  const router = useRouter();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
      console.log(data);
    } catch (err) {
      toast.error('Error fetching class data', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      toast.error('Error fetching student data', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classTypes');
      const data = await res.json();
      setClassTypes(data);
    } catch (err) {
      toast.error('Error fetching class types', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchClassTypes();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredClasses = [...classes]
    .filter((cls) => cls.attendance)
    .filter((cls) => {
      const clsDate = new Date(cls.date);

      if (selectedMonth) {
        const month = clsDate.getMonth() + 1;
        const year = clsDate.getFullYear();
        const monthString = `${year}-${month.toString().padStart(2, '0')}`;
        if (monthString !== selectedMonth) return false;
      }

      if (selectedDate) {
        const dateString = clsDate.toISOString().slice(0, 10); // YYYY-MM-DD (still OK for full date match)
        if (dateString !== selectedDate) return false;
      }

      if (selectedClassType && cls.type !== selectedClassType) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .reverse();

  const chartData = filteredClasses.map((cls) => {
    let present = 0;
    let absent = 0;

    try {
      const attendance = JSON.parse(cls.attendance);
      //console.log(attendance);
      present = attendance.students.filter((s) => s.status).length;
      absent = attendance.students.filter((s) => !s.status).length;
    } catch (err) {
      // ignore parsing error
    }

    return {
      day: formatDate(cls.date),
      Present: present,
      Absent: absent,
    };
  });

  let uname = "Admin";
    if (user && user.name) {
    uname = user.name;
  }


  return (
    <Layout isLoading={loading}>
      <div className="p-5">
        <div className="text-xl sm:text-3xl text-slate-900 py-3">Dashboard</div>
        <div className='text-3xl sm:text-5xl py-10 text-slate-800 font-light'>Hello <span className='uppercase'>{uname}</span>! </div>

        {/* Chart */}
        <div className="w-full sm:h-[50vh] h-[70vh] px-4 py-10 shadow-lg rounded-lg bg-slate-100 pb-24">
          <div className='flex flex-col sm:flex-row justify-between relative '>
            <div className="text-2xl mb-5 px-2">Attendance</div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div>
                <label className="block mb-1 font-medium">Filter by Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded p-2"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Filter by Class Type</label>
                <select
                  className="border border-gray-300 rounded p-2"
                  value={selectedClassType}
                  onChange={(e) => setSelectedClassType(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {classes.length > 0 && classes.map((cls) => (
                    <option key={cls.id} value={cls.type}>
                      {cls.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className='w-full flex flex-col h-1/2 sm:h-full sm:pb-10'>

            {loading ? (
              <div className="text-center text-lg mt-10">Loading chart...</div>
            ) : chartData.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No data for selected filter.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%"  className="mt-5"
              >
                <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Present"
                    stroke="#333344"
                    strokeWidth={3}
                    animationDuration={1000}
                  />
                  <Line
                    type="monotone"
                    dataKey="Absent"
                    stroke="#FF5050"
                    strokeWidth={3}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className='w-full flex flex-wrap gap-10 py-10'>
          <div onClick={() => router.push('/dashboard/Classes')} className="w-full sm:w-52 flex bg-green-100 text-slate-800 flex-col justify-center gap-5 sm:aspect-square rounded-lg items-center py-10 px-5 shadow-lg cursor-pointer">
            <div className='text-5xl w-full text-center'>{classTypes.length > 0 ? classTypes.filter((cls) => cls.status !== false).length : "0"}</div>
            <div className='text-center font-bold flex gap-3'><RiFileList2Fill className='text-2xl'/>Classes</div>
          </div>
          <div onClick={() => router.push('/dashboard/Students')} className="w-full sm:w-52 flex bg-blue-100 text-slate-800 flex-col justify-center gap-5 sm:aspect-square rounded-lg items-center py-10 px-5 shadow-lg cursor-pointer">
            <div className='text-5xl w-full text-center'>{students.length > 0 ? students.length : "0"}</div>
            <div className='text-center font-bold flex gap-3'><FaUsers className='text-2xl'/>Students</div>
          </div>
          <div onClick={() => router.push('/dashboard/Classes')} className="w-full sm:w-52 flex bg-red-100 text-slate-800 flex-col justify-center gap-5 sm:aspect-square rounded-lg items-center py-10 px-5 shadow-lg cursor-pointer">
            <div className='text-5xl w-full text-center'>{classes.length > 0 ? classes.filter((cls) => cls.status === 'false').length : "0"}</div>
            <div className='text-center font-bold flex gap-3'><MdPending className='text-2xl'/>Pending Classes</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
