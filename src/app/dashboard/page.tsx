"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PopupButton } from "react-calendly";
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
}

function AdminDashboard() {
  const [runnersInProgress, setRunnersInProgress] = useState<RunnerTile[]>([]);
  const [weekSessions, setWeekSessions] = useState<TrainingSession[]>([]);
  const [nextWeekSessions, setNextWeekSessions] = useState<TrainingSession[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

        // 1. Fetch runners in progress (incomplete profiles)
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id, first_name, last_name, email, profile_completed, created_at
          `
          )
          .neq("email", "luc.run.coach@gmail.com")
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

          const programName = 
            Array.isArray(enrollments?.[0]?.training_programs) 
              ? (enrollments[0].training_programs as { title: string }[])[0]?.title || "No Program"
              : (enrollments?.[0]?.training_programs as unknown as { title: string })?.title || "No Program";
          const avatar = profile.first_name
            ? profile.first_name[0].toUpperCase()
            : profile.email?.[0].toUpperCase() || "U";

          // If not fully complete, add to in-progress
          if (!profileCompleted || !healthCompleted || !programEnrolled) {
            const completionSteps = [];
            if (!profileCompleted) completionSteps.push("Profile");
            if (!healthCompleted) completionSteps.push("Health Survey");
            if (!programEnrolled) completionSteps.push("Program Selection");

            runnersProgressData.push({
              id: profile.id,
              name: runnerName,
              email: profile.email || "",
              program: programName,
              avatar,
              status: "in-progress",
              completionSteps,
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
            profiles(first_name, last_name, email)
          `
          )
          .gte("session_date", currentWeekStart.toISOString().split("T")[0])
          .lte("session_date", currentWeekEnd.toISOString().split("T")[0])
          .order("session_date", { ascending: true });

        if (weekError) throw weekError;

        // 3. Fetch next week sessions for planning
        const { data: nextWeekSessionsData, error: nextWeekError } =
          await supabase
            .from("training_sessions")
            .select(
              `
            id, title, user_id, session_date, session_time, session_type, is_completed,
            profiles(first_name, last_name, email)
          `
            )
            .gte("session_date", nextWeekStart.toISOString().split("T")[0])
            .lte("session_date", nextWeekEnd.toISOString().split("T")[0])
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
            user_name: (() => {
              // Handle both array and object cases for profiles
              const profile = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles;
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

  // Helper function to get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return weekSessions.filter(
      (session) => session.session_date === dateString
    );
  };

  // Session type colors (matching calendar page)
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading coach dashboard...</p>
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
            Coach Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor your runners and manage their training sessions
          </p>
        </div>

        {/* Section 1: Runners In Progress */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Runners Completing Their Profile ({runnersInProgress.length})
          </h2>
          {runnersInProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runnersInProgress.map((runner) => (
                <div
                  key={runner.id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-700 font-semibold">
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
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Pending:</p>
                    <div className="flex flex-wrap gap-1">
                      {runner.completionSteps?.map((step) => (
                        <span
                          key={step}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                All runners have completed their setup! 🎉
              </p>
            </div>
          )}
        </section>


        {/* Section 2: Weekly Calendar View */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            This Week&apos;s Training Sessions
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 p-4 pb-0">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-gray-600"
                >
                  {day.slice(0, 3)}
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
                    className={`h-32 border rounded-lg p-2 transition-colors relative ${
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
                    {/* Training Sessions */}
                    <div className="space-y-1">
                      {sessionsForDate.slice(0, 2).map((session) => (
                        <div
                          key={session.id}
                          className={`text-xs px-1 py-0.5 rounded border truncate ${getSessionColor(
                            session.session_type || "recovery"
                          )}`}
                          title={`${session.user_name}: ${session.title} - ${session.session_time || ""}`}
                        >
                          {session.user_name.split(" ")[0]}
                        </div>
                      ))}
                      {sessionsForDate.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{sessionsForDate.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Planning for Next Week */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Planning for Next Week ({nextWeekSessions.length} sessions
            scheduled)
          </h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">Upcoming Sessions</h3>
                <Link
                  href="/dashboard/calendar"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create New Sessions →
                </Link>
              </div>
            </div>
            {nextWeekSessions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {nextWeekSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {session.user_name}
                        </h4>
                        <p className="text-sm text-gray-600">{session.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.session_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.session_time || "08:00"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {nextWeekSessions.length > 5 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    And {nextWeekSessions.length - 5} more sessions...
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  No sessions planned for next week yet
                </p>
                <Link
                  href="/dashboard/calendar"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Sessions
                </Link>
              </div>
            )}
          </div>
        </section>
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Set up your personal information and running preferences",
      href: "/dashboard/profile",
      completed: false,
    },
    {
      id: "health-survey",
      title: "Health Survey",
      description: "Complete the required health questionnaire",
      href: "/dashboard/health-survey",
      completed: false,
    },
    {
      id: "programs",
      title: "Choose Training Program",
      description:
        "Select and enroll in a training program that fits your goals",
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
        // Check profile completion
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.profile_completed === true) {
          console.log("Database shows profile is completed, updating state...");
          progress.profile = true;
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

  // If meeting is scheduled, show waiting state
  if (meetingScheduled) {
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
                🎉 Setup Complete & Meeting Scheduled!
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Fantastic! You&apos;ve completed all setup steps and scheduled
                your coaching session.
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
                Waiting for Your Coach
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Luc will review your profile and health information before your
                scheduled call. After your coaching session, personalized
                workout sessions will be added to your calendar.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    What&apos;s Next?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Your coach will review your information
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Attend your scheduled coaching call
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">○</span>
                      Receive personalized training plan
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">○</span>
                      Start your customized workouts
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    In the Meantime
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/dashboard/videos"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Watch training videos
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Review your profile
                    </Link>
                    <Link
                      href="/dashboard/calendar"
                      className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      → Check your calendar
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
            Getting Started
          </h1>
          <p className="text-lg text-gray-600">
            Complete these steps to unlock your full training experience
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
                    "🎉 Profile completed successfully! Your first step is now complete."}
                  {successType === "health-survey" &&
                    "🎉 Health survey completed successfully! Another step towards your training journey."}
                  {successType === "program-enrollment" &&
                    "🎉 Program enrollment successful! You&apos;re now ready to start your training journey."}
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
              Your Progress
            </h2>
            <span className="text-sm font-medium text-gray-600">
              {completedCount} of {totalCount} completed
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
              ? "🎉 Congratulations! You&apos;ve completed all setup steps!"
              : `${Math.round(progressPercentage)}% complete`}
          </p>
        </div>

        {/* Schedule Meeting Section - Show when all 3 steps are complete */}
        {allStepsCompleted && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  🎉 Ready for Your Coaching Session!
                </h2>
                <p className="text-blue-100 mb-4">
                  Perfect! You&apos;ve completed all 3 setup steps. Now schedule
                  a personalized call with Luc, your running coach, to get
                  expert guidance tailored to your goals.
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
                  <span>30-minute free consultation</span>
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
                  <span>Video call via Zoom</span>
                </div>
              </div>
              <div className="ml-8 flex flex-col space-y-3">
                <PopupButton
                  url="https://calendly.com/luc-run-coach"
                  rootElement={
                    (typeof document !== "undefined"
                      ? document.getElementById("__next") || document.body
                      : undefined) as HTMLElement
                  }
                  text="Schedule Your Meeting"
                  className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                />
                <button
                  onClick={() => setShowMeetingConfirmation(true)}
                  className="bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-blue-800 transition-colors"
                >
                  I&apos;ve Already Scheduled
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Confirmation Modal */}
        {showMeetingConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Meeting Scheduled
              </h3>
              <p className="text-gray-600 mb-6">
                Have you successfully scheduled your coaching session with Luc
                through Calendly?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleMeetingScheduled}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Yes, I&apos;ve Scheduled
                </button>
                <button
                  onClick={() => setShowMeetingConfirmation(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Not Yet
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
                        Complete all previous steps to unlock this section
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
                      View
                    </Link>
                  ) : item.locked ? (
                    <button
                      disabled
                      className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed"
                    >
                      Locked
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      Start
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
              🎉 Welcome to LucRun Training!
            </h2>
            <p className="text-lg opacity-90">
              You&apos;re all set up and ready to start your running journey.
              Don&apos;t forget to schedule your coaching call above and explore
              your training calendar!
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
