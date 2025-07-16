"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  locked?: boolean;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
    {
      id: "calendar",
      title: "Set Up Training Schedule",
      description: "Create your first training session in the calendar",
      href: "/dashboard/calendar",
      completed: false,
    },
    {
      id: "videos",
      title: "Unlock Training Videos",
      description: "Access exclusive training content and video library",
      href: "/dashboard/videos",
      completed: false,
      locked: true,
    },
  ]);

  // Load completion status from localStorage
  const loadProgress = () => {
    const savedProgress = localStorage.getItem("dashboard-progress");
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setChecklist((prev) =>
        prev.map((item) => ({
          ...item,
          completed: progress[item.id] || false,
        }))
      );
    }
  };

  // Load completion status from localStorage on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Check for success parameter and show success message
  useEffect(() => {
    const successType = searchParams.get("success");
    if (successType === "profile") {
      setShowSuccessMessage(true);
      // Auto-hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Listen for storage changes and window focus to refresh progress
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard-progress") {
        loadProgress();
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
  }, []);

  // Save progress to localStorage whenever checklist changes
  useEffect(() => {
    const progress = checklist.reduce((acc, item) => {
      acc[item.id] = item.completed;
      return acc;
    }, {} as Record<string, boolean>);
    localStorage.setItem("dashboard-progress", JSON.stringify(progress));
  }, [checklist]);

  // Check if videos should be unlocked (separate effect with specific dependencies)
  useEffect(() => {
    const mainTasksCompleted = checklist
      .filter((item) => item.id !== "videos")
      .every((item) => item.completed);

    const videosItem = checklist.find((item) => item.id === "videos");
    if (videosItem && videosItem.locked === mainTasksCompleted) {
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === "videos" ? { ...item, locked: !mainTasksCompleted } : item
        )
      );
    }
  }, [
    checklist
      .filter((item) => item.id !== "videos")
      .map((item) => item.completed),
  ]);

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = (completedCount / totalCount) * 100;

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
                  🎉 Profile completed successfully! Your first step is now
                  complete.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
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
        {progressPercentage === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">
              🎉 Welcome to LucRun Training!
            </h2>
            <p className="text-lg opacity-90">
              You're all set up and ready to start your running journey. Explore
              your dashboard and begin training!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
