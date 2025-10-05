"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface RunnerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_completed: boolean;
  created_at: string;
  phone: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  running_level: string | null;
  current_weekly_km: string | null;
  training_hours_per_week: string | null;
  is_active: boolean;
}

interface HealthSurvey {
  id: string;
  completed_at: string | null;
  current_injuries: string | null;
  past_injuries: string | null;
  medications: string | null;
  health_conditions: string | null;
}

interface ProgramEnrollment {
  id: string;
  program_id: string;
  enrolled_at: string;
  is_active: boolean;
  training_programs?: {
    title: string;
    program_type: string;
  };
}

interface RunnerDetail {
  profile: RunnerProfile;
  healthSurvey: HealthSurvey | null;
  programEnrollments: ProgramEnrollment[];
  sessionCount: number;
  completedSessions: number;
}

export default function RunnersPage() {
  const [runners, setRunners] = useState<RunnerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchRunners = async () => {
      try {
        // Get all user profiles with extended information, excluding admin
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id, first_name, last_name, email, profile_completed, created_at,
            phone, date_of_birth, city, state, country,
            running_level, current_weekly_km, training_hours_per_week, is_active
          `
          )
          .neq("email", "luc.run.coach@gmail.com")
          .order("created_at", { ascending: false });

        if (profileError) {
          console.error("Error fetching profiles:", profileError);
          setLoading(false);
          return;
        }

        if (!profiles) {
          setLoading(false);
          return;
        }

        // For each profile, fetch health survey, program enrollments, and sessions
        const runnersWithDetails = await Promise.all(
          profiles.map(async (profile) => {
            // Get health survey
            const { data: healthSurvey } = await supabase
              .from("health_surveys")
              .select(
                "id, completed_at, current_injuries, past_injuries, medications, health_conditions"
              )
              .eq("user_id", profile.id)
              .single();

            // Get program enrollments with program details
            const { data: enrollments } = await supabase
              .from("user_program_enrollments")
              .select(
                `
                id, 
                program_id, 
                enrolled_at, 
                is_active,
                training_programs(title, program_type)
              `
              )
              .eq("user_id", profile.id)
              .order("enrolled_at", { ascending: false });

            // Get training sessions count
            const { data: sessions } = await supabase
              .from("training_sessions")
              .select("id, is_completed")
              .eq("user_id", profile.id);

            const sessionCount = sessions?.length || 0;
            const completedSessions =
              sessions?.filter((s) => s.is_completed)?.length || 0;

            return {
              profile,
              healthSurvey: healthSurvey || null,
              programEnrollments: enrollments || [],
              sessionCount,
              completedSessions,
            };
          })
        );

        setRunners(runnersWithDetails);
      } catch (error) {
        console.error("Error in fetchRunners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRunners();
  }, [supabase]);

  const getRunnerStatus = (runner: RunnerDetail) => {
    const profileCompleted = runner.profile.profile_completed;
    const healthCompleted = !!runner.healthSurvey?.completed_at;
    const programEnrolled = runner.programEnrollments.some((e) => e.is_active);

    if (profileCompleted && healthCompleted && programEnrolled) return "Ready";
    if (profileCompleted || healthCompleted || programEnrolled)
      return "In Progress";
    return "Not Started";
  };

  const getActiveProgram = (runner: RunnerDetail) => {
    const activeEnrollment = runner.programEnrollments.find((e) => e.is_active);
    return activeEnrollment?.training_programs?.title || "Program Not Chosen";
  };

  const handleViewProfile = (runner: RunnerDetail) => {
    router.push(`/dashboard/profile?userId=${runner.profile.id}`);
  };

  const handleViewCalendar = (runner: RunnerDetail) => {
    // Navigate to calendar page with runner filter
    router.push(`/dashboard/calendar?runner=${runner.profile.id}`);
  };

  const handleViewHealthSurvey = (runner: RunnerDetail) => {
    // Navigate to health survey page with user ID parameter
    router.push(`/dashboard/health-survey?userId=${runner.profile.id}`);
  };

  const handleToggleApproval = async (runner: RunnerDetail) => {
    const newActiveStatus = !runner.profile.is_active;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newActiveStatus })
        .eq("id", runner.profile.id);

      if (error) {
        console.error("Error updating approval status:", error);
        alert("Failed to update approval status. Please try again.");
        return;
      }

      // Update local state
      setRunners((prevRunners) =>
        prevRunners.map((r) =>
          r.profile.id === runner.profile.id
            ? { ...r, profile: { ...r.profile, is_active: newActiveStatus } }
            : r
        )
      );
    } catch (err) {
      console.error("Error toggling approval:", err);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading runners...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Runners
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all registered runners
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">
              {runners.length}
            </div>
            <div className="text-sm text-gray-600">Total Runners</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {runners.filter((r) => r.profile.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Approved & Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {runners.filter((r) => !r.profile.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {runners.filter((r) => getRunnerStatus(r) === "Ready").length}
            </div>
            <div className="text-sm text-gray-600">Setup Complete</div>
          </div>
        </div>

        {/* Runners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {runners.map((runner) => {
            const runnerName =
              runner.profile.first_name && runner.profile.last_name
                ? `${runner.profile.first_name} ${runner.profile.last_name}`
                : runner.profile.first_name ||
                  runner.profile.email?.split("@")[0] ||
                  "Unknown User";

            const programName = getActiveProgram(runner);

            return (
              <div
                key={runner.profile.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200"
              >
                {/* Runner Avatar and Name */}
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {runner.profile.first_name
                          ? runner.profile.first_name[0].toUpperCase()
                          : runner.profile.email?.[0].toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {runnerName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {runner.profile.email}
                    </p>
                  </div>
                </div>

                {/* Program Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Program:
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        programName !== "Program Not Chosen"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {programName}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {runner.sessionCount}
                    </div>
                    <div className="text-xs text-gray-500">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {runner.completedSessions}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleViewProfile(runner)}
                    className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
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
                    Profile
                  </button>
                  <button
                    onClick={() => handleViewCalendar(runner)}
                    className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                      />
                    </svg>
                    Calendar
                  </button>
                  <button
                    onClick={() => handleViewHealthSurvey(runner)}
                    className="bg-green-100 text-green-800 border border-green-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Health
                  </button>
                </div>

                {/* Approval Toggle */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Approved:
                    </span>
                    <button
                      onClick={() => handleToggleApproval(runner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        runner.profile.is_active
                          ? "bg-green-600"
                          : "bg-gray-300"
                      }`}
                      title={
                        runner.profile.is_active
                          ? "Click to revoke approval"
                          : "Click to approve runner"
                      }
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          runner.profile.is_active
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  {runner.profile.is_active && (
                    <p className="text-xs text-green-600 mt-2 text-center">
                      ✓ Active - Can view calendar
                    </p>
                  )}
                  {!runner.profile.is_active && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Pending approval
                    </p>
                  )}
                </div>

                {/* Join Date */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Joined{" "}
                    {new Date(runner.profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {runners.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No runners yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Runners will appear here as they sign up.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
