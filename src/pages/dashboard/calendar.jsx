import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, parse , parseISO } from "date-fns";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCog, FaSearch, FaPrint, FaDownload, FaPlus } from "react-icons/fa";
import { HexColorPicker } from "react-colorful";
import Layout from './components/Layout'
import Loading from "../../../components/Loading";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    duration: 60,
    category: "Work",
    description: "",
    priority: "medium"
  });

  const categoryColors = {
    Work: "#4a90e2",
    Personal: "#50d2c2",
    Health: "#ff8a65",
    Entertainment: "#9c27b0",
    Travel: "#ff9800",
    Education: "#4caf50"
  };

  const [classes, setClasses] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/");
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching assigned students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const formattedClasses = classes.map((classObj) => {
    return {
      ...classObj,
      date: format(parseISO(classObj.date), 'MM/dd/yyyy') // Parse and format the date
    };
  });
  

  const getHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow w-full sm:w-auto overflow-x-scroll">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setCurrentDate(addMonths(currentDate, -1))}
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <button
            className={`px-4 py-2 rounded ${currentView === "month" ? "bg-slate-800 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentView("month")}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 rounded ${currentView === "week" ? "bg-slate-800 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentView("week")}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 rounded ${currentView === "day" ? "bg-slate-800 text-white" : "bg-gray-200"}`}
            onClick={() => setCurrentView("day")}
          >
            Day
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setShowEventModal(true)}
          >
            <FaPlus className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaSearch className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaPrint className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FaDownload className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderEventModal = () => {
    return (
      <div className={`fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center ${showEventModal ? "" : "hidden"}`}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              >
                {Object.keys(categoryColors).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={format(newEvent.date, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setEvents([...events, newEvent]);
                  setShowEventModal(false);
                }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const dateFormat = "d";
    const rows = [];

    let filteredClasses = []
  
    let days = [];
    let day = startDate;
  
    while (day <= endDate) {
      // Ensure that the classDate variable is scoped properly for each day
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
  
        // Format the date for comparison
        const formatedDate = format(day, "P");
  
  
        if (classes.length > 0) {
          filteredClasses = formattedClasses.filter(classObj => classObj.date === formatedDate);
        }
  
        days.push(
          <div
            key={day}
            className={`p-2 h-20 sm:h-32 shadow ${!isSameMonth(day, monthStart) ? "bg-gray-100" : (filteredClasses.length > 0 ? 'bg-blue-200  shadow' : '')} ${isSameDay(day, selectedDate) ? "bg-blue-50" : ""}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
          <span className={`text-sm ${!isSameMonth(day, monthStart) ? "text-gray-400" : ""}`}>
            {format(day, dateFormat)}
          </span>
          {events
            .filter((event) => isSameDay(event.date, day))
            .map((event, idx) => (
              <div
                key={idx}
                className="mt-1 p-1 text-xs rounded truncate"
                style={{ backgroundColor: categoryColors[event.category] }}
              >
                {event.title}
              </div>
            ))}
          {
            filteredClasses.length > 0 && (
              filteredClasses.map((c, idx) => (
                <div key={idx} className={`mt-1 p-1 text-xs rounded truncate ${c.status === "done" ? 'bg-blue-100' : 'bg-green-100'} text-center tracking-wider`}>
                  {c.type}
                </div>
              ))
            )
          }
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
  
    return (
      <div className="bg-white rounded-lg shadow overflow-y-scroll">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center py-2 bg-white">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-px">{rows}</div>
      </div>
    );
  };
  

  if(isLoading) return <Loading />

  return (
    <Layout>
      <div className="p-5">
        {getHeader()}
        {renderMonthView()}
        {renderEventModal()}
      </div>
    </Layout>
  );
}
