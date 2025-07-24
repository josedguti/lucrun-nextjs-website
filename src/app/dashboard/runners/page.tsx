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
        // Get all user profiles with extended information
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id, first_name, last_name, email, profile_completed, created_at,
            phone, date_of_birth, city, state, country,
            running_level, current_weekly_km, training_hours_per_week
          `)
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

        // For each profile, fetch health survey and program enrollments
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

            return {
              profile,
              healthSurvey: healthSurvey || null,
              programEnrollments: enrollments || [],
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

  const handleViewDetails = (runner: RunnerDetail) => {
    setSelectedRunner(runner);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
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

        {/* Runners List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Runners</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Runner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Running Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {runners.map((runner) => (
                  <tr key={runner.profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {runner.profile.first_name 
                              ? runner.profile.first_name.charAt(0).toUpperCase()
                              : runner.profile.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {runner.profile.first_name && runner.profile.last_name
                              ? `${runner.profile.first_name} ${runner.profile.last_name}`
                              : runner.profile.first_name || runner.profile.email?.split('@')[0] || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">{runner.profile.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {runner.profile.phone || 'No phone'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {runner.profile.city ? `${runner.profile.city}, ${runner.profile.state}` : 'No location'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {runner.profile.running_level || 'Not specified'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {runner.profile.current_weekly_km ? `${runner.profile.current_weekly_km}km/week` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getRunnerStatus(runner) === "Ready"
                          ? 'bg-green-100 text-green-800'
                          : getRunnerStatus(runner) === "In Progress"
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getRunnerStatus(runner)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(runner.profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(runner)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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