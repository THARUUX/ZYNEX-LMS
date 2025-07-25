import { useState , useEffect , useRef} from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Loading from "../../../../components/Loading";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { IoRemove } from "react-icons/io5";

export default function students() {
  const router = useRouter();
  const [formData, setFormData] = useState({ id: "", name: "", batch: "", joined_date: "" , status: "" });
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState({ header: "", cont: "", func: null });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setLoading] = useState(true);

  const fetchStudents = async (id) => {
    setLoading(true);
    try {
      let res, data;
      if (id) {
        res = await fetch(`/api/students/${id}`);
        data = await res.json();
        setFormData({ id: data.id, name: data.name, batch: data.batch, joined_date: data.joined_date.split("T")[0] , status: data.status});
      } else {
        res = await fetch("/api/students");
        data = await res.json();
        setStudents(data);
      }
      if (!res.ok) {
        toast.error('Error fetching students' , {position: "top-center"})
      }
    } catch (error) {
      toast.error('Error occurred! Please contact the developer' , {position: "top-center"})
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.batch.toString().includes(searchTerm)
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const url = formData.id ? "/api/students/update" : "/api/students/add";
      const method = "POST";
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify(formData);
      const res = await fetch(url, { method, headers, body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      toast.success('Student saved successfully!' , {position: "top-center"})
      setFormData({ id: "", name: "", batch: "", joined_date: "" });
      fetchStudents();
      setTimeout(() => router.push("/dashboard/Students/"), 2000);
    } catch (err) {
      toast.error('Error!' , {position: "top-center"});
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      toast.error('Error!' , {position: "top-center"});
      return;
    }
    setModal({
      header: "Warning",
      cont: "Are you sure you want to delete this student? If this ID is used elsewhere, errors may occur.",
      func: () => deleteItem(id),
    });
    document.getElementById("my_modal_5").showModal();
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${id}` , {
        method: "DELETE"
      });

      if(!res.ok){
        toast.error('Error!' , {position: "top-center"})
      } 
    } catch (error) {
      if(alertRef.current){
        toast.error('Error!' , {position: "top-center"})
      }
    } finally {
      fetchStudents();
      setLoading(false);
      toast.success('Student deleted.' , {position: "top-center"})
    }

  }

  const handleStatus = async (id) => {
      if (!id) {
          toast.error('Error!' , {position: "top-center"})
          return;
      }

      try {
          // Find the current student's status
          const student = students.find(student => student.id === id);
          if (!student) {
              toast.error('Error! Student not found.' , {position: "top-center"})
              return;
          }

          const updatedStatus = Number(!student.status); // Toggle status

          const res = await fetch('/api/students/update', {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, status: updatedStatus }) // Send as JSON
          });

          if (!res.ok) {
            toast.error('Error! API Fail' , {position: "top-center"})
          }

          toast.success('Student status updated.' , {position: "top-center"})
          fetchStudents(); // Refresh student list

      } catch (error) {
          toast.error('Error!' , {position: "top-center"})
          console.error("Error updating student status:", error);
      }
  };

  


  return (
    <Layout isLoading={isLoading}>

      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white">
          <h3 className="font-bold text-lg">{modal.header}</h3>
          <p className="py-4">{modal.cont}</p>
          <div className="modal-action">
            <form className="flex gap-5" method="dialog">
              <button onClick={() => {document.getElementById("my_modal_5").close();}} className="btn">No</button>
              <button
                type="button"
                onClick={() => {
                  modal.func(); // Trigger the function passed in the modal state
                  document.getElementById("my_modal_5").close(); // Close the modal
                }}
                className="bg-red-600 btn"
              >
                Yes
              </button>
            </form>
          </div>
        </div>
      </dialog>


      <div className="px-5 sm:p-5 max-h-screen overflow-y-scroll flex flex-col gap-5">
        <div className="w-full  sm:py-3 text-2xl sm:text-3xl text-slate-900">
          Students Management
        </div>
        <div className="w-full flex flex-col gap-2 sm:py-5">
          <div className="sm:text-xl ">Add Students</div>
          {message && <p className="text-green-600 pl-5">{message}</p>}
          <form onSubmit={handleSubmit} className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <div className={`w-full sm:max-w-sm ${formData.id ? '' : 'hidden'}`}>
              <label htmlFor="name" className="sr-only">Index</label>
              <input type="text" id="index" name="index" value={formData.id} className={` py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100`} placeholder="Student Index" disabled />
            </div>
            <div className="w-full sm:max-w-sm">
              <label htmlFor="name" className="sr-only">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100" placeholder="Student Name" required />
            </div>
            <div className="w-1/3 sm:max-w-sm">
              <label htmlFor="batch" className="sr-only">Batch</label>
              <input type="number" id="batch" name="batch" value={formData.batch} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100" placeholder="Batch" required />
            </div>
            <div className="w-1/3 sm:max-w-sm">
              <label htmlFor="joined_date" className="sr-only">Joined Date</label>
              <input type="date" id="joined_date" name="joined_date" value={formData.joined_date} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100" required/>
            </div>
            <button className="bg-slate-900 text-white grow px-5 shadow-md cursor-pointer rounded duration-200 hover:bg-slate-700" type="submit">
              {formData.id ? 'UPDATE' : 'ADD'}
            </button>
          </form>
        </div>

        <div className="h-full flex flex-col py-5 sm:py-0 gap-2 sm:gap-5">
          <h1 className="sm:text-xl text-slate-900">Students List</h1>
          
          {/* Search Bar */}
          <label className="input bg-slate-100 flex w-full sm:w-1/3  items-center gap-3 px-4 py-2 rounded shadow-md">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
            <input type="search" className="grow" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </label>
          <div className="flex flex-col h-full max-h-full pb-10">
            <div className="overflow-y-auto hidden sm:flex  max-h-[60vh] sm:max-h-[70vh] ">
              <table className="min-w-full divide-y divide-gray-200 shadow-lg">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Index</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Batch</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                    <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-2">No students found</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        className={`hover:bg-gray-100 cursor-pointer ${!student.status ? "bg-gray-200 text-gray-500" : "text-gray-800"}`}
                        key={student.id}
                        onClick={() => {router.push(`/dashboard/Students/${student.id}`); setLoading(true);}}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.batch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.joined_date.split('T')[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium flex gap-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchStudents(student.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatus(student.id);
                            }}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-semibold"
                          >
                            {student.status ? "Remove" : "Get"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* <div className="shadow-lg hidden max-h-full overflow-hidden sm:flex">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Index</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Batch</th>
                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                    <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                 {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-2">No students found</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        className={`hover:bg-gray-100 cursor-pointer ${!student.status ? "bg-gray-200 text-gray-500" : "text-gray-800"}`}
                        key={student.id}
                        onClick={() => router.push(`/dashboard/Students/${student.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.batch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.joined_date.split('T')[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium flex gap-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchStudents(student.id);
                            }}
                            className="inline-flex items-center gap-x-2 text-lg font-semibold rounded border border-transparent text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student.id);
                            }}
                            className="inline-flex items-center gap-x-2 text-lg font-semibold rounded border border-transparent text-red-600 hover:text-red-800"
                          >
                            <MdDelete />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatus(student.id);
                            }}
                            className="inline-flex items-center gap-x-2 text-sm font-semibold rounded border border-transparent text-yellow-600 hover:text-yellow-800"
                          >
                            {student.status ? "Remove" : "Get"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div> */}

            <div className="flex sm:hidden flex-col gap-5 max-h-[70vh] overflow-y-scroll">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-2">No students found</div>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`bg-white shadow-md gap-3 rounded p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 ${!student.status ? "text-gray-500" : "text-gray-800"}`}
                    onClick={() => router.push(`/dashboard/Students/${student.id}`)}
                  >
                    <div className="flex gap-3 flex-col w-full">
                      <span className="font-medium text-xl">{student.name}</span>
                      <div className="text-sm text-gray-500 w-full flex justify-between">
                        <div className="font-medium">Index: {student.id}</div>
                        <div className="font-medium">Batch: {student.batch}</div>
                      </div>
                  </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
