import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { MdDelete } from "react-icons/md";
import { Dialog } from "../../../../components/Dialog";

export default function Events() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        starting_date: "",
        deadline: ""
    });
    const [isLoading, setLoading] = useState(false);
    const [searchDate, setSearchDate] = useState("");
    const [searchType, setSearchType] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/events/");
            const data = await res.json();
            //console.log("Fetched events:", data);
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Error fetching events!", { position: "top-center" });
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/events/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: formData.name, 
                    date: formData.starting_date, 
                    deadline: formData.deadline, 
                    status: "Scheduled" 
                }),
            });

            if (!res.ok) throw new Error("Failed to add event");

            toast.success("Event scheduled successfully!", { position: "top-center" });
            fetchEvents(); // Refresh events list
            setFormData({ name: "", starting_date: "", deadline: "" }); // Reset form
        } catch (error) {
            toast.error("Error scheduling the event", { position: "top-center" });
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => 
        (searchDate ? event.date.includes(searchDate) : true) &&
        (searchType ? event.title.toLowerCase().includes(searchType.toLowerCase()) : true)
    );

    const updateEventStatus = async (id, newStatus) => {
      setLoading(true);
      try {
        const res = await fetch("/api/events/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus }),
        });
    
        if (res.ok) {
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.id === id ? { ...event, status: newStatus } : event
            )
          );
        } else {
          console.error("Failed to update status");
        }
      } catch (error) {
        console.error("Error updating event:", error);
      } finally {
        setLoading(false);
      }
    };

    const [modal, setModal] = useState({ header: "", cont: "", func: null });

    const deleteEvent = (id) => {
      if (!id) {
        toast.error('Error!' , {position: "top-center"});
        return;
      }
      setModal({
        header: "Warning",
        cont: "Are you sure you want to delete this event?",
        func: () => handleDelete(id),
      });
      document.getElementById("my_modal_5").showModal();
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "DELETE",
            });
            if (res.ok) { 
              toast.success("Event deleted successfully!", { position: "top-center" });
              setEvents(events.filter(event => event.id !== id));
            } else {
              toast.error("Failed to delete event", { position: "top-center" });
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Error deleting event", { position: "top-center" });
        } finally {
            setLoading(false);
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
                  <button onClick={() => {document.getElementById("my_modal_5").close();}} className="btn border-0">No</button>
                  <button
                    type="button"
                    onClick={() => {
                      modal.func(); // Trigger the function passed in the modal state
                      document.getElementById("my_modal_5").close(); // Close the modal
                    }}
                    className="bg-red-600 btn border-0 text-white hover:bg-red-700"
                  >
                    Yes
                  </button>
                </form>
              </div>
            </div>
          </dialog>


          <div className="p-5">
            <div className="w-full tracking-wider py-3 text-xl sm:text-3xl text-slate-900">
              Event Management
            </div>
            <div className="w-full flex flex-col py-5">
              <div className="sm:text-xl  mb-2">Schedule an event</div>
              <form onSubmit={handleSubmit} className="flex sm:flex-row w-full  items-end flex-wrap gap-4 justify-between sm:justify-normal">
                <div className="flex w-full sm:w-1/3 gap-2">
                  <div className="grow-1 sm:max-w-full">
                    <label htmlFor="type">Event name</label> 
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter event name"
                      className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2 flex gap-2">
                  <div className="grow-1 flex-col sm:max-w-sm flex justify-center">
                    <label htmlFor="date">Starting Date</label> 
                    <input
                      type="date"
                      id="starting_date"
                      name="starting_date"
                      value={formData.starting_date}
                      onChange={handleChange}
                      className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grow-1 flex-col sm:max-w-sm flex justify-center">
                    <label htmlFor="date">Deadline</label> 
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <button  className="bg-slate-900 w-full sm:w-fit text-white px-5 py-2 shadow-md cursor-pointer gap-2 rounded duration-200 hover:bg-slate-600 flex justify-center items-center" type="submit">
                  Schedule
                </button>
              </form>
            </div>

            <div className="mt-5 sm:mt-0">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-xl text-slate-900 w-full ">Event List</h1>          
                <div className="my-4 w-full justify-end">
                  <div className="flex gap-4 w-full justify-end">
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
              <div className="overflow-y-scroll max-h-[70vh]">
                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Starting date</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Deadline</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 max-h-screen overflow-y-scroll">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-2">No events found</td>
                      </tr>
                    ) : (
                      filteredEvents.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((c) => {
                        return (
                          <tr
                            key={c.id}
                            onClick={() => router.push(`/dashboard/Events/${c.id}`)}
                            className={c.status === "done" ? "bg-green-200 duration-300 hover:bg-green-50 cursor-pointer" : "bg-blue-50 duration-300 hover:bg-blue-100 cursor-pointer"}
                          >
                            <td className="text-xs sm:text-sm px-6 py-4">{c.title}</td>
                            <td className="text-xs sm:text-sm px-6 py-4">{c.date.split("T")[0]}</td>
                            <td className="text-xs sm:text-sm px-6 py-4">{c.deadline.split("T")[0]}</td>
                            <td className="text-xs sm:text-sm px-6 py-4">{c.status === "done" ? "Completed" : "Pending"}</td>
                            <td className="text-xs sm:text-sm px-6 py-4 flex gap-5 items-center">
                              <button
                                className="cursor-pointer"
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  updateEventStatus(c.id, c.status === "done" ? "pending" : "done"); // Toggle status
                                }}
                              >
                                {c.status === "done" ? "✅" : "❌"}
                              </button>
                              <button>
                                <MdDelete
                                  className="text-red-500 cursor-pointer text-xl"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    deleteEvent(c.id);
                                  }}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className="sm:hidden flex flex-col gap-2 max-h-[70vh] overflow-y-scroll">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-2">No events found</div>
                  ) : (
                    filteredEvents.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => router.push(`/dashboard/Events/${c.id}`)}
                        className={c.status === "done" ? "bg-green-200 duration-300 flex hover:bg-green-50 cursor-pointer p-4 rounded-lg" : "bg-blue-50 flex duration-300 hover:bg-blue-100 cursor-pointer p-4 rounded-lg"}
                      >
                        <div className="grow">
                          <div className="text-md sm:text-sm ">{c.title}</div>
                          <div className="text-xs text-black/50 sm:text-sm">Starting Date: {c.date.split("T")[0]}</div>
                          <div className="text-xs text-black/50 sm:text-sm">Deadline: {c.deadline.split("T")[0]}</div>
                        </div>
                        <div className="px-5">
                          <button
                            className="cursor-pointer mt-2"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateEventStatus(c.id, c.status === "done" ? "pending" : "done"); // Toggle status
                            }}
                          >
                            {c.status === "done" ? "✅" : "❌"}
                          </button>
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
