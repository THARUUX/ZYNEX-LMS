import { useState, useEffect , useRef } from "react";
import Layout from "../components/Layout";
import Loading from "../../../../components/Loading";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { MdDelete, MdEdit } from "react-icons/md";

export default function Index() {
  const router = useRouter();
  const [classTypes, setClassTypes] = useState([]);
  const [newClassType, setNewClassType] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [modal, setModal] = useState({ header: "", cont: "", func: null });


  const [isLoading, setLoading] = useState(true);

  const [filterText, setFilterText] = useState("");

    // Filter students based on input text
  const searchedStudents = Array.isArray(assignedStudents) ? assignedStudents.filter(
      (entry) =>
          entry.class_name.toLowerCase().includes(filterText.toLowerCase()) ||
          entry.student_name.toLowerCase().includes(filterText.toLowerCase())
  ) : [];

  useEffect(() => {
    fetchClassTypes();
    fetchStudents();
    fetchAssignedStudents();
  }, []);

  const fetchClassTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classTypes");
      const data = await res.json();
      setClassTypes(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error! fetching class types' , {position: "top-center"})
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      toast.error('Error! fetching students' , {position: "top-center"})
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classStudents/");
      if (!res.ok) {
        toast.error('Error! fetching assigned students.' , {position: "top-center"})
      }
      const data = await res.json();
      setAssignedStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assigned students:", error);
      toast.error('Error! fetching assigned students.' , {position: "top-center"})
    } finally {
      setLoading(false);
    }
  };


  const addClassType = async () => {
    if (!newClassType.trim()) {
      toast.warning("Please enter a class type name", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/classTypes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassType.trim() }),
      });

      let data = {};
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Invalid server response");
      }

      if (res.ok) {
        toast.success("Class Type Added Successfully!", { position: "top-center" });
        setNewClassType("");
        fetchClassTypes();
      } else {
        toast.error(data.message || "Failed to add class type", { position: "top-center" });
      }
    } catch (error) {
      toast.error("Error adding class type: " + error.message, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredStudents(students.filter((s) => s.name.toLowerCase().includes(term)));
  };

  const assignStudent = async () => {
    setLoading(true);
    if (!selectedClass || !searchTerm) {
      if (alertRef.current) {
        toast.error('Error!' , {position: "top-center"});
      }
      return;
    }
  
    const student = students.find((s) => s.name.toLowerCase() === searchTerm.toLowerCase());
    if (!student) {
      setMessage("Student not found.");
      return;
    }
  
    try {
      console.log("Assigning Student:", { student_id: student.id, class_id: selectedClass });
      const res = await fetch("/api/classStudents/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: student.id, class_id: selectedClass }),
      });
  
      const data = await res.json(); // Read the response body
  
      if (!res.ok) {
          toast.error(data.error || "Error assigning student!", { position: "top-center" });
          return;
      }
  
      setSearchTerm("");
      toast.success("Student assigned.", { position: "top-center" });
    } catch (error) {
        toast.error("An unexpected error occurred!", { position: "top-center" });
    } finally {
        setLoading(false);
        fetchAssignedStudents();
    }
  }

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classStudents/${id}` , {
        method: "DELETE"
      });

      if(!res.ok){
        toast.error('Error!' , {position: "top-center"})
      } else {
        toast.success('Student removed.' , {position: "top-center"})
      }

    } catch (error) {
      toast.error('Error!' , {position: "top-center"})
    } finally {
      fetchAssignedStudents();
      setLoading(false);
    }
  }

  const handleDeleteClass = (id) => {
    if (!id) {
      toast.error('Error!' , {position: "top-center"});
      return;
    }
    setModal({
      header: "Warning",
      cont: "Are you sure you want to delete this class type? If this ID is used elsewhere, errors may occur.",
      func: () => deleteItem(id),
    });
    document.getElementById("my_modal_5").showModal();
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/classTypes/${id}` , {
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
      fetchClassTypes();
      setLoading(false);
      toast.success('Student deleted.' , {position: "top-center"})
    }
  }  

  return (
    <Layout isLoading={isLoading} title="Classes Data">

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
        <h1 className="text-xl sm:text-3xl text-slate-900 ">Classes Data</h1>

        <div className="w-full flex flex-col my-5 min-h-2/3">
          {/* Add Class Type */}
          <div className="w-full flex flex-col">
            <h2 className=" sm:text-xl">Add Class Type</h2>
            {message && <p className="text-green-600">{message}</p>}
            <div className="flex gap-2 mt-3 sm:w-1/3">
              <input
                type="text"
                value={newClassType}
                onChange={(e) => setNewClassType(e.target.value)}
                placeholder="Enter class type "
                className="px-4 py-2 bg-slate-100 grow  focus:outline-none shadow rounded"
              />
              <button onClick={addClassType} className="bg-slate-800 text-white px-4 py-2 rounded cursor-pointer">
                Add
              </button>
            </div>
            <div className="py-8 max-h-50vh overflow-y-scroll">
              <h2 className="sm:text-xl">Class Types</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Class ID</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Class Name</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(classTypes) && classTypes.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center py-2">No students assigned</td>
                    </tr>
                  ) : (
                    classTypes.map((entry) => (
                      <tr key={entry.id} onClick={() => router.push(`/dashboard/CData/${entry.id}`)} className="hover:bg-gray-100 cursor-pointer">
                        <td className="px-6 py-4 text-sm text-gray-800">{entry.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{entry.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click event
                              handleDeleteClass(entry.id);
                            }}
                            className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                          <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click event
                            router.push(`/dashboard/CData/${entry.id}`);
                          }}
                             className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800">
                            <MdEdit className="text-lg text-blue-600 hover:text-blue-800" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assign Students to Classes */}
          <div className="">
            <h2 className="sm:text-xl">Assign Students to Class</h2>
            <div className="flex flex-wrap gap-2 mt-3 sm:w-1/3">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search for a student"
                  className="px-4 py-2 shadow rounded w-full peer focus:outline-none bg-slate-100"
                />
                {searchTerm && filteredStudents.length > 0 && (
                  <div id="inputDropdown" className="absolute mt-1 w-64 bg-white shadow-lg rounded z-10 peer-focus:block">
                    {filteredStudents.filter((student) => student.status === 1).map((student) => (
                      <div
                        key={student.id}
                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {setSearchTerm(student.name); document.getElementById("inputDropdown").style.display="none";}}
                      >
                        {student.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <select onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-2 bg-slate-100 rounded shadow grow">
                <option value="">Select Class Type</option>
                {classTypes?.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>


              <button onClick={() => assignStudent()} className="bg-slate-800 text-white px-4 py-2 rounded">
                Assign
              </button>
            </div>
            {/* Display Assigned Students */}
            <div className="py-0">
              <div className="flex sm:items-center justify-center sm:justify-between flex-col sm:flex-row gap-2 my-5">
                <label className="input bg-transparent shadow w-full sm:w-1/3">
                  <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                  <input type="search" className="grow" placeholder="Search" value={filterText} onChange={(e) => setFilterText(e.target.value)}/>
                </label>
              </div>

              <div className="min-w-2/3 max-h-[50vh] overflow-y-scroll">
                <table className="w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Class Name</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Assigned Students</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {searchedStudents.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-2">No students found</td>
                            </tr>
                        ) : (
                            searchedStudents.map((entry) => {
                                return (
                                    <tr key={`${entry.class_id}-${entry.student_id}`} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 text-sm text-gray-800">{entry.class_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{entry.student_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
              </div>

          </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}
