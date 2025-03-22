import { useState , useEffect , useRef} from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Loading from "../../../../components/Loading";
import { toast } from "react-toastify";

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

  

  if (isLoading) return <Loading />;

  return (
    <Layout>

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


      <div className="p-5">
        <div className="w-full tracking-wider px-5 py-3 text-xl sm:text-3xl text-slate-900">
          Students Management
        </div>
        <div className="w-full flex flex-col py-5">
          <div className="sm:text-xl pl-5 mb-2">Add Students</div>
          {message && <p className="text-green-600 pl-5">{message}</p>}
          <form onSubmit={handleSubmit} className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <div className={`w-full sm:max-w-sm ${formData.id ? '' : 'hidden'}`}>
              <label htmlFor="name" className="sr-only">Index</label>
              <input type="text" id="index" name="index" value={formData.id} className={` py-2.5 px-4 block w-full border-gray-200 rounded-lg sm:text-sm bg-slate-100`} placeholder="Student Index" disabled />
            </div>
            <div className="w-full sm:max-w-sm">
              <label htmlFor="name" className="sr-only">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded-lg sm:text-sm bg-slate-100" placeholder="Student Name" required />
            </div>
            <div className="w-1/3 sm:max-w-sm">
              <label htmlFor="batch" className="sr-only">Batch</label>
              <input type="number" id="batch" name="batch" value={formData.batch} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded-lg sm:text-sm bg-slate-100" placeholder="Batch" required />
            </div>
            <div className="w-1/3 sm:max-w-sm">
              <label htmlFor="joined_date" className="sr-only">Joined Date</label>
              <input type="date" id="joined_date" name="joined_date" value={formData.joined_date} onChange={handleChange} className="py-2.5 px-4 block w-full border-gray-200 rounded-lg sm:text-sm bg-slate-100" required/>
            </div>
            <button className="bg-slate-900 text-white px-5 shadow-md cursor-pointer rounded duration-200 hover:bg-slate-700" type="submit">
              {formData.id ? 'UPDATE' : 'ADD'}
            </button>
          </form>
        </div>

        <div className="p-5">
          <h1 className="sm:text-xl text-slate-900">Students List</h1>
          
          {/* Search Bar */}
          <div className="my-4">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or batch" className="px-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80"/>
          </div>
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 max-h-screen overflow-y-scroll">
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
                          <tr className={`hover:bg-gray-100 ${!student.status ? "bg-gray-200 text-gray-500" : "text-gray-800"}`} key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{student.batch}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{student.joined_date.split('T')[0]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium flex gap-5">
                              <button onClick={() => {fetchStudents(student.id)}}className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 focus:outline-hidden focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Edit</button>
                              <button onClick={() => {handleDelete(student.id)}} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800 focus:outline-hidden focus:text-red-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
                              <button onClick={() => {handleStatus(student.id)}} className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-yellow-600 hover:text-yellow-800 focus:outline-hidden focus:text-yellow-800 disabled:opacity-50 disabled:pointer-events-none">{student.status ? "Remove" : "Get"}</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
