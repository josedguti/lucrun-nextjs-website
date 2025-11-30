"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setViewingUserId] = useState<string | null>(null);
  const [viewingUserName, setViewingUserName] = useState<string>("");
  const [isReadOnly, setIsReadOnly] = useState(false);
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
    // Health Information
    height: "",
    weight: "",
    bodyFatPercentage: "",
    // Running Information
    trainingHoursPerWeek: "",
    runningLevel: "",
    currentWeeklyKm: "",
    longestDistance: "",
    recent5kTime: "",
    recent10kTime: "",
  });

  const daysOfWeek = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  const equipmentOptions = [
    "Tapis de course",
    "Elliptique",
    "Vélo d'appartement",
    "Rameur",
    "Poids libres",
    "Bandes de résistance",
    "Kettlebells",
    "Barre de traction",
    "Tapis de yoga",
    "Rouleau de massage",
    "Médecine-ball",
    "Swiss ball",
    "TRX Suspension",
    "Corde à sauter",
  ];

  const smartwatchTypes = [
    "Apple Watch",
    "Garmin",
    "Fitbit",
    "Samsung Galaxy Watch",
    "Polar",
    "Suunto",
    "Autre",
  ];

  const runningLevels = [
    "Débutant (Commence tout juste)",
    "Récréatif (Course pour le plaisir/fitness)",
    "Intermédiaire (Coureur régulier avec expérience)",
    "Avancé (Expérimenté avec objectifs de course)",
    "Elite/Compétitif (Athlète de haut niveau)",
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

        // Check if we're viewing another user's profile
        const userIdParam = searchParams.get("userId");
        const targetUserId = userIdParam || user.id;
        const isViewingOtherUser = userIdParam && userIdParam !== user.id;

        setViewingUserId(targetUserId);
        setIsReadOnly(!!isViewingOtherUser);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetUserId)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profile) {
          // Set viewing user name for display
          const userName =
            profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile.first_name || profile.email?.split("@")[0] || "Utilisateur";
          setViewingUserName(userName);

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
            height: profile.height || "",
            weight: profile.weight || "",
            bodyFatPercentage: profile.body_fat_percentage || "",
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
        setError("Échec du chargement des données du profil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase, searchParams]);

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

  // Calculate BMI from height and weight
  const calculateBMI = (height: string, weight: string): string => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!heightNum || !weightNum || heightNum <= 0 || weightNum <= 0) {
      return "";
    }

    // Convert height from cm to meters
    const heightInMeters = heightNum / 100;
    // Calculate BMI: weight(kg) / height(m)²
    const bmi = weightNum / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  // Get current BMI value
  const currentBMI = calculateBMI(formData.height, formData.weight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent form submission when viewing another user's profile
    if (isReadOnly) {
      return;
    }

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
        height: formData.height.trim() || null,
        weight: formData.weight.trim() || null,
        body_fat_percentage: formData.bodyFatPercentage.trim() || null,
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
      height: "",
      weight: "",
      bodyFatPercentage: "",
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
            Paramètres du profil
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
        {/* Back button for admin viewing other profiles */}
        {isReadOnly && (
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour aux coureurs
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isReadOnly ? `Profil de ${viewingUserName}` : "Paramètres du profil"}
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
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse e-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Adresse <span className="text-red-500">*</span>
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Région/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Pays <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Comptes connectés
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="stravaAccount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Compte Strava
                </label>
                <input
                  type="text"
                  id="stravaAccount"
                  name="stravaAccount"
                  placeholder="Nom d'utilisateur ou e-mail Strava"
                  value={formData.stravaAccount}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="garminAccount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Compte Garmin
                </label>
                <input
                  type="text"
                  id="garminAccount"
                  name="garminAccount"
                  placeholder="Nom d'utilisateur ou e-mail Garmin"
                  value={formData.garminAccount}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Training Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Horaire d&apos;entraînement
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Quels jours de la semaine peux-tu t&apos;entraîner ?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {daysOfWeek.map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trainingDays.includes(day)}
                      onChange={() =>
                        !isReadOnly && handleCheckboxChange("trainingDays", day)
                      }
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
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
              Informations sur la course
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="trainingHoursPerWeek"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Combien d&apos;heures par semaine peux-tu consacrer à l&apos;entraînement ?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="trainingHoursPerWeek"
                  name="trainingHoursPerWeek"
                  required
                  value={formData.trainingHoursPerWeek}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Sélectionnez les heures par semaine</option>
                  <option value="1-2">1-2 heures</option>
                  <option value="3-4">3-4 heures</option>
                  <option value="5-6">5-6 heures</option>
                  <option value="7-8">7-8 heures</option>
                  <option value="9-10">9-10 heures</option>
                  <option value="11+">11+ heures</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="runningLevel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quel est ton niveau de course ?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="runningLevel"
                  name="runningLevel"
                  required
                  value={formData.runningLevel}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Sélectionnez votre niveau de course</option>
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
                  Combien de kilomètres cours-tu par semaine actuellement ?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="currentWeeklyKm"
                  name="currentWeeklyKm"
                  required
                  value={formData.currentWeeklyKm}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Sélectionnez les kilomètres hebdomadaires</option>
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
                  Quelle est la plus longue distance que tu as courue ?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="longestDistance"
                  name="longestDistance"
                  required
                  value={formData.longestDistance}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Sélectionnez la distance la plus longue</option>
                  <option value="Less than 5K">Moins de 5KM</option>
                  <option value="5K">5KM</option>
                  <option value="10K">10KM</option>
                  <option value="15K">15KM</option>
                  <option value="Half Marathon (21K)">
                    Semi-marathon (21KM)
                  </option>
                  <option value="Marathon (42K)">Marathon (42KM)</option>
                  <option value="Ultra Marathon (50K+)">
                    Ultra Marathon (50KM+)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="recent5kTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Temps récent sur 5KM (optionnel)
                </label>
                <input
                  type="text"
                  id="recent5kTime"
                  name="recent5kTime"
                  placeholder="ex : 25:30 (MM:SS)"
                  value={formData.recent5kTime}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="recent10kTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Temps récent sur 10KM (optionnel)
                </label>
                <input
                  type="text"
                  id="recent10kTime"
                  name="recent10kTime"
                  placeholder="ex : 55:00 (MM:SS)"
                  value={formData.recent10kTime}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Training Equipment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Équipement d&apos;entraînement
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                À quel équipement as-tu accès pour l&apos;entraînement ?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentOptions.map((equipment) => (
                  <label key={equipment} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() =>
                        !isReadOnly &&
                        handleCheckboxChange("equipment", equipment)
                      }
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
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
              Informations de santé
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  As-tu actuellement des blessures ?{" "}
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
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Oui</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasInjury"
                      value="no"
                      checked={formData.hasInjury === "no"}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Non</span>
                  </label>
                </div>
              </div>

              {formData.hasInjury === "yes" && (
                <div>
                  <label
                    htmlFor="injuryDetails"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Décris ta/tes blessure(s)
                  </label>
                  <textarea
                    id="injuryDetails"
                    name="injuryDetails"
                    rows={3}
                    value={formData.injuryDetails}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Décris tes blessures actuelles, leur gravité et les limitations qu'elles causent..."
                  ></textarea>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  As-tu eu des blessures importantes dans le passé ?{" "}
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
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Oui</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasPastInjury"
                      value="no"
                      checked={formData.hasPastInjury === "no"}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Non</span>
                  </label>
                </div>
              </div>

              {formData.hasPastInjury === "yes" && (
                <div>
                  <label
                    htmlFor="pastInjuryDetails"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Décris ta/tes blessure(s) passée(s)
                  </label>
                  <textarea
                    id="pastInjuryDetails"
                    name="pastInjuryDetails"
                    rows={3}
                    value={formData.pastInjuryDetails}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Décris tes blessures passées, quand elles sont survenues et si elles t'affectent toujours..."
                  ></textarea>
                </div>
              )}

              {/* Height, Weight, and Body Composition Section */}
              <div className="space-y-6">
                {/* First row: Height, Weight, BMI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      min="1"
                      max="300"
                      step="0.1"
                      value={formData.height}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                        isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="ex : 170"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      min="1"
                      max="500"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                        isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="ex : 70"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bmi"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      IMC (calculé)
                    </label>
                    <input
                      type="text"
                      id="bmi"
                      name="bmi"
                      value={currentBMI}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                      placeholder="Calculé automatiquement"
                    />
                    {currentBMI && (
                      <p className="text-xs text-gray-500 mt-1">
                        {parseFloat(currentBMI) < 18.5 && "Insuffisance pondérale"}
                        {parseFloat(currentBMI) >= 18.5 &&
                          parseFloat(currentBMI) < 25 &&
                          "Poids normal"}
                        {parseFloat(currentBMI) >= 25 &&
                          parseFloat(currentBMI) < 30 &&
                          "Surpoids"}
                        {parseFloat(currentBMI) >= 30 && "Obésité"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Second row: Body Fat Percentage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="bodyFatPercentage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Pourcentage de graisse corporelle (%)
                    </label>
                    <input
                      type="number"
                      id="bodyFatPercentage"
                      name="bodyFatPercentage"
                      min="1"
                      max="50"
                      step="0.1"
                      value={formData.bodyFatPercentage}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                        isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="ex : 15.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pourcentage de graisse corporelle estimé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smartwatch Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations sur l&apos;appareil
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  As-tu une montre connectée ?{" "}
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
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Oui</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="hasSmartwatch"
                      value="no"
                      checked={formData.hasSmartwatch === "no"}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Non</span>
                  </label>
                </div>
              </div>

              {formData.hasSmartwatch === "yes" && (
                <div>
                  <label
                    htmlFor="smartwatchType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Quel type de montre connectée as-tu ?
                  </label>
                  <select
                    id="smartwatchType"
                    name="smartwatchType"
                    value={formData.smartwatchType}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Sélectionnez votre montre connectée</option>
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

          {/* Action Buttons - Only show for own profile */}
          {!isReadOnly && (
            <div className="pt-6">
              {!isFormValid() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Merci de remplir tous les champs obligatoires marqués d&apos;un * pour enregistrer
                    ton profil.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !isFormValid()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{saving ? "Enregistrement..." : "Enregistrer le profil"}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
