"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";

interface TrainingSession {
  id: string;
  title: string;
  type: "speed" | "recovery" | "long-run" | "interval" | "tempo";
  date: string; // YYYY-MM-DD format
  time?: string;
  duration?: string;
  description?: string;
  isCompleted?: boolean;
  hasConstraints?: boolean;
  rpe?: string;
  comments?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedSession, setDraggedSession] = useState<TrainingSession | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    date: "",
    description: "",
    isCompleted: false,
    hasConstraints: false,
    rpe: "",
    comments: "",
    type: "recovery" as TrainingSession["type"],
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);
  const [editSession, setEditSession] = useState({
    title: "",
    date: "",
    description: "",
    isCompleted: false,
    hasConstraints: false,
    rpe: "",
    comments: "",
    type: "recovery" as TrainingSession["type"],
  });
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return monday;
  });

  // Sample training sessions data
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    {
      id: "1",
      title: "Speed Session",
      type: "speed",
      date: "2025-01-15",
      time: "07:00",
      duration: "45 min",
    },
    {
      id: "2",
      title: "Recovery Run",
      type: "recovery",
      date: "2025-01-17",
      time: "18:00",
      duration: "30 min",
    },
    {
      id: "3",
      title: "Long Run",
      type: "long-run",
      date: "2025-01-19",
      time: "08:00",
      duration: "90 min",
    },
    {
      id: "4",
      title: "Interval Training",
      type: "interval",
      date: "2025-01-22",
      time: "07:30",
      duration: "60 min",
    },
    {
      id: "5",
      title: "Tempo Run",
      type: "tempo",
      date: "2025-01-20",
      time: "06:30",
      duration: "40 min",
    },
    {
      id: "6",
      title: "Easy Run",
      type: "recovery",
      date: "2025-01-21",
      time: "17:30",
      duration: "25 min",
    },
  ]);

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    setCurrentWeekStart(monday);
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return trainingSessions.filter((session) => session.date === dateString);
  };

  // Session type colors
  const getSessionColor = (type: string) => {
    switch (type) {
      case "speed":
        return "bg-green-100 text-green-800 border-green-200";
      case "recovery":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "long-run":
        return "bg-red-100 text-red-800 border-red-200";
      case "interval":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "tempo":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, session: TrainingSession) => {
    setDraggedSession(session);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedSession) {
      const newDateString = targetDate.toISOString().split("T")[0];
      setTrainingSessions((prev) =>
        prev.map((session) =>
          session.id === draggedSession.id
            ? { ...session, date: newDateString }
            : session
        )
      );
      setDraggedSession(null);
    }
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

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return (
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  // Week view helpers
  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const getSessionsForDateTime = (date: Date, timeSlot: string) => {
    const dateString = date.toISOString().split("T")[0];
    return trainingSessions.filter((session) => {
      if (session.date !== dateString || !session.time) return false;
      const sessionHour = parseInt(session.time.split(":")[0]);
      const sessionMinute = parseInt(session.time.split(":")[1]);
      const slotHour = parseInt(timeSlot.split(":")[0]);
      const slotMinute = parseInt(timeSlot.split(":")[1]);

      // Check if session starts within this 30-minute slot
      return (
        sessionHour === slotHour &&
        ((slotMinute === 0 && sessionMinute < 30) ||
          (slotMinute === 30 && sessionMinute >= 30))
      );
    });
  };

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Modal handlers
  const openCreateModal = (date: Date) => {
    setCreateModalDate(date);
    setNewSession({
      title: "",
      date: date.toISOString().split("T")[0],
      description: "",
      isCompleted: false,
      hasConstraints: false,
      rpe: "",
      comments: "",
      type: "recovery",
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateModalDate(null);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title.trim()) return;

    const session: TrainingSession = {
      id: Date.now().toString(),
      title: newSession.title,
      type: newSession.type,
      date: newSession.date,
      time: "08:00", // Default time
      duration: "30 min", // Default duration
      description: newSession.description,
      isCompleted: newSession.isCompleted,
      hasConstraints: newSession.hasConstraints,
      rpe: newSession.rpe,
      comments: newSession.comments,
    };

    setTrainingSessions((prev) => [...prev, session]);
    closeCreateModal();
  };

  // Session modal handlers
  const openSessionModal = (session: TrainingSession) => {
    setSelectedSession(session);
    setEditSession({
      title: session.title,
      date: session.date,
      description: session.description || "",
      isCompleted: session.isCompleted || false,
      hasConstraints: session.hasConstraints || false,
      rpe: session.rpe || "",
      comments: session.comments || "",
      type: session.type,
    });
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  const handleUpdateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession.title.trim() || !selectedSession) return;

    setTrainingSessions((prev) =>
      prev.map((session) =>
        session.id === selectedSession.id
          ? {
              ...session,
              title: editSession.title,
              type: editSession.type,
              date: editSession.date,
              description: editSession.description,
              isCompleted: editSession.isCompleted,
              hasConstraints: editSession.hasConstraints,
              rpe: editSession.rpe,
              comments: editSession.comments,
            }
          : session
      )
    );
    closeSessionModal();
  };

  const handleDeleteSession = () => {
    if (!selectedSession) return;

    setTrainingSessions((prev) =>
      prev.filter((session) => session.id !== selectedSession.id)
    );
    closeSessionModal();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Training Calendar
            </h1>
            <p className="text-lg text-gray-600">{formatDate(today)}</p>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border shadow-sm">
              <button
                onClick={() => setViewMode("month")}
                className={`flex items-center px-3 py-2 rounded-l-lg text-sm font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`flex items-center px-3 py-2 rounded-r-lg text-sm font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Week
              </button>
            </div>

            {/* Today Button */}
            <button
              onClick={goToToday}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={
                viewMode === "month" ? goToPreviousMonth : goToPreviousWeek
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === "month"
                ? `${
                    monthNames[currentDate.getMonth()]
                  } ${currentDate.getFullYear()}`
                : formatWeekRange(currentWeekStart)}
            </h2>

            <button
              onClick={viewMode === "month" ? goToNextMonth : goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          {viewMode === "month" && (
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-24"></div>;
                  }

                  const sessions = getSessionsForDate(date);
                  const isCurrentMonth = isSameMonth(date);
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`h-24 border rounded-lg p-1 cursor-pointer transition-colors relative group ${
                        isTodayDate
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      } ${!isCurrentMonth ? "opacity-50" : ""}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div
                          className={`text-sm font-medium ${
                            isTodayDate ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateModal(date);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          title="Add session"
                        >
                          <svg
                            className="w-3 h-3 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Training Sessions */}
                      <div className="space-y-1">
                        {sessions.slice(0, 2).map((session) => (
                          <div
                            key={session.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, session)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSessionModal(session);
                            }}
                            className={`text-xs px-1 py-0.5 rounded border cursor-pointer hover:shadow-sm transition-shadow truncate ${getSessionColor(
                              session.type
                            )}`}
                            title={`${session.title} - ${
                              session.time || ""
                            } (Click to edit)`}
                          >
                            {session.title}
                          </div>
                        ))}
                        {sessions.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{sessions.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <div className="p-4">
              {/* Week Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1">
                {getWeekDates(currentWeekStart).map((date, index) => {
                  const sessions = getSessionsForDate(date);
                  const isTodayDate = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`h-32 border rounded-lg p-2 cursor-pointer transition-colors relative group ${
                        isTodayDate
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`text-lg font-semibold ${
                            isTodayDate ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateModal(date);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          title="Add session"
                        >
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Training Sessions */}
                      <div className="space-y-1">
                        {sessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, session)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSessionModal(session);
                            }}
                            className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm transition-shadow truncate ${getSessionColor(
                              session.type
                            )}`}
                            title={`${session.title} - ${
                              session.time || ""
                            } (Click to edit)`}
                          >
                            {session.title}
                          </div>
                        ))}
                        {sessions.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{sessions.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Training Session Legend */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Training Types
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { type: "speed", label: "Speed Session" },
              { type: "recovery", label: "Recovery Run" },
              { type: "long-run", label: "Long Run" },
              { type: "interval", label: "Interval Training" },
              { type: "tempo", label: "Tempo Run" },
            ].map(({ type, label }) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border ${getSessionColor(type)}`}
                ></div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Créer une nouvelle séance
                </h2>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="p-6">
                {/* Title and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) =>
                        setNewSession({ ...newSession, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Radio Button Groups Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Session Completed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Séance terminée?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="completed"
                          checked={newSession.isCompleted}
                          onChange={() =>
                            setNewSession({ ...newSession, isCompleted: true })
                          }
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="completed"
                          checked={!newSession.isCompleted}
                          onChange={() =>
                            setNewSession({ ...newSession, isCompleted: false })
                          }
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraintes?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="constraints"
                          checked={newSession.hasConstraints}
                          onChange={() =>
                            setNewSession({
                              ...newSession,
                              hasConstraints: true,
                            })
                          }
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="constraints"
                          checked={!newSession.hasConstraints}
                          onChange={() =>
                            setNewSession({
                              ...newSession,
                              hasConstraints: false,
                            })
                          }
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>
                </div>

                {/* RPE and Session Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* RPE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RPE (Perception de l'effort)
                    </label>
                    <select
                      value={newSession.rpe}
                      onChange={(e) =>
                        setNewSession({ ...newSession, rpe: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 - Très facile</option>
                      <option value="2">2 - Facile</option>
                      <option value="3">3 - Modéré</option>
                      <option value="4">4 - Quelque peu difficile</option>
                      <option value="5">5 - Difficile</option>
                      <option value="6">6 - Très difficile</option>
                      <option value="7">7 - Extrêmement difficile</option>
                    </select>
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de séance
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          type: e.target.value as TrainingSession["type"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="speed">Speed Session</option>
                      <option value="recovery">Recovery Run</option>
                      <option value="long-run">Long Run</option>
                      <option value="interval">Interval Training</option>
                      <option value="tempo">Tempo Run</option>
                    </select>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires
                  </label>
                  <textarea
                    value={newSession.comments}
                    onChange={(e) =>
                      setNewSession({ ...newSession, comments: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Session Details/Edit Modal */}
        {showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier la séance
                </h2>
                <button
                  onClick={closeSessionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateSession} className="p-6">
                {/* Title and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editSession.title}
                      onChange={(e) =>
                        setEditSession({
                          ...editSession,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editSession.date}
                      onChange={(e) =>
                        setEditSession({ ...editSession, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editSession.description}
                    onChange={(e) =>
                      setEditSession({
                        ...editSession,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Radio Button Groups Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Session Completed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Séance terminée?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="editCompleted"
                          checked={editSession.isCompleted}
                          onChange={() =>
                            setEditSession({
                              ...editSession,
                              isCompleted: true,
                            })
                          }
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="editCompleted"
                          checked={!editSession.isCompleted}
                          onChange={() =>
                            setEditSession({
                              ...editSession,
                              isCompleted: false,
                            })
                          }
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraintes?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="editConstraints"
                          checked={editSession.hasConstraints}
                          onChange={() =>
                            setEditSession({
                              ...editSession,
                              hasConstraints: true,
                            })
                          }
                          className="mr-2"
                        />
                        Oui
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="editConstraints"
                          checked={!editSession.hasConstraints}
                          onChange={() =>
                            setEditSession({
                              ...editSession,
                              hasConstraints: false,
                            })
                          }
                          className="mr-2"
                        />
                        Non
                      </label>
                    </div>
                  </div>
                </div>

                {/* RPE and Session Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* RPE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RPE (Perception de l'effort)
                    </label>
                    <select
                      value={editSession.rpe}
                      onChange={(e) =>
                        setEditSession({ ...editSession, rpe: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 - Très facile</option>
                      <option value="2">2 - Facile</option>
                      <option value="3">3 - Modéré</option>
                      <option value="4">4 - Quelque peu difficile</option>
                      <option value="5">5 - Difficile</option>
                      <option value="6">6 - Très difficile</option>
                      <option value="7">7 - Extrêmement difficile</option>
                    </select>
                  </div>

                  {/* Session Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de séance
                    </label>
                    <select
                      value={editSession.type}
                      onChange={(e) =>
                        setEditSession({
                          ...editSession,
                          type: e.target.value as TrainingSession["type"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="speed">Speed Session</option>
                      <option value="recovery">Recovery Run</option>
                      <option value="long-run">Long Run</option>
                      <option value="interval">Interval Training</option>
                      <option value="tempo">Tempo Run</option>
                    </select>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires
                  </label>
                  <textarea
                    value={editSession.comments}
                    onChange={(e) =>
                      setEditSession({
                        ...editSession,
                        comments: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeSessionModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
