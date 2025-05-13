import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

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
    

    return (
        <Layout isLoading={isLoading}>
          <div className="p-5">
            <div className="w-full tracking-wider sm:px-5 py-3 text-xl sm:text-3xl text-slate-900">
              Event Management
            </div>
            <div className="w-full flex flex-col py-5">
              <div className="sm:text-xl sm:pl-5 mb-2">Schedule an event</div>
              <form onSubmit={handleSubmit} className="flex sm:flex-col w-full sm:w-1/2 sm:px-5 flex-wrap gap-4 justify-between sm:justify-normal">
                <div className="flex w-full gap-2">
                  <div className="grow-1 sm:max-w-sm">
                    <label htmlFor="type">Event name</label> 
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="py-2.5 px-4 block w-full border-gray-200 rounded sm:text-sm bg-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="w-full flex gap-2">
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

            <div className="sm:p-5 mt-5">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-xl text-slate-900 w-full sm:w-auto">Event List</h1>          
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
                <table className="min-w-full divide-y divide-gray-200">
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
                      filteredEvents.map((c) => {
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
                            <td className="text-xs sm:text-sm px-6 py-4">
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
        </Layout>
    );
}
