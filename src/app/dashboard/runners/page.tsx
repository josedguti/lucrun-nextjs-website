"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
  program_id: number;
  enrolled_at: string;
  is_active: boolean;
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
  const [selectedRunner, setSelectedRunner] = useState<RunnerDetail | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchRunners = async () => {
      try {
        // Get all user profiles with extended information, excluding admin
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id, first_name, last_name, email, profile_completed, created_at,
            phone, date_of_birth, city, state, country,
            running_level, current_weekly_km, training_hours_per_week
          `)
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
              .select("id, completed_at, current_injuries, past_injuries, medications, health_conditions")
              .eq("user_id", profile.id)
              .single();

            // Get program enrollments
            const { data: enrollments } = await supabase
              .from("user_program_enrollments")
              .select("id, program_id, enrolled_at, is_active")
              .eq("user_id", profile.id)
              .order("enrolled_at", { ascending: false });

            // Get training sessions count
            const { data: sessions } = await supabase
              .from("training_sessions")
              .select("id, is_completed")
              .eq("user_id", profile.id);

            const sessionCount = sessions?.length || 0;
            const completedSessions = sessions?.filter(s => s.is_completed)?.length || 0;

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
    const programEnrolled = runner.programEnrollments.some(e => e.is_active);

    if (profileCompleted && healthCompleted && programEnrolled) return "Ready";
    if (profileCompleted || healthCompleted || programEnrolled) return "In Progress";
    return "Not Started";
  };

  const getActiveProgram = (runner: RunnerDetail) => {
    const activeEnrollment = runner.programEnrollments.find(e => e.is_active);
    return activeEnrollment ? `Program ${activeEnrollment.program_id}` : "Program Not Chosen";
  };

  const handleViewProfile = (runner: RunnerDetail) => {
    setSelectedRunner(runner);
    setShowDetails(true);
  };

  const handleViewCalendar = (runner: RunnerDetail) => {
    // TODO: Navigate to runner's calendar view
    console.log("View calendar for runner:", runner.profile.id);
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
            <div className="text-2xl font-bold text-gray-900">{runners.length}</div>
            <div className="text-sm text-gray-600">Total Runners</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {runners.filter(r => getRunnerStatus(r) === "Ready").length}
            </div>
            <div className="text-sm text-gray-600">Ready to Start</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {runners.filter(r => getRunnerStatus(r) === "In Progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">
              {runners.filter(r => getRunnerStatus(r) === "Not Started").length}
            </div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>

        {/* Runners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {runners.map((runner) => {
            const runnerName = runner.profile.first_name && runner.profile.last_name
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
                    <p className="text-sm text-gray-500">{runner.profile.email}</p>
                  </div>
                </div>

                {/* Program Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Program:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      programName !== "Program Not Chosen" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
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
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleViewProfile(runner)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button 
                    onClick={() => handleViewCalendar(runner)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </button>
                </div>

                {/* Join Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Joined {new Date(runner.profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {runners.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No runners yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Runners will appear here as they sign up.
            </p>
          </div>
        )}

        {/* Runner Details Modal */}
        {showDetails && selectedRunner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Runner Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>{' '}
                      {selectedRunner.profile.first_name && selectedRunner.profile.last_name
                        ? `${selectedRunner.profile.first_name} ${selectedRunner.profile.last_name}`
                        : 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>{' '}
                      {selectedRunner.profile.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>{' '}
                      {selectedRunner.profile.phone || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date of Birth:</span>{' '}
                      {selectedRunner.profile.date_of_birth || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>{' '}
                      {selectedRunner.profile.city 
                        ? `${selectedRunner.profile.city}, ${selectedRunner.profile.state}, ${selectedRunner.profile.country}`
                        : 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Joined:</span>{' '}
                      {new Date(selectedRunner.profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Running Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Running Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Running Level:</span>{' '}
                      {selectedRunner.profile.running_level || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Weekly Distance:</span>{' '}
                      {selectedRunner.profile.current_weekly_km ? `${selectedRunner.profile.current_weekly_km} km` : 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Training Hours:</span>{' '}
                      {selectedRunner.profile.training_hours_per_week ? `${selectedRunner.profile.training_hours_per_week} hours/week` : 'Not specified'}
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Training Progress</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total Sessions:</span>{' '}
                      {selectedRunner.sessionCount}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Completed Sessions:</span>{' '}
                      {selectedRunner.completedSessions}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Completion Rate:</span>{' '}
                      {selectedRunner.sessionCount > 0 
                        ? `${Math.round((selectedRunner.completedSessions / selectedRunner.sessionCount) * 100)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Health Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Health Survey</h4>
                  {selectedRunner.healthSurvey?.completed_at ? (
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Completed:</span>{' '}
                        {new Date(selectedRunner.healthSurvey.completed_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Current Injuries:</span>{' '}
                        {selectedRunner.healthSurvey.current_injuries || 'None reported'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Past Injuries:</span>{' '}
                        {selectedRunner.healthSurvey.past_injuries || 'None reported'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Medications:</span>{' '}
                        {selectedRunner.healthSurvey.medications || 'None reported'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Health Conditions:</span>{' '}
                        {selectedRunner.healthSurvey.health_conditions || 'None reported'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Health survey not completed yet</p>
                  )}
                </div>

                {/* Program Enrollments */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Program Enrollments</h4>
                  {selectedRunner.programEnrollments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRunner.programEnrollments.map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium">Program ID:</span> {enrollment.program_id}
                          </div>
                          <div className="text-sm text-gray-600">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            enrollment.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No program enrollments yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}