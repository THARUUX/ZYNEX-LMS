import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Loading from '../../../../components/Loading';
import Alert from '../../../../components/Alert';
import BackButton from '../components/BackBtn';

export default function Student() {
  const alertRef = useRef(null);
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState([]);
  const [classNames , setClassNames] = useState([]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      setStudentData(data);
      setLoading(false);
    } catch (error) {
      alertRef.current.showAlert(error.message || 'An error occurred', 'Error!');
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
      alertRef.current.showAlert(error.message || 'An error occurred', 'Error!');
      setLoading(false); 
    }
  };

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
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }
  }, [id]);
  

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <Alert ref={alertRef} />
      <div className="px-10 py-5">
        <div className="w-full py-3 flex justify-between">
          <div className='tracking-wider text-3xl text-slate-900'>
            Student: 
            <span className='text-2l'>
               {studentData.name}
            </span> 
          </div>
          <div>
            <BackButton />
          </div>
        </div>
        <div className='mt-5 bg-slate-800 text-white p-5 rounded-lg w-fit shadow-lg cursor-pointer duration-300 hover:scale-105'>
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
    </Layout>
  );
}
