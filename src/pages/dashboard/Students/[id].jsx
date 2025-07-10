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
import { FaCrown, FaMedal } from "react-icons/fa6";
import { FaPenNib } from "react-icons/fa";
import { GiStarMedal } from "react-icons/gi";
import { IoBarChart } from 'react-icons/io5';

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

  const [stats , setStats] = useState([]);

  const [attendanceReportData, setAttendanceReportData] = useState([]);

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
      toast.error(err.message || 'An error occurred while fetching scores', {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllScores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/score`);
      const data = await res.json();
      const statsdata = getStudentStats(id, data); // Fetch student stats
      setStats(statsdata);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'An error occurred while fetching scores', {
        position: "top-center"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
    fetchAllScores();
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
    setLoading(true);
    try {
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
      setAttendanceReportData(getAttendanceReportData(attendance, startDate, endDate));
    } catch (error) {
      toast.error("Error fetching attendance data: " + error.message, {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }

  };

  const handleFilter = () => {
    setPieData(getPieChartData(attendanceData, startDate, endDate));
    setAttendanceReportData(getAttendanceReportData(attendanceData, startDate, endDate));
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

  const getAttendanceReportData = (attendanceData, startDate, endDate) => {
    const from = new Date(startDate);
    const to = new Date(endDate);
    const filtered = attendanceData.filter((item) => {
      const d = new Date(item.date);
      return d >= from && d <= to;
    });
    const report = {};
    console.log("Filtered Attendance Data:", filtered);
  }



  useEffect(() => {
    if (id) {
      fetchAttendance(id); // ✅ Pass number, not object
    }
  }, [id]);


  function getStudentStats(studentId, allScores) {
    //console.log("All Scores:", allScores);
    const studentScores = allScores.filter(s => s.student_id == studentId);

    if (studentScores.length === 0) {
      return {
        student_id: studentId,
        events_participated: 0,
        first_place_count: 0,
        second_place_count: 0,
        third_place_count: 0,
        best_score: 0,
        best_score_event_id: null,
        average_score: 0,
      };
    }

    const eventsFocused = new Set();
    let bestScore = -1;
    let bestScoreEventId = null;
    let totalScore = 0;

    let firstPlace = 0;
    let secondPlace = 0;
    let thirdPlace = 0;

    for (const record of studentScores) {
      const { type_id, score } = record;

      eventsFocused.add(type_id);
      totalScore += score;

      if (score > bestScore) {
        bestScore = score;
        bestScoreEventId = type_id;
      }

      const scoresInEvent = allScores
        .filter(s => s.type_id === type_id)
        .sort((a, b) => b.score - a.score);

      for (let i = 0; i < scoresInEvent.length; i++) {
        if (scoresInEvent[i].student_id == studentId) {
          if (i === 0) firstPlace++;
          else if (i === 1) secondPlace++;
          else if (i === 2) thirdPlace++;
          break;
        }
      }
    }

    const averageScore = +(totalScore / studentScores.length).toFixed(2);

    return {
      student_id: studentId,
      events_participated: eventsFocused.size,
      first_place_count: firstPlace,
      second_place_count: secondPlace,
      third_place_count: thirdPlace,
      best_score: bestScore,
      best_score_event_id: bestScoreEventId,
      average_score: averageScore,
    };
  }

  

  

  return (
    <Layout isLoading={isLoading} title="Student Details">
      <div className="px-5 sm:px-10 py-5">
        <div className="w-full py-3 flex justify-between">
          <div className='text-xl sm:text-3xl text-slate-900 flex items-center  gap-3'>
            Student: 
            <span className='text-md sm:text-2l '>
               {studentData.name? studentData.name : attendanceData.length > 0 ? attendanceData[0].name  : <div class='text-sm text-red-500'>Student Removed</div>}
            </span> 
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-5  flex-wrap  mt-5'>
          <div className=' bg-white text-slate-800 p-5 rounded-lg w-full sm:w-fit shadow-lg cursor-pointer duration-300 hover:scale-105'>
            <div className='text-lg px-3 sm:text-xl border-b pb-5 font-bold sm:px-10'>Assigned Classes</div>
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

          <div className=' bg-blue-100 text-slate-800 p-5 gap-5 rounded-lg w-full flex flex-col justify-center sm:w-54 shadow-lg cursor-pointer sm:h-52 duration-300 hover:scale-105'>
            <div className=' flex flex-col gap-2 text-5xl justify-center items-center'>
              {stats.events_participated > 0 ? (
                <div className="w-fit py-2 px-3 duration-300 relative left-0 hover:translate-x-2">
                  {stats.events_participated}
                </div>
              ) : (
                <div>0</div>
              )}
            </div>
            <div className='w-full text-center flex gap-3 items-center justify-center uppercase'> <FaPenNib className='text-xl' /> Focused Events</div>
          </div>

          <div className=' bg-lime-50 text-slate-800 p-5 gap-5 rounded-lg w-full flex flex-col justify-center sm:w-54 shadow-lg cursor-pointer sm:h-52 duration-300 hover:scale-105'>
            <div className='flex flex-col gap-2 text-sm justify-center items-center'>
              <div className='text-xl text-orange-300 font-bold flex items-center gap-2'><FaMedal/>First Place: {stats.first_place_count > 0 ? stats.first_place_count : "0"}</div>
              <div className='text-lg text-gray-500 flex items-center gap-2'><FaMedal/> Second Place: {stats.second_place_count > 0 ? stats.second_place_count : "0"}</div>
              <div className='text-lg text-amber-800 flex items-center gap-2'><FaMedal/> Third Place: {stats.third_place_count > 0 ? stats.third_place_count : "0"}</div>
            </div>
            <div className='w-full text-center flex gap-3 items-center justify-center uppercase'><GiStarMedal className='text-xl' />Rankings</div>
          </div>


          <div className=' bg-green-100 text-slate-800 p-5 gap-5 rounded-lg w-full flex flex-col justify-center sm:w-54 shadow-lg cursor-pointer sm:h-52 duration-300 hover:scale-105'>
            <div className='flex flex-col gap-2  text-5xl justify-center items-center'>
              {stats.best_score > 0 ? `${stats.best_score}%` : "0%"}
            </div>
            <div className='w-full text-center flex gap-3 items-center justify-center uppercase'><FaCrown className='text-2xl' />Highest</div>
          </div>


          <div className=' bg-cyan-100 text-slate-800 p-5 gap-5 rounded-lg w-full flex flex-col justify-center sm:w-54 shadow-lg cursor-pointer sm:h-52 duration-300 hover:scale-105'>
            <div className='flex flex-col gap-2  text-5xl justify-center items-center'>
              {stats.average_score > 0 ? `${stats.average_score}%` : "0%"}
            </div>
            <div className='w-full text-center flex gap-3 items-center justify-center uppercase'><IoBarChart className='text-2xl' />Avarage</div>
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
            <div className="flex gap-4 items-center flex-wrap">
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
            <div className='flex w-full justify-center items-center overflow-scroll'>
                <PieChartComponent data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
