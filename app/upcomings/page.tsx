"use client";

import React, { useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Nav from "@/components/Helper/Navbar/Nav";
import { EventProps } from "./upcomingsPage.types";
import AddEventModal from "@/components/AddEventModal/AddEventModal";
import Spinner from "@/components/Common/Spinner/Spinner";

const UpcomingsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Page state
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");

  // Sample events data
  const [events, setEvents] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      setLoading(true); // start spinner before API call
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentDate: currentDate,
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setEvents(result.data.events);
        } else {
          console.error("Failed to fetch events:", result.message);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false); // stop spinner after API call
      }
    };

    getEvents();
  }, [currentDate]);

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    setShowAddModal(true);
  };

  // Calendar navigation
  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Get calendar grid
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case "Wedding":
        return "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200";
      case "preShoot":
        return "bg-gradient-to-r from-red-500 to-red-600 shadow-red-200";
      case "Live Event":
        return "bg-gradient-to-r from-green-500 to-green-600 shadow-green-200";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 shadow-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav
          showSearch={false}
          onSearchChange={(val) => setSearchText(val)}
          pageType={setPageName}
        />
        <div className="flex items-center justify-between sticky top-20 px-8 my-4 bg-white z-10">
          <div className="flex items-center gap-4 ">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={goToPrevMonth}
              className="p-3 hover:bg-white/70 rounded-xl transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>

            <h1 className="text-xl font-bold text-blue-800 min-w-[280px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>

            <button
              onClick={goToNextMonth}
              className="p-3 hover:bg-white/70 rounded-xl transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Calendar Container */}
          <div className="p-8 -mt-8">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden h-full">
              {/* Days Header */}
              <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-400">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center font-bold text-gray-700 text-sm uppercase tracking-wide"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {getCalendarDays().map((day, index) => {
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth();
                  const isToday =
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();
                  const dayEvents = getEventsForDate(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isDisabled = isPastDate(day);

                  return (
                    <div
                      key={index}
                      className={`border-r border-b border-gray-200 p-3 min-h-[70px] transition-all duration-200 relative group
                        ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400" : ""}
                        ${isWeekend ? "bg-blue-50/30" : ""}
                        ${
                          isDisabled
                            ? "text-gray-300 cursor-not-allowed bg-gray-100"
                            : "cursor-pointer hover:bg-blue-50/50"
                        }
                      `}
                      onClick={() => !isDisabled && handleDateClick(day)}
                      onMouseEnter={() => !isDisabled && setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {/* Date Number */}
                      <div
                        className={`text-sm font-bold mb-2 flex items-center justify-between ${
                          isToday
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                            : ""
                        }`}
                      >
                        <span className={isToday ? "" : ""}>
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 && !isToday && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-3 py-1.5 rounded-lg text-white truncate font-medium shadow-md transition-all hover:scale-105 ${getEventTypeStyle(
                              event.eventType
                            )}`}
                            title={`${event.title} - ${event.description}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded-lg font-medium">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>

                      {/* Add Event Hint */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default UpcomingsPage;
