"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function HealthSurvey() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [formData, setFormData] = useState({
    familyCardiacDeath: "",
    chestPainPalpitations: "",
    asthmaWheezing: "",
    lossOfConsciousness: "",
    muscleJointPain: "",
    regularMedications: "",
    medicalPrescription: "",
    exerciseInducedPain: "",
    pregnancyRecentBirth: "",
  });

  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(
    null
  );

  // Load existing survey data on component mount
  useEffect(() => {
    async function loadSurveyData() {
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

        const { data: survey, error: surveyError } = await supabase
          .from("health_surveys")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (surveyError && surveyError.code !== "PGRST116") {
          throw surveyError;
        }

        if (survey) {
          // Check if survey is completed
          if (survey.completed_at) {
            setSurveyCompleted(true);
          }

          // Convert boolean values back to "yes"/"no" strings for the form
          setFormData({
            familyCardiacDeath:
              survey.family_cardiac_death === true
                ? "yes"
                : survey.family_cardiac_death === false
                ? "no"
                : "",
            chestPainPalpitations:
              survey.chest_pain_palpitations === true
                ? "yes"
                : survey.chest_pain_palpitations === false
                ? "no"
                : "",
            asthmaWheezing:
              survey.asthma_wheezing === true
                ? "yes"
                : survey.asthma_wheezing === false
                ? "no"
                : "",
            lossOfConsciousness:
              survey.loss_of_consciousness === true
                ? "yes"
                : survey.loss_of_consciousness === false
                ? "no"
                : "",
            muscleJointPain:
              survey.muscle_joint_pain === true
                ? "yes"
                : survey.muscle_joint_pain === false
                ? "no"
                : "",
            regularMedications:
              survey.regular_medications === true
                ? "yes"
                : survey.regular_medications === false
                ? "no"
                : "",
            medicalPrescription:
              survey.medical_prescription === true
                ? "yes"
                : survey.medical_prescription === false
                ? "no"
                : "",
            exerciseInducedPain:
              survey.exercise_induced_pain === true
                ? "yes"
                : survey.exercise_induced_pain === false
                ? "no"
                : "",
            pregnancyRecentBirth:
              survey.pregnancy_recent_birth === true
                ? "yes"
                : survey.pregnancy_recent_birth === false
                ? "no"
                : "",
          });
        }
      } catch (err) {
        console.error("Error loading survey data:", err);
        setError("Failed to load survey data");
      } finally {
        setLoading(false);
      }
    }

    loadSurveyData();
  }, [router, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMedicalCertificate(file);
  };

  // Check if any question is answered "yes"
  const hasYesAnswer = Object.values(formData).some((value) => value === "yes");

  // Check if all questions are answered
  const allQuestionsAnswered = Object.values(formData).every(
    (value) => value !== ""
  );

  // Check if submit button should be disabled
  const isSubmitDisabled =
    !allQuestionsAnswered ||
    (hasYesAnswer && !medicalCertificate) ||
    saving ||
    surveyCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if survey is already completed
    if (surveyCompleted) {
      return;
    }

    // Validate that if any answer is "yes", a medical certificate is required
    if (hasYesAnswer && !medicalCertificate) {
      setError(
        "Please upload a medical certificate before submitting the survey."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Prepare the survey data for database - convert "yes"/"no" strings to booleans
      const surveyData = {
        user_id: user.id,
        family_cardiac_death: formData.familyCardiacDeath === "yes",
        chest_pain_palpitations: formData.chestPainPalpitations === "yes",
        asthma_wheezing: formData.asthmaWheezing === "yes",
        loss_of_consciousness: formData.lossOfConsciousness === "yes",
        muscle_joint_pain: formData.muscleJointPain === "yes",
        regular_medications: formData.regularMedications === "yes",
        medical_prescription: formData.medicalPrescription === "yes",
        exercise_induced_pain: formData.exerciseInducedPain === "yes",
        pregnancy_recent_birth: formData.pregnancyRecentBirth === "yes",
        has_medical_certificate: !!medicalCertificate,
        medical_certificate_filename: medicalCertificate?.name || null,
        completed_at: new Date().toISOString(),
      };

      console.log("Submitting survey data:", surveyData);

      // Check if survey already exists for this user
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: existingSurvey, error: checkError } = await supabase
        .from("health_surveys")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let surveyResult;
      if (existingSurvey) {
        // Update existing survey
        const { data, error: updateError } = await supabase
          .from("health_surveys")
          .update(surveyData)
          .eq("user_id", user.id)
          .select();

        if (updateError) {
          console.error("Survey update error:", updateError);
          throw new Error(`Failed to update survey: ${updateError.message}`);
        }
        surveyResult = data;
        console.log("Survey updated successfully:", surveyResult);
      } else {
        // Insert new survey
        const { data, error: insertError } = await supabase
          .from("health_surveys")
          .insert(surveyData)
          .select();

        if (insertError) {
          console.error("Survey insert error:", insertError);
          throw new Error(`Failed to save survey: ${insertError.message}`);
        }
        surveyResult = data;
        console.log("Survey saved successfully:", surveyResult);
      }

      // TODO: Handle medical certificate file upload to storage
      if (medicalCertificate) {
        console.log("Medical certificate file:", medicalCertificate);
        // For now, we'll just log it. File upload implementation can be added later.
      }

      // Redirect to dashboard with success indication
      router.push("/dashboard?success=health-survey");
    } catch (err) {
      console.error("Error saving survey:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form and navigate back to dashboard
    setFormData({
      familyCardiacDeath: "",
      chestPainPalpitations: "",
      asthmaWheezing: "",
      lossOfConsciousness: "",
      muscleJointPain: "",
      regularMedications: "",
      medicalPrescription: "",
      exerciseInducedPain: "",
      pregnancyRecentBirth: "",
    });
    setMedicalCertificate(null);
    router.push("/dashboard");
  };

  const questions = [
    {
      id: "familyCardiacDeath",
      question:
        "Has a family member died suddenly from a cardiac or unexplained cause?",
      name: "familyCardiacDeath",
    },
    {
      id: "chestPainPalpitations",
      question:
        "Have you experienced chest pain, palpitations, unusual shortness of breath, or discomfort?",
      name: "chestPainPalpitations",
    },
    {
      id: "asthmaWheezing",
      question: "Have you had an episode of wheezing (asthma)?",
      name: "asthmaWheezing",
    },
    {
      id: "lossOfConsciousness",
      question: "Have you had a loss of consciousness?",
      name: "lossOfConsciousness",
    },
    {
      id: "muscleJointPain",
      question: "Have you experienced muscle or joint pain or discomfort?",
      name: "muscleJointPain",
    },
    {
      id: "regularMedications",
      question: "Do you take medications regularly?",
      name: "regularMedications",
    },
    {
      id: "medicalPrescription",
      question:
        "Have you been prescribed medication or been under medical supervision?",
      name: "medicalPrescription",
    },
    {
      id: "exerciseInducedPain",
      question: "Have you experienced pain triggered by physical activity?",
      name: "exerciseInducedPain",
    },
    {
      id: "pregnancyRecentBirth",
      question:
        "Are you pregnant or have you given birth in the last 4 months?",
      name: "pregnancyRecentBirth",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Health Survey
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Survey
          </h1>
          <p className="text-lg text-gray-600">In the last 12 months</p>
          <p className="text-sm text-gray-500 mt-2">
            Please answer all questions honestly to help us create a safe and
            effective training program for you.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {surveyCompleted && (
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
                  Health Survey Completed
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You have already completed this health survey. The information
                  below is read-only and cannot be modified.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`rounded-lg shadow p-6 ${
              surveyCompleted ? "bg-gray-50 border border-gray-200" : "bg-white"
            }`}
          >
            <div className="space-y-8">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="mb-4">
                    <label
                      className={`block text-base font-medium mb-4 ${
                        surveyCompleted ? "text-gray-600" : "text-gray-900"
                      }`}
                    >
                      {index + 1}. {q.question}
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={q.name}
                          value="yes"
                          checked={
                            formData[q.name as keyof typeof formData] === "yes"
                          }
                          onChange={handleInputChange}
                          disabled={surveyCompleted}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            surveyCompleted
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          required
                        />
                        <span
                          className={`ml-2 text-sm ${
                            surveyCompleted ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={q.name}
                          value="no"
                          checked={
                            formData[q.name as keyof typeof formData] === "no"
                          }
                          onChange={handleInputChange}
                          disabled={surveyCompleted}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            surveyCompleted
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          required
                        />
                        <span
                          className={`ml-2 text-sm ${
                            surveyCompleted ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          No
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Certificate Upload - Conditional */}
          {hasYesAnswer && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">
                Medical Certificate Required
              </h3>
              <p className="text-amber-700 mb-4">
                You answered &quot;Yes&quot; to at least one question. Please
                upload a medical certificate attesting that you can practice
                physical activity.
              </p>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Upload your medical certificate
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="medicalCertificate"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={surveyCompleted}
                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                      surveyCompleted ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required={hasYesAnswer && !surveyCompleted}
                  />
                </div>
                {medicalCertificate && (
                  <p className="mt-2 text-sm text-green-600">
                    File selected: {medicalCertificate.name}
                  </p>
                )}
                <p className="mt-2 text-xs text-amber-600">
                  Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
                </p>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {hasYesAnswer
                    ? "Since you answered 'Yes' to at least one question, you must upload a medical certificate before proceeding. Please consult with your doctor to obtain proper medical clearance for physical activity."
                    : "If you answered 'Yes' to any of these questions, please consult with your doctor before starting any new exercise program. Your safety is our top priority."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6">
            {isSubmitDisabled && !surveyCompleted && (
              <p className="text-sm text-amber-600 mb-4 text-right">
                {!allQuestionsAnswered
                  ? "Please answer all questions to continue."
                  : "Please upload a medical certificate to submit the survey."}
              </p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {surveyCompleted ? "Back to Dashboard" : "Cancel"}
              </button>
              {surveyCompleted ? (
                <button
                  type="button"
                  disabled
                  className="px-6 py-3 bg-green-100 text-green-700 rounded-lg cursor-not-allowed flex items-center space-x-2"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Survey Completed</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    isSubmitDisabled
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{saving ? "Submitting..." : "Submit Survey"}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
