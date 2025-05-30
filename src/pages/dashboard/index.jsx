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

export default function index({user}) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      toast.error('Error fetching class data', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
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


  return (
    <Layout isLoading={loading}>
      <div className="p-5">
        <div className="text-xl sm:text-3xl text-slate-900 py-3">Dashboard</div>

        {/* Chart */}
        <div className="w-full h-96 px-4 py-10 shadow-lg pb-24">
          <div className='flex justify-between'>
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
            </div>
          </div>
          {loading ? (
            <div className="text-center text-lg mt-10">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No data for selected filter.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Present"
                  stroke="#00C49F"
                  strokeWidth={3}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="Absent"
                  stroke="#FF8042"
                  strokeWidth={3}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}
