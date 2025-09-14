"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import EmojiPicker from "emoji-picker-react";

interface TrainingSession {
  id: string;
  title: string;
  type:
    | "fractionne"
    | "rando-trail"
    | "renfo"
    | "velo"
    | "combo"
    | "personnalise";
  date: string; // YYYY-MM-DD format
  time?: string;
  duration?: string;
  description?: string;
  isCompleted?: boolean;
  hasConstraints?: boolean;
  rpe?: string;
  comments?: string;
  user_id?: string; // Add user_id for admin operations
}

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [runners, setRunners] = useState<
    {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    }[]
  >([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedSession, setDraggedSession] = useState<TrainingSession | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);
  const [newSession, setNewSession] = useState({
    title: "",
    date: "",
    description: "",
    isCompleted: false,
    hasConstraints: false,
    rpe: "",
    comments: "",
    type: "personnalise" as TrainingSession["type"],
    selectedRunnerId: "",
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
    type: "personnalise" as TrainingSession["type"],
  });
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return monday;
  });

  // Training sessions from database
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(
    []
  );

  const today = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const todayString = today.toISOString().split("T")[0];

  // Load user and training sessions from database
  useEffect(() => {
    async function loadUserAndSessions() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
          router.push("/login");
          return;
        }

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUser(user);

        // Check if user is admin
        const isAdmin = user.email === "luc.run.coach@gmail.com";

        // If admin, also load all runners for the dropdown
        if (isAdmin) {
          const { data: runnersData, error: runnersError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .neq("email", "luc.run.coach@gmail.com")
            .order("created_at", { ascending: false });

          if (!runnersError && runnersData) {
            setRunners(runnersData);
          }
        }

        // Load training sessions - all sessions for admin, user sessions for regular users
        let sessionsQuery = supabase
          .from("training_sessions")
          .select(
            `
            *,
            profiles!training_sessions_user_id_fkey (
              first_name,
              last_name,
              email
            )
          `
          )
          .order("session_date", { ascending: true });

        if (!isAdmin) {
          sessionsQuery = sessionsQuery.eq("user_id", user.id);
        }

        const { data: sessions, error: sessionsError } = await sessionsQuery;

        if (sessionsError) {
          console.error("Error loading sessions:", sessionsError);
          setError("Failed to load training sessions");
          return;
        }

        // Convert database format to local format
        const formattedSessions: TrainingSession[] = sessions.map((session) => {
          // For admin view, include user name in title
          const isAdminView = user.email === "luc.run.coach@gmail.com";
          let sessionTitle = session.title;

          if (isAdminView && session.profiles) {
            const userName =
              session.profiles.first_name && session.profiles.last_name
                ? `${session.profiles.first_name} ${session.profiles.last_name}`
                : session.profiles.email?.split("@")[0] || "Unknown User";
            sessionTitle = `${userName}: ${session.title}`;
          }

          return {
            id: session.id,
            title: sessionTitle,
            type: session.session_type,
            date: session.session_date,
            time: session.session_time || undefined,
            duration: session.duration_minutes
              ? `${session.duration_minutes} min`
              : undefined,
            description: session.description || undefined,
            isCompleted: session.is_completed || false,
            hasConstraints: session.has_constraints || false,
            rpe: session.rpe?.toString() || undefined,
            comments: session.comments || undefined,
            user_id: session.user_id, // Include user_id for admin operations
          };
        });

        setTrainingSessions(formattedSessions);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    }

    loadUserAndSessions();
  }, [router, supabase]);

  // Handle URL parameters for runner filtering
  useEffect(() => {
    const runnerParam = searchParams.get("runner");
    if (runnerParam && currentUser?.email === "luc.run.coach@gmail.com") {
      setSelectedRunnerFilter(runnerParam);
    }
  }, [searchParams, currentUser]);

  // Helper function to convert local session to database format
  const sessionToDbFormat = (
    session: Omit<TrainingSession, "id"> | TrainingSession,
    userId: string
  ) => {
    return {
      user_id: userId,
      title: session.title,
      session_type: session.type,
      session_date: session.date,
      session_time: session.time || null,
      duration_minutes: session.duration
        ? parseInt(session.duration.replace(" min", ""))
        : null,
      description: session.description || null,
      is_completed: session.isCompleted || false,
      has_constraints: session.hasConstraints || false,
      rpe: session.rpe ? parseInt(session.rpe) : null,
      comments: session.comments || null,
    };
  };

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

  // Get sessions for a specific date (with optional runner filter)
  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    let filteredSessions = trainingSessions.filter(
      (session) => session.date === dateString
    );

    // Apply runner filter for admin
    if (
      currentUser?.email === "luc.run.coach@gmail.com" &&
      selectedRunnerFilter !== "all"
    ) {
      filteredSessions = filteredSessions.filter(
        (session) => session.user_id === selectedRunnerFilter
      );
    }

    return filteredSessions;
  };

  // Session type colors
  const getSessionColor = (type: string) => {
    switch (type) {
      case "fractionne":
        return "bg-red-100 text-red-800 border-red-200";
      case "rando-trail":
        return "bg-green-100 text-green-800 border-green-200";
      case "renfo":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "velo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "combo":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "personnalise":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, session: TrainingSession) => {
    // Only allow admin users to drag sessions
    if (currentUser?.email !== "luc.run.coach@gmail.com") {
      e.preventDefault();
      return;
    }

    setDraggedSession(session);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedSession && currentUser) {
      // Only allow admin users to drop sessions
      const isAdmin = currentUser.email === "luc.run.coach@gmail.com";
      if (!isAdmin) {
        setDraggedSession(null); // Clear the dragged session
        return;
      }

      const newDateString = targetDate.toISOString().split("T")[0];

      try {
        setSaving(true);
        setError(null);

        // Admin can move any session (no user_id filter needed)
        const { error } = await supabase
          .from("training_sessions")
          .update({ session_date: newDateString })
          .eq("id", draggedSession.id);

        if (error) {
          console.error("Error updating session date:", error);
          setError(`Failed to update session date: ${error.message}`);
          return;
        }

        console.log(
          "Session date updated successfully:",
          draggedSession.id,
          "to",
          newDateString
        );

        // Update local state
        setTrainingSessions((prev) =>
          prev.map((session) =>
            session.id === draggedSession.id
              ? { ...session, date: newDateString }
              : session
          )
        );

        setDraggedSession(null);
      } catch (err) {
        console.error("Error updating session:", err);
        setError("Failed to update session");
      } finally {
        setSaving(false);
      }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      selectedRunnerId: "",
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateModalDate(null);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    console.log("handleCreateSession called!");
    e.preventDefault();

    if (!currentUser) {
      console.log("No current user");
      return;
    }

    if (!newSession.type) {
      console.log("No session type selected");
      return;
    }

    // For admin users, check if a runner is selected
    const isAdmin = currentUser.email === "luc.run.coach@gmail.com";
    console.log("Is admin:", isAdmin);

    // Determine target user ID
    let targetUserId = currentUser.id;
    if (isAdmin) {
      if (selectedRunnerFilter !== "all") {
        // When viewing specific runner's calendar, use that runner's ID
        targetUserId = selectedRunnerFilter;
      } else if (newSession.selectedRunnerId) {
        // When viewing all runners, use selected runner from dropdown
        targetUserId = newSession.selectedRunnerId;
      } else {
        console.log("Admin but no runner selected");
        setError("Please select a runner to assign this session to");
        return;
      }
    }

    console.log("Creating session:", {
      newSession,
      isAdmin,
      selectedRunnerFilter,
      targetUserId,
    });

    try {
      setSaving(true);
      setError(null);

      const sessionData = sessionToDbFormat(
        {
          ...newSession,
          title: newSession.type, // Use the session type as the title
          time: "08:00", // Default time
          duration: "30 min", // Default duration
        },
        targetUserId
      );

      const { data, error } = await supabase
        .from("training_sessions")
        .insert(sessionData)
        .select(
          `
          *,
          profiles!training_sessions_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `
        )
        .single();

      if (error) {
        console.error("Error creating session:", error);
        console.error("Session data:", sessionData);
        setError(`Failed to create session: ${error.message}`);
        return;
      }

      // Convert back to local format and add to state
      let sessionTitle = data.title;

      // For admin view, include user name in title
      if (isAdmin && data.profiles) {
        const userName =
          data.profiles.first_name && data.profiles.last_name
            ? `${data.profiles.first_name} ${data.profiles.last_name}`
            : data.profiles.email?.split("@")[0] || "Unknown User";
        sessionTitle = `${userName}: ${data.title}`;
      }

      const newLocalSession: TrainingSession = {
        id: data.id,
        title: sessionTitle,
        type: data.session_type,
        date: data.session_date,
        time: data.session_time || undefined,
        duration: data.duration_minutes
          ? `${data.duration_minutes} min`
          : undefined,
        description: data.description || undefined,
        isCompleted: data.is_completed || false,
        hasConstraints: data.has_constraints || false,
        rpe: data.rpe?.toString() || undefined,
        comments: data.comments || undefined,
        user_id: data.user_id, // Include user_id for admin operations
      };

      setTrainingSessions((prev) => [...prev, newLocalSession]);
      closeCreateModal();
      console.log("Session created successfully:", newLocalSession);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session");
    } finally {
      setSaving(false);
    }
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

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession.title.trim() || !selectedSession || !currentUser) return;

    try {
      setSaving(true);
      setError(null);

      // For admin users, don't filter by currentUser.id since they can edit any session
      const isAdmin = currentUser.email === "luc.run.coach@gmail.com";

      // We need to get the original user_id from the session
      // For admin users, we keep the original session's user_id
      // For regular users, we use their own ID
      const targetUserId = isAdmin
        ? selectedSession.user_id || currentUser.id // Get from original session or fallback
        : currentUser.id;

      const sessionData = sessionToDbFormat(
        {
          ...editSession,
          time: selectedSession.time, // Keep existing time
          duration: selectedSession.duration, // Keep existing duration
        },
        targetUserId
      );

      console.log("Updating session:", {
        sessionId: selectedSession.id,
        sessionData,
        isAdmin,
      });

      // Update the session - admin can update any session, regular users only their own
      let updateQuery = supabase
        .from("training_sessions")
        .update(sessionData)
        .eq("id", selectedSession.id);

      // Only add user_id filter for non-admin users
      if (!isAdmin) {
        updateQuery = updateQuery.eq("user_id", currentUser.id);
      }

      const { error, data } = await updateQuery;

      if (error) {
        console.error("Error updating session:", error);
        setError(`Failed to update session: ${error.message}`);
        return;
      }

      console.log("Update successful:", data);

      // Update local state with the corrected title format
      setTrainingSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession.id
            ? {
                ...session,
                title: editSession.title, // Use the edited title (already includes runner name if admin)
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
    } catch (err) {
      console.error("Error updating session:", err);
      setError("Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession || !currentUser) return;

    try {
      setSaving(true);
      setError(null);

      // Check if user is admin
      const isAdmin = currentUser.email === "luc.run.coach@gmail.com";

      // Admin can delete any session, regular users can only delete their own
      let deleteQuery = supabase
        .from("training_sessions")
        .delete()
        .eq("id", selectedSession.id);

      // Only add user_id filter for non-admin users
      if (!isAdmin) {
        deleteQuery = deleteQuery.eq("user_id", currentUser.id);
      }

      const { error } = await deleteQuery;

      if (error) {
        console.error("Error deleting session:", error);
        setError(`Failed to delete session: ${error.message}`);
        return;
      }

      console.log("Session deleted successfully:", selectedSession.id);

      // Update local state
      setTrainingSessions((prev) =>
        prev.filter((session) => session.id !== selectedSession.id)
      );

      closeSessionModal();
    } catch (err) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session");
    } finally {
      setSaving(false);
    }
  };

  // Copy session handlers
  const openCopySession = () => {
    if (selectedSession) {
      setCopySession({
        targetRunnerId: "",
        targetDate: new Date().toISOString().split("T")[0], // Default to today
      });
      setShowCopySession(true);
    }
  };

  const closeCopySession = () => {
    setShowCopySession(false);
    setCopySession({
      targetRunnerId: "",
      targetDate: "",
    });
  };

  const handleCopySession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedSession ||
      !currentUser ||
      !copySession.targetRunnerId ||
      !copySession.targetDate
    ) {
      setError("Please fill in all required fields for copying the session");
      return;
    }

    const isAdmin = currentUser.email === "luc.run.coach@gmail.com";
    if (!isAdmin) {
      setError("Only admin users can copy sessions");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create session data based on the original session but for the new runner and date
      const sessionData = sessionToDbFormat(
        {
          title: selectedSession.type, // Use the original session type as title
          type: selectedSession.type,
          date: copySession.targetDate,
          time: selectedSession.time || "08:00",
          duration: selectedSession.duration || "30 min",
          description: selectedSession.description || "",
          isCompleted: false, // New session should start as not completed
          hasConstraints: false, // Reset constraints for new session
          rpe: "", // Reset RPE for new session
          comments: "", // Reset comments for new session
        },
        copySession.targetRunnerId
      );

      const { data, error } = await supabase
        .from("training_sessions")
        .insert(sessionData)
        .select(
          `
          *,
          profiles!training_sessions_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `
        )
        .single();

      if (error) {
        console.error("Error copying session:", error);
        setError(`Failed to copy session: ${error.message}`);
        return;
      }

      // Format the new session for display (with runner name for admin view)
      let sessionTitle = data.title;
      if (isAdmin && data.profiles) {
        const userName =
          data.profiles.first_name && data.profiles.last_name
            ? `${data.profiles.first_name} ${data.profiles.last_name}`
            : data.profiles.email?.split("@")[0] || "Unknown User";
        sessionTitle = `${userName}: ${data.title}`;
      }

      const newLocalSession: TrainingSession = {
        id: data.id,
        title: sessionTitle,
        type: data.session_type,
        date: data.session_date,
        time: data.session_time || undefined,
        duration: data.duration_minutes
          ? `${data.duration_minutes} min`
          : undefined,
        description: data.description || undefined,
        isCompleted: data.is_completed || false,
        hasConstraints: data.has_constraints || false,
        rpe: data.rpe?.toString() || undefined,
        comments: data.comments || undefined,
        user_id: data.user_id,
      };

      // Add the new session to local state
      setTrainingSessions((prev) => [...prev, newLocalSession]);

      // Close both the copy modal and the main session modal
      closeCopySession();
      closeSessionModal();

      console.log("Session copied successfully:", newLocalSession);
    } catch (err) {
      console.error("Error copying session:", err);
      setError("Failed to copy session");
    } finally {
      setSaving(false);
    }
  };

  const [showEmojiPickerDescription, setShowEmojiPickerDescription] =
    useState(false);
  const [showEmojiPickerComments, setShowEmojiPickerComments] = useState(false);
  const [showEditEmojiPickerDescription, setShowEditEmojiPickerDescription] =
    useState(false);
  const [showEditEmojiPickerComments, setShowEditEmojiPickerComments] =
    useState(false);

  // Filter state for admin
  const [selectedRunnerFilter, setSelectedRunnerFilter] =
    useState<string>("all");

  // Copy session state
  const [showCopySession, setShowCopySession] = useState(false);
  const [copySession, setCopySession] = useState({
    targetRunnerId: "",
    targetDate: "",
  });

  // Handle emoji selection for new session
  const handleEmojiClickDescription = (emojiData: { emoji: string }) => {
    setNewSession({
      ...newSession,
      description: newSession.description + emojiData.emoji,
    });
    setShowEmojiPickerDescription(false);
  };

  const handleEmojiClickComments = (emojiData: { emoji: string }) => {
    setNewSession({
      ...newSession,
      comments: newSession.comments + emojiData.emoji,
    });
    setShowEmojiPickerComments(false);
  };

  // Handle emoji selection for edit session
  const handleEditEmojiClickDescription = (emojiData: { emoji: string }) => {
    setEditSession({
      ...editSession,
      description: editSession.description + emojiData.emoji,
    });
    setShowEditEmojiPickerDescription(false);
  };

  const handleEditEmojiClickComments = (emojiData: { emoji: string }) => {
    setEditSession({
      ...editSession,
      comments: editSession.comments + emojiData.emoji,
    });
    setShowEditEmojiPickerComments(false);
  };

  // Add helper function to get RPE background color
  const getRpeBackgroundColor = (rpe: string) => {
    const rpeValue = parseInt(rpe);
    if (!rpe || isNaN(rpeValue)) return "";
    if (rpeValue >= 1 && rpeValue <= 3) return "bg-green-200";
    if (rpeValue >= 4 && rpeValue <= 7) return "bg-orange-200";
    if (rpeValue >= 8 && rpeValue <= 10) return "bg-red-200";
    return "";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Training Calendar
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {saving && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-700">Saving changes...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Training Calendar
              {currentUser?.email === "luc.run.coach@gmail.com" && (
                <span className="ml-3 text-lg font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Admin View - All Users
                </span>
              )}
            </h1>
            <p className="text-lg text-gray-600">{formatDate(today)}</p>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Runner Filter for Admin */}
            {currentUser?.email === "luc.run.coach@gmail.com" && (
              <div className="bg-white rounded-lg border shadow-sm">
                <select
                  value={selectedRunnerFilter}
                  onChange={(e) => setSelectedRunnerFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Runners</option>
                  {runners.map((runner) => (
                    <option key={runner.id} value={runner.id}>
                      {runner.first_name && runner.last_name
                        ? `${runner.first_name} ${runner.last_name}`
                        : runner.first_name ||
                          runner.email?.split("@")[0] ||
                          "Unknown User"}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                        {currentUser?.email === "luc.run.coach@gmail.com" && (
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
                        )}
                      </div>

                      {/* Training Sessions - Scrollable */}
                      <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-hide">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            draggable={
                              currentUser?.email === "luc.run.coach@gmail.com"
                            }
                            onDragStart={(e) => handleDragStart(e, session)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSessionModal(session);
                            }}
                            className={`text-xs px-1 py-0.5 rounded border cursor-pointer hover:shadow-sm transition-shadow truncate ${getSessionColor(
                              session.type
                            )}`}
                            title={`${session.title} - ${session.time || ""} ${
                              currentUser?.email === "luc.run.coach@gmail.com"
                                ? "(Admin View)"
                                : "(Click to edit)"
                            }`}
                          >
                            {session.title}
                          </div>
                        ))}
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
                        {currentUser?.email === "luc.run.coach@gmail.com" && (
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
                        )}
                      </div>

                      {/* Training Sessions - Scrollable */}
                      <div className="space-y-1 overflow-y-auto max-h-20 scrollbar-hide">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            draggable={
                              currentUser?.email === "luc.run.coach@gmail.com"
                            }
                            onDragStart={(e) => handleDragStart(e, session)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSessionModal(session);
                            }}
                            className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm transition-shadow truncate ${getSessionColor(
                              session.type
                            )}`}
                            title={`${session.title} - ${session.time || ""} ${
                              currentUser?.email === "luc.run.coach@gmail.com"
                                ? "(Admin View)"
                                : "(Click to edit)"
                            }`}
                          >
                            {session.title}
                          </div>
                        ))}
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
            Types de séance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { type: "fractionne", label: "Fractionné" },
              { type: "rando-trail", label: "Rando Trail" },
              { type: "renfo", label: "Renfo" },
              { type: "velo", label: "Vélo" },
              { type: "combo", label: "Combo" },
              { type: "personnalise", label: "Personnalisé" },
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

              <form
                onSubmit={(e) => {
                  console.log("Form submitted - calling handleCreateSession");
                  e.preventDefault();
                  handleCreateSession(e);
                }}
                className="p-6"
              >
                {/* Runner Selection for Admin */}
                {currentUser?.email === "luc.run.coach@gmail.com" && (
                  <div className="mb-4">
                    {selectedRunnerFilter !== "all" ? (
                      // Show selected runner info when viewing specific runner's calendar
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assigning to Runner
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                          {(() => {
                            const selectedRunner = runners.find(
                              (r) => r.id === selectedRunnerFilter
                            );
                            return selectedRunner
                              ? selectedRunner.first_name &&
                                selectedRunner.last_name
                                ? `${selectedRunner.first_name} ${selectedRunner.last_name}`
                                : selectedRunner.first_name ||
                                  selectedRunner.email?.split("@")[0] ||
                                  "Unknown User"
                              : "Selected Runner";
                          })()}
                        </div>
                      </div>
                    ) : (
                      // Show dropdown when viewing all runners
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign to Runner *
                        </label>
                        <select
                          value={newSession.selectedRunnerId}
                          onChange={(e) =>
                            setNewSession({
                              ...newSession,
                              selectedRunnerId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        >
                          <option value="">Select a runner...</option>
                          {runners.length === 0 ? (
                            <option value="" disabled>
                              No runners found
                            </option>
                          ) : (
                            runners.map((runner) => (
                              <option key={runner.id} value={runner.id}>
                                {runner.first_name && runner.last_name
                                  ? `${runner.first_name} ${runner.last_name}`
                                  : runner.first_name ||
                                    runner.email?.split("@")[0] ||
                                    "Unknown User"}
                                {runner.email && ` (${runner.email})`}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Title and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de séance
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) => {
                        console.log("Session type changed:", e.target.value);
                        setNewSession({
                          ...newSession,
                          type: e.target.value as TrainingSession["type"],
                          title: e.target.value, // Set title to match the type
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="fractionne">Fractionné</option>
                      <option value="rando-trail">Rando Trail</option>
                      <option value="renfo">Renfo</option>
                      <option value="velo">Vélo</option>
                      <option value="combo">Combo</option>
                      <option value="personnalise">Personnalisé</option>
                    </select>
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
                <div className="mb-4 relative">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <div className="flex justify-start mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setShowEmojiPickerDescription(
                          !showEmojiPickerDescription
                        )
                      }
                      aria-label="Add emoji"
                      className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                    >
                      <span className="text-sm mr-1">😊</span>
                    </button>
                  </div>
                  {showEmojiPickerDescription && (
                    <div className="absolute z-10 mt-1 left-0">
                      <EmojiPicker onEmojiClick={handleEmojiClickDescription} />
                    </div>
                  )}
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                      RPE (Perception de l&apos;effort)
                    </label>
                    <select
                      value={newSession.rpe}
                      onChange={(e) =>
                        setNewSession({ ...newSession, rpe: e.target.value })
                      }
                      disabled={
                        currentUser?.email === "luc.run.coach@gmail.com"
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getRpeBackgroundColor(
                        newSession.rpe
                      )} ${
                        currentUser?.email === "luc.run.coach@gmail.com"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 - 😌 Très facile</option>
                      <option value="2">2 - 😊 Facile</option>
                      <option value="3">3 - 🙂 Modéré</option>
                      <option value="4">4 - 😐 Quelque peu difficile</option>
                      <option value="5">5 - 😓 Difficile</option>
                      <option value="6">6 - 😖 Très difficile</option>
                      <option value="7">7 - 😫 Extrêmement difficile</option>
                      <option value="8">8 - 🥵 Intense</option>
                      <option value="9">9 - 🤯 Très intense</option>
                      <option value="10">10 - 💀 Maximum</option>
                    </select>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires
                  </label>
                  <textarea
                    value={newSession.comments}
                    onChange={(e) =>
                      setNewSession({ ...newSession, comments: e.target.value })
                    }
                    rows={3}
                    disabled={currentUser?.email === "luc.run.coach@gmail.com"}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      currentUser?.email === "luc.run.coach@gmail.com"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  {currentUser?.email !== "luc.run.coach@gmail.com" && (
                    <div className="flex justify-start mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setShowEmojiPickerComments(!showEmojiPickerComments)
                        }
                        className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                        aria-label="Add emoji"
                      >
                        <span className="text-sm mr-1">😊</span>
                      </button>
                    </div>
                  )}
                  {showEmojiPickerComments && (
                    <div className="absolute z-10 mt-1 left-0">
                      <EmojiPicker onEmojiClick={handleEmojiClickComments} />
                    </div>
                  )}
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
                    disabled={saving}
                    onClick={() => {
                      console.log("Create button clicked");
                      console.log("Form data:", newSession);
                      // Don't prevent default - let form submission happen
                    }}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{saving ? "Creating..." : "Créer"}</span>
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
                      Type de séance
                    </label>
                    <select
                      value={editSession.type}
                      onChange={(e) => {
                        // For admin users, preserve the original title structure with runner name
                        let newTitle = e.target.value;
                        if (
                          currentUser?.email === "luc.run.coach@gmail.com" &&
                          selectedSession
                        ) {
                          const originalTitle = selectedSession.title;
                          // Check if the original title contains a colon (indicating it has a runner name)
                          if (originalTitle.includes(":")) {
                            const runnerName = originalTitle.split(":")[0];
                            newTitle = `${runnerName}: ${e.target.value}`;
                          }
                        }
                        setEditSession({
                          ...editSession,
                          type: e.target.value as TrainingSession["type"],
                          title: newTitle,
                        });
                      }}
                      disabled={
                        currentUser?.email !== "luc.run.coach@gmail.com"
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        currentUser?.email !== "luc.run.coach@gmail.com"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="fractionne">Fractionné</option>
                      <option value="rando-trail">Rando Trail</option>
                      <option value="renfo">Renfo</option>
                      <option value="velo">Vélo</option>
                      <option value="combo">Combo</option>
                      <option value="personnalise">Personnalisé</option>
                    </select>
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
                      disabled={
                        currentUser?.email !== "luc.run.coach@gmail.com"
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                        currentUser?.email !== "luc.run.coach@gmail.com"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 relative">
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
                    disabled={currentUser?.email !== "luc.run.coach@gmail.com"}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      currentUser?.email !== "luc.run.coach@gmail.com"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <div className="flex justify-start mt-1">
                    {currentUser?.email === "luc.run.coach@gmail.com" && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowEditEmojiPickerDescription(
                            !showEditEmojiPickerDescription
                          )
                        }
                        className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                        aria-label="Add emoji"
                      >
                        <span className="text-sm mr-1">😊</span>
                      </button>
                    )}
                  </div>
                  {showEditEmojiPickerDescription && (
                    <div className="absolute z-10 mt-1 left-0">
                      <EmojiPicker
                        onEmojiClick={handleEditEmojiClickDescription}
                      />
                    </div>
                  )}
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                          disabled={
                            currentUser?.email === "luc.run.coach@gmail.com"
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
                      RPE (Perception de l&apos;effort)
                    </label>
                    <select
                      value={editSession.rpe}
                      onChange={(e) =>
                        setEditSession({ ...editSession, rpe: e.target.value })
                      }
                      disabled={
                        currentUser?.email === "luc.run.coach@gmail.com"
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${getRpeBackgroundColor(
                        editSession.rpe
                      )} ${
                        currentUser?.email === "luc.run.coach@gmail.com"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1 - 😌 Très facile</option>
                      <option value="2">2 - 😊 Facile</option>
                      <option value="3">3 - 🙂 Modéré</option>
                      <option value="4">4 - 😐 Quelque peu difficile</option>
                      <option value="5">5 - 😓 Difficile</option>
                      <option value="6">6 - 😖 Très difficile</option>
                      <option value="7">7 - 😫 Extrêmement difficile</option>
                      <option value="8">8 - 🥵 Intense</option>
                      <option value="9">9 - 🤯 Très intense</option>
                      <option value="10">10 - 💀 Maximum</option>
                    </select>
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-6 relative">
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
                    disabled={currentUser?.email === "luc.run.coach@gmail.com"}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      currentUser?.email === "luc.run.coach@gmail.com"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <div className="flex justify-start mt-1">
                    {currentUser?.email !== "luc.run.coach@gmail.com" && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowEditEmojiPickerComments(
                            !showEditEmojiPickerComments
                          )
                        }
                        className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                        aria-label="Add emoji"
                      >
                        <span className="text-sm mr-1">😊</span>
                      </button>
                    )}
                  </div>
                  {showEditEmojiPickerComments && (
                    <div className="absolute z-10 mt-1 left-0">
                      <EmojiPicker
                        onEmojiClick={handleEditEmojiClickComments}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    {currentUser?.email === "luc.run.coach@gmail.com" && (
                      <button
                        type="button"
                        onClick={handleDeleteSession}
                        disabled={saving}
                        className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {saving && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        )}
                        <span>{saving ? "Deleting..." : "Supprimer"}</span>
                      </button>
                    )}
                    {currentUser?.email === "luc.run.coach@gmail.com" && (
                      <button
                        type="button"
                        onClick={openCopySession}
                        disabled={saving}
                        className="px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy Session</span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex gap-3 ${
                      currentUser?.email !== "luc.run.coach@gmail.com"
                        ? "ml-auto"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={closeSessionModal}
                      disabled={saving}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{saving ? "Updating..." : "Modifier"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copy Session Modal */}
        {showCopySession && selectedSession && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Copy Session
                </h2>
                <button
                  onClick={closeCopySession}
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

              <form onSubmit={handleCopySession} className="p-6">
                {/* Original Session Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Copying Session:
                  </h3>
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs ${getSessionColor(
                      selectedSession.type
                    )}`}
                  >
                    {selectedSession.type}
                  </div>
                  {selectedSession.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedSession.description}
                    </p>
                  )}
                </div>

                {/* Target Runner Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Runner *
                  </label>
                  <select
                    value={copySession.targetRunnerId}
                    onChange={(e) =>
                      setCopySession({
                        ...copySession,
                        targetRunnerId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Select a runner...</option>
                    {runners.length === 0 ? (
                      <option value="" disabled>
                        No runners found
                      </option>
                    ) : (
                      runners.map((runner) => (
                        <option key={runner.id} value={runner.id}>
                          {runner.first_name && runner.last_name
                            ? `${runner.first_name} ${runner.last_name}`
                            : runner.first_name ||
                              runner.email?.split("@")[0] ||
                              "Unknown User"}
                          {runner.email && ` (${runner.email})`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Target Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Date *
                  </label>
                  <input
                    type="date"
                    value={copySession.targetDate}
                    onChange={(e) =>
                      setCopySession({
                        ...copySession,
                        targetDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCopySession}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      !copySession.targetRunnerId ||
                      !copySession.targetDate
                    }
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{saving ? "Copying..." : "Copy Session"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Calendar() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarContent />
    </Suspense>
  );
}
