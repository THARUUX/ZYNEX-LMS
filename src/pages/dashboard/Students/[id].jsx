import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
//import Alert from '../../../../components/Alert';
import BackButton from '../components/BackBtn';
import { toast } from 'react-toastify';
import AreaChartComp from '../components/AreaChartComp';
import PieChartComponent from '../components/PieChart';
import { BsFilter } from 'react-icons/bs';

export default function Student() {
  //const alertRef = useRef(null);
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState([]);
  const [classNames , setClassNames] = useState([]);

  const [allScores, setAllScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [attendanceData, setAttendanceData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      setStudentData(data);
      setLoading(false);
    } catch (error) {
      //alertRef.current.showAlert(error.message || 'An error occurred', 'Error!');
      setLoading(false); 
    }
  };

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classStudents`);
      const data = await res.json();
      setLoading(false);
      return data ; 
    } catch (error) {
      //alertRef.current.showAlert(error.message || 'An error occurred', 'Error!');
      setLoading(false); 
    }
  };

  const fetchScore = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/score?student_id=${id}`);
      const data = await res.json();
      setAllScores(data);
      setFilteredScores(data);
    } catch (err) {
      console.error("Error fetching scores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [id]);

  useEffect(() => {
    if (!from && !to) {
      setFilteredScores(allScores);
      return;
    }

    const fromDate = from ? new Date(from) : new Date("2000-01-01");
    const toDate = to ? new Date(to) : new Date("2100-01-01");

    const filtered = allScores.filter((score) => {
      const scoreDate = new Date(score.date);
      return scoreDate >= fromDate && scoreDate <= toDate;
    });

    setFilteredScores(filtered);
  }, [from, to, allScores]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          await fetchStudent(); // Ensure student data is fetched first
  
          const CS = await fetchClassStudents(); // Wait for class students to be fetched
          const filteredClassNames = CS.filter(entry => entry.student_id == id)
            .map(entry => entry.class_name);
  
          setClassNames(filteredClassNames);
        } catch (error) {
          toast.error(error.message || 'An error occurred while fetching data', {
            position: "top-center"
          });
        }
      };
  
      fetchData();
    }
  }, [id]);

  const fetchAttendance = async (id) => {
    const res = await fetch(`/api/classes`);
    const data = await res.json();

    const attendance = [];
    for (const cls of data) {
      const date = cls.date;
      if (!cls.attendance) continue;

      try {
        const parsed = JSON.parse(cls.attendance);
        const entry = parsed.students.find((s) => String(s.student_id) === String(id));
        if (entry) {
          attendance.push({
            student_id: entry.student_id,
            name: entry.name,
            status: entry.status,
            date,
          });
        }
      } catch (err) {
        toast.error("Error parsing attendance data: " + err.message, {
          position: "top-center"
        });
      }
    }
    setAttendanceData(attendance);
    setPieData(getPieChartData(attendance, startDate, endDate));
  };

  const handleFilter = () => {
    setPieData(getPieChartData(attendanceData, startDate, endDate));
  };

  const getPieChartData = (attendance, startDate, endDate) => {
  const from = new Date(startDate);
  const to = new Date(endDate);

  const filtered = attendance.filter((item) => {
    const d = new Date(item.date);
    return d >= from && d <= to;
  });

  const present = filtered.filter((a) => a.status).length;
  const absent = filtered.length - present;

  return [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
  ];
};



  useEffect(() => {
    if (id) {
      fetchAttendance(id); // ✅ Pass number, not object
    }
  }, [id]);

  

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <div className="px-5 sm:px-10 py-5">
        <div className="w-full py-3 flex justify-between">
          <div className='tracking-wider text-3xl text-slate-900'>
            Student: 
            <span className='text-md sm:text-2l'>
               {studentData.name}
            </span> 
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-5 justify-between items-center mt-5'>
          <div className=' bg-white text-slate-800 p-5 rounded-lg w-full sm:w-fit shadow-lg cursor-pointer duration-300 hover:scale-105'>
            <div className='text-xl border-b pb-5 font-bold px-10'>Assigned Classes</div>
            <div className=' flex flex-col gap-2 mt-3'>
              {classNames.length === 0 ? (
                <div>No Classes Assigned</div> 
              ) : (
                classNames.map((className, index) => (
                  <div key={index} className="w-fit py-2 px-3 duration-300 relative left-0 hover:translate-x-2">
                    {className}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white sm:mt-10 p-5 shadow-lg rounded-lg mt-5">
          <div className="text-2xl mb-4">Score Report</div>

          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm mb-1">From:</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-gray-100 px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">To:</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-gray-100 px-2 py-1 rounded"
              />
            </div>
          </div>

          {isLoading ? (
            <p>Loading chart...</p>
          ) : (
            <AreaChartComp data={filteredScores} />
          )}
        </div>

        <div className='bg-white sm:mt-10 p-5 shadow-lg rounded-lg mt-5'>
          <div className='text-2xl mb-4'>Attendance Report</div>
          <div className=" space-y-4">
            <div className="flex gap-4 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-100 p-1 rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-100 p-1 rounded"
              />
              <button
                onClick={handleFilter}
                className="bg-slate-600 text-white px-4 py-1 rounded hover:bg-slate-700 flex gap-3 items-center justify-center"
              >
                Filter <BsFilter />
              </button>
            </div>
            <PieChartComponent data={pieData} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
