import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Loading from "../../../../components/Loading";
import { toast } from "react-toastify";


export default function index() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    start_time: "",
    end_time: "",
    status: "false",
  });
  const [message, setMessage] = useState("");
  const [classes, setClasses] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [classTypes , setClassTypes] = useState([]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/");
      if (!res.ok) {
        toast.error('Failed to fetch data!' , {position: "top-center"})
      }
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching assigned students:", error);
      toast.error('Error! fetching assigned students' , {position: "top-center"})
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
    } catch (error) {
      console.error("Error fetching class types:", error);
      toast.error('Error! loading class types.' , {position: "top-center"})
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchClassTypes();
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) => {
    const matchesDate = searchDate ? c.date.startsWith(searchDate) : true;
    const matchesType = searchType ? c.type.toLowerCase().includes(searchType.toLowerCase()) : true;
    return matchesDate && matchesType;
  });  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
    
      const res = await fetch("/api/classes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    
      const data = await res.json();
    
      if (!res.ok) {
        toast.error('Error!' , {position: "top-center"})
        return;
      }
    
      toast.success('Class scheduled.' , {position: "top-center"})
      
      setFormData({
        type: "",
        date: "",
        start_time: "",
        end_time: "",
        status: "false", 
      });
      fetchClasses();
    
      setTimeout(() => {
        router.push("/dashboard/Classes/");
      }, 2000);
    } catch (err) {
      toast.error('Error!' , {position: "top-center"})
    } finally {
      setLoading(false);
    }
    
  };

  const updateClassStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
  
      if (res.ok) {
        fetchClasses();
        ;
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isLoading={isLoading}>
      <div className="p-5">
        <div className="w-full tracking-wider sm:px-5 py-3 text-xl sm:text-3xl text-slate-900">
          Classes Management
        </div>
        <div className="w-full flex flex-col py-5">
          <div className="sm:text-xl sm:pl-5 mb-2">Schedule a class</div>
          {message && <p className="text-green-600 pl-5">{message}</p>}
          <form onSubmit={handleSubmit} className="flex sm:flex-col w-full sm:px-5 sm:w-1/2 flex-wrap gap-4 justify-between sm:justify-normal">
            <div className="flex w-full gap-2">
              <div className="grow-1 sm:max-w-sm">
                <label htmlFor="type">Class type</label> 
                <select name="type" id="type" className="bg-slate-100 w-full sm:w-full flex px-4 py-2.5 rounded border-gray-200" value={formData.type} onChange={handleChange} required>
                <option value="">Class Type</option>
                  {classTypes.length > 0 ? (
                    classTypes.map((classType) => (
                      <option className="text-sm" key={classType.id} value={classType.id}>{classType.name}</option>
                    ))
                  ) : (
                    <option disabled>No class types available</option>
                  )}
                </select>
              </div>
              <div className="grow-1 flex-col sm:max-w-sm flex justify-center">
                <label htmlFor="date">Date</label> 
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100"
                  required
                />
              </div>
            </div>
            <div className="w-full flex gap-2">
              <div className="grow-1 sm:max-w-sm">
                <label htmlFor="start_time">Start Time</label> 
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100"
                  required
                />
              </div>
              <div className="grow-1 sm:max-w-sm">
                <label htmlFor="end_time ">End Time</label> 
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100"
                  required
                />
              </div>
            </div>
            <button className="bg-slate-900 w-full sm:w-fit text-white px-5 py-2 shadow-md cursor-pointer gap-2 rounded duration-200 hover:bg-slate-600 flex justify-center items-center" type="submit">
              ADD
            </button>
          </form>
        </div>

        <div className="sm:p-5 mt-5">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-xl text-slate-900 w-full sm:w-auto">Classes List</h1>          
            <div className="my-4">
              <div className="flex gap-4 sm:my-4">
                {/* Date Filter */}
                <div className="flex flex-col relative  text-sm">
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="px-4 py-2 bg-slate-100 border-gray-300 rounded"
                  />
                </div>
                {/* Type Filter */}
                <label className="input bg-slate-100">
                  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                  <input type="search" className="grow" placeholder="Search" value={searchType} onChange={(e) => setSearchType(e.target.value)} />
                </label>
              </div>
            </div>
          </div>
          <div className="overflow-scroll">
            <div className="hidden sm:flex w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Class Type</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Start</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">End</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 max-h-screen overflow-y-scroll">
                  {[...filteredClasses]
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // descending by date
                    .map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/dashboard/Classes/${c.id}`)}
                        className={
                          c.status === "done"
                            ? 'bg-green-200 duration-300 hover:bg-green-50 cursor-pointer'
                            : 'bg-blue-50 duration-300 hover:bg-blue-100 cursor-pointer'
                        }
                      >
                        <td className="text-xs sm:text-sm px-6 py-4">{c.type}</td>
                        <td className="text-xs sm:text-sm px-6 py-4">{c.date.split('T')[0]}</td>
                        <td className="text-xs sm:text-sm px-6 py-4">{c.start_time}</td>
                        <td className="text-xs sm:text-sm px-6 py-4">{c.end_time}</td>
                        <td className="text-xs sm:text-sm px-6 py-4">
                          {c.status === "done" ? "Completed" : "Pending"}
                        </td>
                        <td className="text-xs sm:text-sm px-6 py-4">
                          <button
                            className="cursor-pointer"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateClassStatus(c.id, c.status === "done" ? "pending" : "done");
                            }}
                          >
                            {c.status === "done" ? "✅" : "❌"}
                          </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-full flex sm:hidden flex-col gap-5">
              {[...filteredClasses]
                  .sort((a, b) => new Date(b.date) - new Date(a.date)) // descending by date
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/dashboard/Classes/${c.id}`)}
                      className={
                        c.status === "done"
                          ? 'bg-green-200 duration-300 hover:bg-green-50 cursor-pointer shadow-md w-full rounded-lg p-5 flex'
                          : 'bg-blue-50 duration-300 hover:bg-blue-100 cursor-pointer shadow-md w-full rounded-lg p-5 flex'
                      }
                    >
                        <div className="w-3/4 flex flex-col">
                          <div className="text-xl ">{c.type}</div>
                          <div className="mt-2">{c.date.split('T')[0]}</div>
                          <div className="text-xs text-black/50">{c.start_time} - {c.end_time}</div>
                        </div>
                        <div className="w-1/4 flex justify-center items-center">
                          <button
                            className="cursor-pointer"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateClassStatus(c.id, c.status === "done" ? "pending" : "done");
                            }}
                          >
                            {c.status === "done" ? "✅" : "❌"}
                          </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
