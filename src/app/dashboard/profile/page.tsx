"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Profile() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    stravaAccount: "",
    garminAccount: "",
    trainingDays: [] as string[],
    equipment: [] as string[],
    hasInjury: "",
    injuryDetails: "",
    hasPastInjury: "",
    pastInjuryDetails: "",
    hasSmartwatch: "",
    smartwatchType: "",
    // Running Information
    trainingHoursPerWeek: "",
    runningLevel: "",
    currentWeeklyKm: "",
    longestDistance: "",
    recent5kTime: "",
    recent10kTime: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const equipmentOptions = [
    "Treadmill",
    "Elliptical",
    "Stationary Bike",
    "Rowing Machine",
    "Free Weights",
    "Resistance Bands",
    "Kettlebells",
    "Pull-up Bar",
    "Yoga Mat",
    "Foam Roller",
    "Medicine Ball",
    "Stability Ball",
    "TRX Suspension Trainer",
    "Jump Rope",
  ];

  const smartwatchTypes = [
    "Apple Watch",
    "Garmin",
    "Fitbit",
    "Samsung Galaxy Watch",
    "Polar",
    "Suunto",
    "Other",
  ];

  const runningLevels = [
    "Beginner (Just starting out)",
    "Recreational (Running for fun/fitness)",
    "Intermediate (Regular runner with some experience)",
    "Advanced (Experienced with race goals)",
    "Elite/Competitive (High performance athlete)",
  ];

  // Load profile data from Supabase on component mount
  useEffect(() => {
    async function loadProfile() {
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

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profile) {
          setFormData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            dateOfBirth: profile.date_of_birth || "",
            street: profile.street || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zip_code || "",
            country: profile.country || "",
            stravaAccount: profile.strava_account || "",
            garminAccount: profile.garmin_account || "",
            trainingDays: profile.training_days || [],
            equipment: profile.equipment || [],
            hasInjury:
              profile.has_injury === true
                ? "yes"
                : profile.has_injury === false
                ? "no"
                : "",
            injuryDetails: profile.injury_details || "",
            hasPastInjury:
              profile.has_past_injury === true
                ? "yes"
                : profile.has_past_injury === false
                ? "no"
                : "",
            pastInjuryDetails: profile.past_injury_details || "",
            hasSmartwatch:
              profile.has_smartwatch === true
                ? "yes"
                : profile.has_smartwatch === false
                ? "no"
                : "",
            smartwatchType: profile.smartwatch_type || "",
            trainingHoursPerWeek: profile.training_hours_per_week || "",
            runningLevel: profile.running_level || "",
            currentWeeklyKm: profile.current_weekly_km || "",
            longestDistance: profile.longest_distance || "",
            recent5kTime: profile.recent_5k_time || "",
            recent10kTime: profile.recent_10k_time || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    field: "trainingDays" | "equipment",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation is handled by the disabled button state
    if (!isFormValid()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Test if we can access the database
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: testData, error: testError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (testError) {
        console.error("Database connection test failed:", testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user) {
        console.log("No user found, redirecting to login");
        router.push("/login");
        return;
      }

      // Prepare the profile data for database - only include valid profile fields
      const profileData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        street: formData.street.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zip_code: formData.zipCode.trim() || null,
        country: formData.country.trim() || null,
        strava_account: formData.stravaAccount.trim() || null,
        garmin_account: formData.garminAccount.trim() || null,
        training_days: formData.trainingDays,
        equipment: formData.equipment,
        has_injury: formData.hasInjury === "yes",
        injury_details: formData.injuryDetails.trim() || null,
        has_past_injury: formData.hasPastInjury === "yes",
        past_injury_details: formData.pastInjuryDetails.trim() || null,
        has_smartwatch: formData.hasSmartwatch === "yes",
        smartwatch_type: formData.smartwatchType.trim() || null,
        training_hours_per_week: formData.trainingHoursPerWeek.trim(),
        running_level: formData.runningLevel.trim(),
        current_weekly_km: formData.currentWeeklyKm.trim(),
        longest_distance: formData.longestDistance.trim(),
        recent_5k_time: formData.recent5kTime.trim() || null,
        recent_10k_time: formData.recent10kTime.trim() || null,
        profile_completed: true,
      };

      // Clean the data to ensure no undefined values
      Object.keys(profileData).forEach((key) => {
        if (profileData[key as keyof typeof profileData] === undefined) {
          (profileData as Record<string, unknown>)[key] = null;
        }
      });

      // Save profile data to Supabase
      console.log("Attempting to save profile data:", profileData);

      const { data: profileResult, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profileData,
        });

      if (profileError) {
        console.error("Profile save error:", profileError);
        console.error("Profile data that failed:", profileData);
        throw new Error(`Failed to save profile: ${profileError.message}`);
      }

      console.log("Profile saved successfully:", profileResult);

      // Update dashboard progress (skip if table doesn't exist)
      try {
        const { error: progressError } = await supabase
          .from("dashboard_progress")
          .upsert({
            user_id: user.id,
            profile_completed: true,
          });

        if (progressError) {
          console.warn(
            "Dashboard progress update failed (table might not exist):",
            progressError
          );
        }
      } catch (progressErr) {
        console.warn("Dashboard progress update skipped:", progressErr);
      }

      console.log("Profile completed and saved:", profileData);

      // Redirect to dashboard with success indication
      router.push("/dashboard?success=profile");
    } catch (err) {
      console.error("Error saving profile:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Check if all mandatory fields are filled
  const isFormValid = () => {
    const mandatoryFields = [
      formData.firstName.trim(),
      formData.lastName.trim(),
      formData.email.trim(),
      formData.phone.trim(),
      formData.dateOfBirth.trim(),
      formData.street.trim(),
      formData.city.trim(),
      formData.state.trim(),
      formData.zipCode.trim(),
      formData.country.trim(),
      formData.trainingDays.length > 0,
      formData.trainingHoursPerWeek.trim(),
      formData.runningLevel.trim(),
      formData.currentWeeklyKm.trim(),
      formData.longestDistance.trim(),
      formData.hasInjury.trim(),
      formData.hasPastInjury.trim(),
      formData.hasSmartwatch.trim(),
    ];

    return mandatoryFields.every((field) => field);
  };

  const handleCancel = () => {
    // Reset form or navigate away
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      stravaAccount: "",
      garminAccount: "",
      trainingDays: [],
      equipment: [],
      hasInjury: "",
      injuryDetails: "",
      hasPastInjury: "",
      pastInjuryDetails: "",
      hasSmartwatch: "",
      smartwatchType: "",
      // Running Information
      trainingHoursPerWeek: "",
      runningLevel: "",
      currentWeeklyKm: "",
      longestDistance: "",
      recent5kTime: "",
      recent10kTime: "",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Profile Settings
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Profile Settings
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Address <span className="text-red-500">*</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ZIP/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Connected Accounts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="stravaAccount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Strava Account
                </label>
                <input
                  type="text"
                  id="stravaAccount"
                  name="stravaAccount"
                  placeholder="Strava username or email"
                  value={formData.stravaAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="garminAccount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Garmin Account
                </label>
                <input
                  type="text"
                  id="garminAccount"
                  name="garminAccount"
                  placeholder="Garmin username or email"
                  value={formData.garminAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Training Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Training Schedule
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What days of the week can you train?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trainingDays.includes(day)}
                      onChange={() => handleCheckboxChange("trainingDays", day)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Running Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Running Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="trainingHoursPerWeek"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  How many hours a week can you dedicate to training?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="trainingHoursPerWeek"
                  name="trainingHoursPerWeek"
                  required
                  value={formData.trainingHoursPerWeek}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                >
                  <option value="">Select hours per week</option>
                  <option value="1-2">1-2 hours</option>
                  <option value="3-4">3-4 hours</option>
                  <option value="5-6">5-6 hours</option>
                  <option value="7-8">7-8 hours</option>
                  <option value="9-10">9-10 hours</option>
                  <option value="11+">11+ hours</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="runningLevel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  What is your running level?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="runningLevel"
                  name="runningLevel"
                  required
                  value={formData.runningLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                >
                  <option value="">Select your running level</option>
                  {runningLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="currentWeeklyKm"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  How many kilometers do you run per week currently?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="currentWeeklyKm"
                  name="currentWeeklyKm"
                  required
                  value={formData.currentWeeklyKm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                >
                  <option value="">Select weekly kilometers</option>
                  <option value="0-5">0-5 km</option>
                  <option value="6-15">6-15 km</option>
                  <option value="16-25">16-25 km</option>
                  <option value="26-40">26-40 km</option>
                  <option value="41-60">41-60 km</option>
                  <option value="61-80">61-80 km</option>
                  <option value="81+">81+ km</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="longestDistance"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  What is the longest distance you have run?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="longestDistance"
                  name="longestDistance"
                  required
                  value={formData.longestDistance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                >
                  <option value="">Select longest distance</option>
                  <option value="Less than 5K">Less than 5K</option>
                  <option value="5K">5K</option>
                  <option value="10K">10K</option>
                  <option value="15K">15K</option>
                  <option value="Half Marathon (21K)">
                    Half Marathon (21K)
                  </option>
                  <option value="Marathon (42K)">Marathon (42K)</option>
                  <option value="Ultra Marathon (50K+)">
                    Ultra Marathon (50K+)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="recent5kTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Recent time on 5K (optional)
                </label>
                <input
                  type="text"
                  id="recent5kTime"
                  name="recent5kTime"
                  placeholder="e.g., 25:30 (MM:SS)"
                  value={formData.recent5kTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="recent10kTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Recent time on 10K (optional)
                </label>
                <input
                  type="text"
                  id="recent10kTime"
                  name="recent10kTime"
                  placeholder="e.g., 55:00 (MM:SS)"
                  value={formData.recent10kTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Training Equipment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Training Equipment
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What equipment do you have access to for training?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentOptions.map((equipment) => (
                  <label key={equipment} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() =>
                        handleCheckboxChange("equipment", equipment)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {equipment}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Health Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Do you currently have any injuries?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasInjury"
                      value="yes"
                      checked={formData.hasInjury === "yes"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasInjury"
                      value="no"
                      checked={formData.hasInjury === "no"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.hasInjury === "yes" && (
                <div>
                  <label
                    htmlFor="injuryDetails"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Please describe your injury/injuries
                  </label>
                  <textarea
                    id="injuryDetails"
                    name="injuryDetails"
                    rows={3}
                    value={formData.injuryDetails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    placeholder="Describe your current injuries, their severity, and any limitations they cause..."
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Did you have any significant injuries in the past?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasPastInjury"
                      value="yes"
                      checked={formData.hasPastInjury === "yes"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasPastInjury"
                      value="no"
                      checked={formData.hasPastInjury === "no"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.hasPastInjury === "yes" && (
                <div>
                  <label
                    htmlFor="pastInjuryDetails"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Please describe your past injury/injuries
                  </label>
                  <textarea
                    id="pastInjuryDetails"
                    name="pastInjuryDetails"
                    rows={3}
                    value={formData.pastInjuryDetails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    placeholder="Describe your past injuries, when they occurred, and if they still affect you..."
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Smartwatch Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Device Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Do you have a smartwatch?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasSmartwatch"
                      value="yes"
                      checked={formData.hasSmartwatch === "yes"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasSmartwatch"
                      value="no"
                      checked={formData.hasSmartwatch === "no"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {formData.hasSmartwatch === "yes" && (
                <div>
                  <label
                    htmlFor="smartwatchType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    What type of smartwatch do you have?
                  </label>
                  <select
                    id="smartwatchType"
                    name="smartwatchType"
                    value={formData.smartwatchType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select your smartwatch</option>
                    {smartwatchTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6">
            {!isFormValid() && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Please fill in all required fields marked with * to save your
                  profile.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !isFormValid()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
