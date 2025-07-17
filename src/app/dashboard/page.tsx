"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PopupButton } from "react-calendly";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  locked?: boolean;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
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
                Fantastic! You've completed all setup steps and scheduled your
                coaching session.
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
                    What's Next?
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
                    "🎉 Program enrollment successful! You're now ready to start your training journey."}
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
              ? "🎉 Congratulations! You've completed all setup steps!"
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
                  I've Already Scheduled
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
                  Yes, I've Scheduled
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
