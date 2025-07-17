"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Programs() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);
  const [userEnrollments, setUserEnrollments] = useState<string[]>([]);

  const programs = [
    {
      id: "beginner",
      title: "Beginner",
      subtitle: "Start your running journey",
      duration: "8 weeks",
      frequency: "3 days/week",
      price: "$49/month",
      description:
        "Perfect for new runners. Learn proper technique and build endurance safely.",
      features: [
        "Walk-run intervals",
        "Basic running form",
        "Injury prevention",
        "Progress tracking",
      ],
      color: "green",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: "5k-10k",
      title: "5K to 10K",
      subtitle: "Build your distance",
      duration: "10 weeks",
      frequency: "4 days/week",
      price: "$59/month",
      description:
        "Progress from 5K to 10K with structured training and speed work.",
      features: [
        "Distance progression",
        "Speed intervals",
        "Race preparation",
        "Pacing strategies",
      ],
      color: "blue",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: "semi-marathon",
      title: "Semi-Marathon",
      subtitle: "Half marathon training",
      duration: "12 weeks",
      frequency: "4-5 days/week",
      price: "$69/month",
      description:
        "Train for your first or improve your half marathon performance.",
      features: [
        "Long run progression",
        "Tempo training",
        "Race nutrition",
        "Mental preparation",
      ],
      color: "purple",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      id: "marathon",
      title: "Special Marathon",
      subtitle: "Full marathon mastery",
      duration: "16 weeks",
      frequency: "5-6 days/week",
      price: "$89/month",
      description:
        "Comprehensive marathon training for serious runners seeking excellence.",
      features: [
        "Periodized training",
        "Advanced nutrition",
        "Recovery protocols",
        "Race strategy",
      ],
      color: "red",
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
    },
    {
      id: "trail-running",
      title: "Trail Running",
      subtitle: "Off-road adventures",
      duration: "12 weeks",
      frequency: "4 days/week",
      price: "$75/month",
      description:
        "Master trail running techniques, terrain navigation, and outdoor endurance.",
      features: [
        "Terrain techniques",
        "Hill training",
        "Equipment guidance",
        "Safety protocols",
      ],
      color: "emerald",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      id: "ultra-trail",
      title: "Ultra Trail Running",
      subtitle: "Extreme endurance",
      duration: "20 weeks",
      frequency: "5-6 days/week",
      price: "$129/month",
      description:
        "Elite ultra-trail training for multi-hour mountain adventures and races.",
      features: [
        "Ultra endurance",
        "Mountain techniques",
        "Nutrition strategies",
        "Mental toughness",
      ],
      color: "indigo",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
  ];

  // Load existing program enrollments on component mount
  useEffect(() => {
    async function loadEnrollments() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Get user's active program enrollments
        const { data: enrollments, error: enrollmentError } = await supabase
          .from("user_program_enrollments")
          .select(
            `
            program_id,
            is_active,
            training_programs(program_type)
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (enrollmentError) {
          console.error("Error loading enrollments:", enrollmentError);
          throw enrollmentError;
        }

        if (enrollments && enrollments.length > 0) {
          setHasActiveEnrollment(true);
          setUserEnrollments(enrollments.map((e) => e.program_id));
        }
      } catch (err) {
        console.error("Error loading enrollments:", err);
        setError("Failed to load program enrollments");
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, [router, supabase]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "text-green-600",
          button: "bg-green-600 hover:bg-green-700",
          accent: "bg-green-100",
        };
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
          accent: "bg-blue-100",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-800",
          icon: "text-purple-600",
          button: "bg-purple-600 hover:bg-purple-700",
          accent: "bg-purple-100",
        };
      case "red":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
          accent: "bg-red-100",
        };
      case "emerald":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-800",
          icon: "text-emerald-600",
          button: "bg-emerald-600 hover:bg-emerald-700",
          accent: "bg-emerald-100",
        };
      case "indigo":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          text: "text-indigo-800",
          icon: "text-indigo-600",
          button: "bg-indigo-600 hover:bg-indigo-700",
          accent: "bg-indigo-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "text-gray-600",
          button: "bg-gray-600 hover:bg-gray-700",
          accent: "bg-gray-100",
        };
    }
  };

  const handleEnrollClick = async (programId: string) => {
    try {
      setEnrolling(programId);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // First, get the actual program ID from the training_programs table
      const { data: program, error: programError } = await supabase
        .from("training_programs")
        .select("id")
        .eq("program_type", programId)
        .single();

      if (programError) {
        console.error("Error finding program:", programError);
        throw new Error("Program not found");
      }

      // Create enrollment record
      const enrollmentData = {
        user_id: user.id,
        program_id: program.id,
        is_active: true,
        progress_percentage: 0,
      };

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("user_program_enrollments")
        .insert(enrollmentData)
        .select();

      if (enrollmentError) {
        console.error("Error creating enrollment:", enrollmentError);
        throw new Error(
          `Failed to enroll in program: ${enrollmentError.message}`
        );
      }

      console.log("Successfully enrolled in program:", enrollment);

      // Redirect to dashboard with success indication
      router.push("/dashboard?success=program-enrollment");
    } catch (err) {
      console.error("Error enrolling in program:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Training Programs
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Training Programs
          </h1>
          <p className="text-lg text-gray-600">
            Choose the program that matches your current fitness level and
            running goals.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {hasActiveEnrollment && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                <h3 className="text-sm font-medium text-green-800">
                  Program Enrollment Complete
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You are currently enrolled in a training program. You can view
                  your progress in the calendar section.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {programs.map((program) => {
            const colors = getColorClasses(program.color);
            return (
              <div
                key={program.id}
                className={`${colors.bg} ${colors.border} border rounded-xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className={`${colors.accent} p-3 rounded-lg mr-4`}>
                    <div className={colors.icon}>{program.icon}</div>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${colors.text}`}>
                      {program.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{program.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                  {program.description}
                </p>

                {/* Enroll Button */}
                <button
                  onClick={() => handleEnrollClick(program.id)}
                  disabled={hasActiveEnrollment || enrolling === program.id}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 ${
                    hasActiveEnrollment || enrolling === program.id
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : `${colors.button} text-white`
                  }`}
                >
                  {enrolling === program.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {enrolling === program.id
                      ? "Enrolling..."
                      : hasActiveEnrollment
                      ? "Already Enrolled"
                      : "Start This Program"}
                  </span>
                </button>

                {/* Background Decoration */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 ${colors.accent} rounded-full opacity-20 transform translate-x-10 -translate-y-10`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
