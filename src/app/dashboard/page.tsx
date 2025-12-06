"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  locked?: boolean;
}

interface RunnerTile {
  id: string;
  name: string;
  email: string;
  program: string;
  avatar: string;
  status: "in-progress" | "today-session" | "ready";
  completionSteps?: string[];
  sessionTime?: string;
}

interface TrainingSession {
  id: string;
  title: string;
  user_id: string;
  session_date: string;
  session_time?: string;
  session_type: string;
  is_completed: boolean;
  user_name: string;
  program_name: string;
  description?: string;
  has_constraints?: boolean;
  rpe?: number;
  comments?: string;
  duration_minutes?: number;
}

// Runner Weekly Calendar Component
function RunnerWeeklyCalendar() {
  const [weekSessions, setWeekSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const supabase = createClient();

  useEffect(() => {
    const fetchWeekSessions = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Calculate week range based on offset
        const today = new Date();
        const baseDate = new Date(today);
        baseDate.setDate(today.getDate() + weekOffset * 7);

        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
        const formatDateLocal = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        // Fetch sessions for the selected week
        const { data: sessions, error } = await supabase
          .from("training_sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("session_date", formatDateLocal(weekStart))
          .lte("session_date", formatDateLocal(weekEnd))
          .order("session_date", { ascending: true });

        if (error) throw error;

        const formattedSessions = (sessions || []).map((session) => ({
          id: session.id,
          title: session.title,
          user_id: session.user_id,
          session_date: session.session_date,
          session_time: session.session_time,
          session_type: session.session_type,
          is_completed: session.is_completed,
          description: session.description,
          has_constraints: session.has_constraints,
          rpe: session.rpe,
          comments: session.comments,
          duration_minutes: session.duration_minutes,
          user_name: "",
          program_name: "",
        }));

        setWeekSessions(formattedSessions);
      } catch (error) {
        console.error("Error fetching week sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekSessions();
  }, [supabase, weekOffset]);

  const getWeekDates = () => {
    const today = new Date();
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + weekOffset * 7);

    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getWeekRangeText = () => {
    const dates = getWeekDates();
    const start = dates[0];
    const end = dates[6];

    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString("fr-FR", {
        month: "long",
        day: "numeric",
      })} - ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return `${start.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      })}, ${end.getFullYear()}`;
    }
  };

  const goToPreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getSessionsForDate = (date: Date) => {
    const dateString = formatDateLocal(date);
    return weekSessions.filter(
      (session) => session.session_date === dateString
    );
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case "fractionne":
        return "bg-red-500 text-white border-red-600";
      case "rando-trail":
        return "bg-pink-500 text-white border-pink-600";
      case "renfo":
        return "bg-gray-900 text-white border-black";
      case "velo":
        return "bg-yellow-500 text-gray-900 border-yellow-600";
      case "combo":
        return "bg-purple-600 text-white border-purple-700";
      case "personnalise":
        return "bg-gray-400 text-white border-gray-500";
      case "marche":
        return "bg-teal-600 text-white border-teal-700";
      case "course-a-pied":
        return "bg-orange-800 text-white border-orange-900";
      case "seance-de-cote":
        return "bg-blue-600 text-white border-blue-700";
      default:
        return "bg-gray-500 text-white border-gray-600";
    }
  };

  const openSessionModal = (session: TrainingSession) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de ton calendrier...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const weekDates = getWeekDates();
  const today = new Date();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {weekOffset === 0
                  ? "Entraînement de cette semaine"
                  : "Programme d'entraînement"}
              </h1>
              <p className="text-lg text-gray-600">{getWeekRangeText()}</p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Week Button */}
              <button
                onClick={goToPreviousWeek}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Semaine précédente"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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

              {/* Today Button (only show if not on current week) */}
              {weekOffset !== 0 && (
                <button
                  onClick={goToCurrentWeek}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Aujourd&apos;hui
                </button>
              )}

              {/* Next Week Button */}
              <button
                onClick={goToNextWeek}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Semaine suivante"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 p-4 pb-0">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {weekDates.map((date, index) => {
              const sessionsForDate = getSessionsForDate(date);
              const isToday = date.toDateString() === today.toDateString();

              return (
                <div
                  key={index}
                  className={`h-56 border rounded-lg p-2 transition-colors relative ${
                    isToday
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`text-lg font-semibold ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Training Sessions - Scrollable */}
                  <div className="space-y-1 overflow-y-auto max-h-44 scrollbar-hide">
                    {sessionsForDate.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => openSessionModal(session)}
                        className={`text-xs px-2 py-2 rounded border cursor-pointer hover:shadow-sm hover:scale-105 transition-all ${getSessionColor(
                          session.session_type || "fractionne"
                        )}`}
                      >
                        <div className="font-medium">{session.title}</div>
                        {session.is_completed && (
                          <div className="text-xs mt-1">✓ Terminé</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <Link
            href="/dashboard/calendar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Calendrier complet
                </h3>
                <p className="text-sm text-gray-600">Voir toutes les séances</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-600">Mettre à jour les infos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Session Details Modal */}
        {showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails de la séance
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

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedSession.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const [year, month, day] = selectedSession.session_date
                        .split("-")
                        .map(Number);
                      const localDate = new Date(year, month - 1, day);
                      return localDate.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}
                  </p>
                </div>

                {selectedSession.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedSession.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getSessionColor(
                      selectedSession.session_type
                    )}`}
                  >
                    {selectedSession.session_type}
                  </span>
                  {selectedSession.is_completed && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Terminé
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    href="/dashboard/calendar"
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir dans le calendrier complet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function AdminDashboard() {
  const [runnersInProgress, setRunnersInProgress] = useState<RunnerTile[]>([]);
  const [weekSessions, setWeekSessions] = useState<TrainingSession[]>([]);
  const [nextWeekSessions, setNextWeekSessions] = useState<TrainingSession[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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
    type: "personnalise" as string,
  });
  const router = useRouter();
  const supabase = createClient();

  // Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Get today's date and week range
        const today = new Date();

        // Get current week range (Monday to Sunday)
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

        // Get next week range
        const nextWeekStart = new Date(currentWeekEnd);
        nextWeekStart.setDate(currentWeekEnd.getDate() + 1);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

        // 1. Fetch runners awaiting approval (completed setup but not active)
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id, first_name, last_name, email, profile_completed, created_at, is_active
          `
          )
          .neq("email", "luc.run.coach@gmail.com")
          .eq("is_active", false)
          .order("created_at", { ascending: false });

        if (profileError) throw profileError;

        const runnersProgressData: RunnerTile[] = [];

        for (const profile of profiles || []) {
          // Check completion status
          const { data: healthSurvey } = await supabase
            .from("health_surveys")
            .select("completed_at")
            .eq("user_id", profile.id)
            .single();

          const { data: enrollments } = await supabase
            .from("user_program_enrollments")
            .select(
              `
              id, is_active,
              training_programs(title)
            `
            )
            .eq("user_id", profile.id)
            .eq("is_active", true);

          const profileCompleted = profile.profile_completed || false;
          const healthCompleted = !!healthSurvey?.completed_at;
          const programEnrolled = enrollments && enrollments.length > 0;

          const runnerName =
            profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.first_name ||
                profile.email?.split("@")[0] ||
                "Unknown User";

          const programName = Array.isArray(enrollments?.[0]?.training_programs)
            ? (enrollments[0].training_programs as { title: string }[])[0]
                ?.title || "No Program"
            : (
                enrollments?.[0]?.training_programs as unknown as {
                  title: string;
                }
              )?.title || "No Program";
          const avatar = profile.first_name
            ? profile.first_name[0].toUpperCase()
            : profile.email?.[0].toUpperCase() || "U";

          // Only show runners who have completed ALL 3 steps but are not yet approved
          if (profileCompleted && healthCompleted && programEnrolled) {
            runnersProgressData.push({
              id: profile.id,
              name: runnerName,
              email: profile.email || "",
              program: programName,
              avatar,
              status: "ready",
              completionSteps: [],
            });
          }
        }

        setRunnersInProgress(runnersProgressData);

        // 2. Fetch current week sessions
        const { data: currentWeekSessions, error: weekError } = await supabase
          .from("training_sessions")
          .select(
            `
            id, title, user_id, session_date, session_time, session_type, is_completed,
            description, has_constraints, rpe, comments, duration_minutes,
            profiles(first_name, last_name, email)
          `
          )
          .gte("session_date", formatDateLocal(currentWeekStart))
          .lte("session_date", formatDateLocal(currentWeekEnd))
          .order("session_date", { ascending: true });

        if (weekError) throw weekError;

        // 3. Fetch next week sessions for planning
        const { data: nextWeekSessionsData, error: nextWeekError } =
          await supabase
            .from("training_sessions")
            .select(
              `
            id, title, user_id, session_date, session_time, session_type, is_completed,
            description, has_constraints, rpe, comments, duration_minutes,
            profiles(first_name, last_name, email)
          `
            )
            .gte("session_date", formatDateLocal(nextWeekStart))
            .lte("session_date", formatDateLocal(nextWeekEnd))
            .order("session_date", { ascending: true });

        if (nextWeekError) throw nextWeekError;

        // Format session data
        const formatSessions = (
          sessions: Record<string, unknown>[]
        ): TrainingSession[] => {
          return sessions.map((session) => ({
            id: session.id as string,
            title: session.title as string,
            user_id: session.user_id as string,
            session_date: session.session_date as string,
            session_time: session.session_time as string,
            session_type: session.session_type as string,
            is_completed: session.is_completed as boolean,
            description: session.description as string,
            has_constraints: session.has_constraints as boolean,
            rpe: session.rpe as number,
            comments: session.comments as string,
            duration_minutes: session.duration_minutes as number,
            user_name: (() => {
              // Handle both array and object cases for profiles
              const profile = Array.isArray(session.profiles)
                ? session.profiles[0]
                : session.profiles;
              return profile?.first_name && profile?.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.email?.split("@")[0] || "Unknown User";
            })(),
            program_name: "Program", // We can enhance this later if needed
          }));
        };

        setWeekSessions(formatSessions(currentWeekSessions || []));
        setNextWeekSessions(formatSessions(nextWeekSessionsData || []));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [supabase]);

  // Helper function to get week dates
  const getWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Helper function to get next week dates
  const getNextWeekDates = () => {
    const today = new Date();
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextWeekStart);
      date.setDate(nextWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Helper function to get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const dateString = formatDateLocal(date);
    return weekSessions.filter(
      (session) => session.session_date === dateString
    );
  };

  // Helper function to get next week sessions for a specific date
  const getNextWeekSessionsForDate = (date: Date) => {
    const dateString = formatDateLocal(date);
    return nextWeekSessions.filter(
      (session) => session.session_date === dateString
    );
  };

  // Session type colors (matching calendar page)
  const getSessionColor = (type: string) => {
    switch (type) {
      case "fractionne":
        return "bg-red-500 text-white border-red-600";
      case "rando-trail":
        return "bg-pink-500 text-white border-pink-600";
      case "renfo":
        return "bg-gray-900 text-white border-black";
      case "velo":
        return "bg-yellow-500 text-gray-900 border-yellow-600";
      case "combo":
        return "bg-purple-600 text-white border-purple-700";
      case "personnalise":
        return "bg-gray-400 text-white border-gray-500";
      case "marche":
        return "bg-teal-600 text-white border-teal-700";
      case "course-a-pied":
        return "bg-orange-800 text-white border-orange-900";
      case "seance-de-cote":
        return "bg-blue-600 text-white border-blue-700";
      default:
        return "bg-gray-500 text-white border-gray-600";
    }
  };

  // Session modal handlers
  const openSessionModal = (session: TrainingSession) => {
    console.log("Opening session modal for:", session);
    setSelectedSession(session);
    setEditSession({
      title: session.title,
      date: session.session_date,
      description: session.description || "",
      isCompleted: session.is_completed || false,
      hasConstraints: session.has_constraints || false,
      rpe: session.rpe?.toString() || "",
      comments: session.comments || "",
      type: session.session_type,
    });
    setShowSessionModal(true);
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession.title.trim() || !selectedSession) return;

    try {
      setSaving(true);
      setError(null);

      // Admin can only edit session details, not user feedback
      const sessionData = {
        title: editSession.title,
        session_type: editSession.type,
        session_date: editSession.date,
        description: editSession.description || null,
        // Don't update user-only fields (is_completed, has_constraints, rpe, comments)
      };

      const { error } = await supabase
        .from("training_sessions")
        .update(sessionData)
        .eq("id", selectedSession.id);

      if (error) {
        console.error("Error updating session:", error);
        setError(`Failed to update session: ${error.message}`);
        return;
      }

      // Update local state - only admin-editable fields
      setWeekSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession.id
            ? {
                ...session,
                title: editSession.title,
                session_type: editSession.type,
                session_date: editSession.date,
                description: editSession.description,
                // Keep existing user feedback fields unchanged
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

  const handleDeleteSession = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSession = async () => {
    if (!selectedSession) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", selectedSession.id);

      if (error) {
        console.error("Error deleting session:", error);
        setError(`Failed to delete session: ${error.message}`);
        return;
      }

      // Update local state
      setWeekSessions((prev) =>
        prev.filter((session) => session.id !== selectedSession.id)
      );
      setNextWeekSessions((prev) =>
        prev.filter((session) => session.id !== selectedSession.id)
      );

      setShowDeleteConfirmation(false);
      closeSessionModal();
    } catch (err) {
      console.error("Error deleting session:", err);
      setError("Failed to delete session");
    } finally {
      setSaving(false);
    }
  };

  const cancelDeleteSession = () => {
    setShowDeleteConfirmation(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement du tableau de bord coach...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const weekDates = getWeekDates();
  const today = new Date();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord coach
          </h1>
          <p className="text-lg text-gray-600">
            Surveille tes coureurs et gère leurs séances d&apos;entraînement
          </p>
        </div>

        {/* Section 1: Runners Awaiting Approval */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Coureurs en attente d&apos;approbation ({runnersInProgress.length})
          </h2>
          {runnersInProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runnersInProgress.map((runner) => (
                <div
                  key={runner.id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-400 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-semibold">
                          {runner.avatar}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {runner.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {runner.program}
                        </p>
                        <p className="text-xs text-gray-500">{runner.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <div className="flex items-center text-green-700 text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        Configuration terminée
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Action requise :</strong> Approuver ce coureur
                      dans la section Coureurs
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/runners")}
                      className="w-full text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Aller aux coureurs →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                Aucun coureur en attente d&apos;approbation. Tout est à jour !
                🎉
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Weekly Calendar View */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Séances d&apos;entraînement de cette semaine
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 p-4 pb-0">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 p-4">
              {weekDates.map((date, index) => {
                const sessionsForDate = getSessionsForDate(date);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={index}
                    className={`h-56 border rounded-lg p-2 transition-colors relative ${
                      isToday
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`text-lg font-semibold ${
                          isToday ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                    {/* Training Sessions - Scrollable */}
                    <div className="space-y-1 overflow-y-auto max-h-44 scrollbar-hide">
                      {sessionsForDate.map((session) => (
                        <div
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Session clicked:", session);
                            openSessionModal(session);
                          }}
                          className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm hover:scale-105 transition-all ${getSessionColor(
                            session.session_type || "fractionne"
                          )}`}
                          title={`${session.user_name} (Click to edit)`}
                        >
                          <div className="font-medium truncate">
                            {session.user_name.split(" ")[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Planning for Next Week */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Planification de la semaine prochaine ({nextWeekSessions.length}{" "}
              séances programmées)
            </h2>
            <Link
              href="/dashboard/calendar"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Créer de nouvelles séances →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            {/* Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid for Next Week */}
            <div className="grid grid-cols-7 gap-2">
              {getNextWeekDates().map((date, index) => {
                const sessionsForDate = getNextWeekSessionsForDate(date);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={index}
                    className={`h-56 border rounded-lg p-2 transition-colors relative ${
                      isToday
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Date Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div
                        className={`text-sm font-medium ${
                          isToday ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                    {/* Training Sessions - Scrollable */}
                    <div className="space-y-1 overflow-y-auto max-h-44 scrollbar-hide">
                      {sessionsForDate.map((session) => (
                        <div
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openSessionModal(session);
                          }}
                          className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm hover:scale-105 transition-all ${getSessionColor(
                            session.session_type || "fractionne"
                          )}`}
                          title={`${session.user_name} (Click to edit)`}
                        >
                          <div className="font-medium truncate">
                            {session.user_name.split(" ")[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 ml-4"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saving Message */}
        {saving && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-700">
                  Enregistrement des modifications...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Details/Edit Modal */}
        {showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier la séance d&apos;entraînement
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
                        const newTitle = selectedSession.title.includes(":")
                          ? `${selectedSession.title.split(":")[0]}: ${
                              e.target.value
                            }`
                          : e.target.value;
                        setEditSession({
                          ...editSession,
                          type: e.target.value,
                          title: newTitle,
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* Radio Button Groups Row - Read-only for Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Session Completed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Séance terminée ?
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
                          disabled={true}
                          className="mr-2 cursor-not-allowed opacity-50"
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
                          disabled={true}
                          className="mr-2 cursor-not-allowed opacity-50"
                        />
                        Non
                      </label>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Des contraintes ?
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
                          disabled={true}
                          className="mr-2 cursor-not-allowed opacity-50"
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
                          disabled={true}
                          className="mr-2 cursor-not-allowed opacity-50"
                        />
                        Non
                      </label>
                    </div>
                  </div>
                </div>

                {/* RPE - Read-only for Admin */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPE (Taux d&apos;effort perçu)
                  </label>
                  <select
                    value={editSession.rpe}
                    onChange={(e) =>
                      setEditSession({ ...editSession, rpe: e.target.value })
                    }
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100 cursor-not-allowed opacity-50"
                  >
                    <option value="">Sélectionner</option>
                    <option value="1">1 - Très facile</option>
                    <option value="2">2 - Facile</option>
                    <option value="3">3 - Modéré</option>
                    <option value="4">4 - Assez difficile</option>
                    <option value="5">5 - Difficile</option>
                    <option value="6">6 - Très difficile</option>
                    <option value="7">7 - Extrêmement difficile</option>
                    <option value="8">8 - Intense</option>
                    <option value="9">9 - Très intense</option>
                    <option value="10">10 - Maximum</option>
                  </select>
                </div>

                {/* Comments - Read-only for Admin */}
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
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100 cursor-not-allowed opacity-50"
                    placeholder="Les commentaires du coureur apparaîtront ici"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    disabled={saving}
                    className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    )}
                    <span>{saving ? "Deleting..." : "Delete"}</span>
                  </button>

                  <div className="flex gap-3">
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
                      <span>{saving ? "Mise à jour..." : "Mettre à jour"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Supprimer la séance d&apos;entraînement
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Es-tu sûr de vouloir supprimer cette séance
                    d&apos;entraînement pour{" "}
                    <span className="font-medium">
                      {selectedSession.user_name}
                    </span>
                    ?
                    <br />
                    <span className="text-sm text-gray-500">
                      Cette action ne peut pas être annulée.
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelDeleteSession}
                    disabled={saving}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteSession}
                    disabled={saving}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{saving ? "Suppression..." : "Supprimer"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { isAdmin } = useAuth();

  // All hooks must be called before any conditional returns
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successType, setSuccessType] = useState<string | null>(null);
  const [meetingScheduled, setMeetingScheduled] = useState(false);
  const [showMeetingConfirmation, setShowMeetingConfirmation] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "profile",
      title: "Compléter ton profil",
      description:
        "Configurer tes informations personnelles et préférences de course",
      href: "/dashboard/profile",
      completed: false,
    },
    {
      id: "health-survey",
      title: "Questionnaire de santé",
      description: "Compléter le questionnaire de santé requis",
      href: "/dashboard/health-survey",
      completed: false,
    },
    {
      id: "programs",
      title: "Choisir un programme d&apos;entraînement",
      description:
        "Sélectionner et s&apos;inscrire à un programme d&apos;entraînement adapté à tes objectifs",
      href: "/dashboard/programs",
      completed: false,
    },
  ]);

  // Load completion status from localStorage and database
  const loadProgress = useCallback(async () => {
    // First load from localStorage
    const savedProgress = localStorage.getItem("dashboard-progress");
    const savedMeetingStatus = localStorage.getItem("meeting-scheduled");
    let progress: Record<string, boolean> = {};

    if (savedProgress) {
      progress = JSON.parse(savedProgress);
      setChecklist((prev) =>
        prev.map((item) => ({
          ...item,
          completed: progress[item.id] || false,
        }))
      );
    }

    if (savedMeetingStatus) {
      setMeetingScheduled(JSON.parse(savedMeetingStatus));
    }

    // Then check database for completion status and override if needed
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user) {
        // Check profile completion and approval status
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("profile_completed, is_active")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.profile_completed === true) {
          console.log("Database shows profile is completed, updating state...");
          progress.profile = true;
        }

        // Set approval status
        if (!profileError && profile) {
          setIsApproved(profile.is_active || false);
          setCheckingApproval(false);
        }

        // Check health survey completion
        const { data: healthSurvey, error: surveyError } = await supabase
          .from("health_surveys")
          .select("completed_at")
          .eq("user_id", user.id)
          .single();

        if (!surveyError && healthSurvey?.completed_at) {
          console.log(
            "Database shows health survey is completed, updating state..."
          );
          progress["health-survey"] = true;
        }

        // Check program enrollment completion
        const { data: enrollments, error: enrollmentError } = await supabase
          .from("user_program_enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (!enrollmentError && enrollments && enrollments.length > 0) {
          console.log(
            "Database shows program enrollment is completed, updating state..."
          );
          progress["programs"] = true;
        }

        // Update localStorage with all progress
        localStorage.setItem("dashboard-progress", JSON.stringify(progress));

        // Update checklist state
        setChecklist((prev) =>
          prev.map((item) => ({
            ...item,
            completed: progress[item.id] || false,
          }))
        );
      }
    } catch (error) {
      console.error("Error checking database during loadProgress:", error);
      setCheckingApproval(false);
    }
  }, [supabase]);

  // Load completion status from localStorage and database on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Check for success parameter and show success message
  useEffect(() => {
    const successParam = searchParams.get("success");
    if (
      successParam === "profile" ||
      successParam === "health-survey" ||
      successParam === "program-enrollment"
    ) {
      setSuccessType(successParam);
      setShowSuccessMessage(true);
      // Check completion status when returning from form save
      loadProgress();
      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, loadProgress]);

  // Listen for storage changes and window focus to refresh progress
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard-progress") {
        loadProgress();
      }
      if (e.key === "meeting-scheduled") {
        const meetingStatus = e.newValue ? JSON.parse(e.newValue) : false;
        setMeetingScheduled(meetingStatus);
      }
    };

    const handleWindowFocus = () => {
      loadProgress();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadProgress]);

  // Save progress to localStorage whenever checklist changes
  useEffect(() => {
    const progress = checklist.reduce((acc, item) => {
      acc[item.id] = item.completed;
      return acc;
    }, {} as Record<string, boolean>);
    localStorage.setItem("dashboard-progress", JSON.stringify(progress));
  }, [checklist]);

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Handle meeting scheduled confirmation
  const handleMeetingScheduled = () => {
    setMeetingScheduled(true);
    localStorage.setItem("meeting-scheduled", JSON.stringify(true));
    setShowMeetingConfirmation(false);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const allStepsCompleted = checklist.every((item) => item.completed);

  // If approved by coach, show weekly calendar
  if (isApproved && allStepsCompleted && !checkingApproval) {
    return <RunnerWeeklyCalendar />;
  }

  // If meeting is scheduled but not approved, show waiting for approval state
  if (meetingScheduled && !isApproved && !checkingApproval) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Waiting for Approval State */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-12 text-white mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                🎉 Super ! Rendez-vous planifié !
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Tu as complété toutes les étapes de configuration et planifié ta
                séance de coaching.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                En attente de l&apos;approbation du coach
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Luc examine ton profil et tes informations de santé. Après ton
                appel de coaching, il activera ton compte et tu auras accès à
                ton calendrier personnalisé avec les séances
                d&apos;entraînement.
              </p>

              <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Quelle est la suite ?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Ton coach examine tes informations
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">○</span>
                      Participe à ton appel de coaching programmé
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">○</span>
                      Le coach activera ton compte
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">○</span>
                      Accède à ton calendrier d&apos;entraînement personnalisé
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Ton calendrier et tes entraînements
                  personnalisés apparaîtront ici automatiquement une fois que
                  ton coach aura approuvé ton compte. Cela se produit
                  généralement pendant ou peu après ton appel de coaching.
                </p>
              </div>
            </div>

            {/* Reset option for testing */}
            <div className="text-center">
              <button
                onClick={() => {
                  setMeetingScheduled(false);
                  localStorage.removeItem("meeting-scheduled");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset meeting status (for testing)
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If meeting is scheduled AND approved, show approved state
  if (meetingScheduled && isApproved) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Waiting for Coach State */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-12 text-white mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">
                🎉 Bienvenue ! Tout est prêt !
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Ton compte a été approuvé ! Tu as maintenant un accès complet à
                ton calendrier d&apos;entraînement personnalisé et à toutes les
                fonctionnalités.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ton entraînement commence maintenant !
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Ton coach a activé ton compte ! Tu peux maintenant voir et gérer
                ton calendrier d&apos;entraînement personnalisé avec toutes tes
                séances d&apos;entraînement programmées.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Quelle est la suite ?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Le coach a examiné tes informations
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Compte activé et approuvé
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Accès au calendrier d&apos;entraînement personnalisé
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">→</span>
                      Commence tes entraînements personnalisés
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Commencer
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/dashboard/calendar"
                      className="block bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                      📅 Voir ton calendrier d&apos;entraînement
                    </Link>
                    <Link
                      href="/dashboard/videos"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Regarder les vidéos d&apos;entraînement
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Consulter ton profil
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset option for testing */}
            <div className="text-center">
              <button
                onClick={() => {
                  setMeetingScheduled(false);
                  localStorage.removeItem("meeting-scheduled");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reset meeting status (for testing)
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pour commencer
          </h1>
          <p className="text-lg text-gray-600">
            Complète ces étapes pour débloquer ton expérience
            d&apos;entraînement complète
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successType === "profile" &&
                    "🎉 Profil complété avec succès ! Ta première étape est terminée."}
                  {successType === "health-survey" &&
                    "🎉 Questionnaire de santé complété avec succès ! Une étape de plus vers ton parcours d&apos;entraînement."}
                  {successType === "program-enrollment" &&
                    "🎉 Inscription au programme réussie ! Tu es maintenant prêt à commencer ton parcours d&apos;entraînement."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                setSuccessType(null);
              }}
              className="flex-shrink-0 ml-4 text-green-400 hover:text-green-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Ta progression
            </h2>
            <span className="text-sm font-medium text-gray-600">
              {completedCount} sur {totalCount} complété
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progressPercentage === 100
              ? "🎉 Félicitations ! Tu as complété toutes les étapes de configuration !"
              : `${Math.round(progressPercentage)}% complété`}
          </p>
        </div>

        {/* Contact Coach Section - Show when all 3 steps are complete */}
        {allStepsCompleted && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  🎉 Prêt pour ta séance de coaching !
                </h2>
                <p className="text-blue-100 mb-4">
                  Parfait ! Tu as complété les 3 étapes de configuration.
                  Maintenant contacte Luc via WhatsApp pour planifier ton appel
                  de coaching personnalisé et obtenir des conseils d&apos;expert
                  adaptés à tes objectifs.
                </p>
                <div className="flex items-center text-blue-100 text-sm mb-4">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Consultation gratuite de 30 minutes</span>
                  <span className="mx-3">•</span>
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Appel vidéo via Zoom</span>
                </div>

                {/* WhatsApp Contact */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-100">
                        Contacte Coach Luc sur WhatsApp :
                      </p>
                      <p className="text-xl font-bold">+33 6 40 20 38 13</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-8 flex flex-col space-y-3">
                <a
                  href="https://wa.me/33640203813?text=Hi%20Luc!%20I've%20completed%20my%20profile%20setup%20and%20I'm%20ready%20to%20schedule%20my%20coaching%20session."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Contacter sur WhatsApp</span>
                </a>
                <button
                  onClick={() => setShowMeetingConfirmation(true)}
                  className="bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-blue-800 transition-colors"
                >
                  J&apos;ai contacté le coach
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coach Contact Confirmation Modal */}
        {showMeetingConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmer le contact avec le coach
              </h3>
              <p className="text-gray-600 mb-6">
                As-tu réussi à contacter Luc via WhatsApp pour planifier ta
                séance de coaching ?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleMeetingScheduled}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Oui, j&apos;ai contacté
                </button>
                <button
                  onClick={() => setShowMeetingConfirmation(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Pas encore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-4">
          {checklist.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 transition-all duration-300 ${
                item.completed
                  ? "border-green-500 bg-green-50"
                  : item.locked
                  ? "border-gray-300 bg-gray-50 opacity-60"
                  : "border-blue-500 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Checkbox/Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {item.completed ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : item.locked ? (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        item.completed
                          ? "text-green-900"
                          : item.locked
                          ? "text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        item.completed
                          ? "text-green-700"
                          : item.locked
                          ? "text-gray-500"
                          : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                    {item.locked && (
                      <p className="text-xs text-gray-500 mt-2">
                        Complète toutes les étapes précédentes pour débloquer
                        cette section
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 ml-4">
                  {item.completed ? (
                    <Link
                      href={item.href}
                      className="inline-flex items-center px-4 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      Voir
                    </Link>
                  ) : item.locked ? (
                    <button
                      disabled
                      className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed"
                    >
                      Verrouillé
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      Commencer
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {progressPercentage === 100 && !allStepsCompleted && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">
              🎉 Bienvenue à l&apos;entraînement LucRun !
            </h2>
            <p className="text-lg opacity-90">
              Tout est configuré et tu es prêt à commencer ton parcours de
              course. N&apos;oublie pas de planifier ton appel de coaching
              ci-dessus et d&apos;explorer ton calendrier d&apos;entraînement !
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
