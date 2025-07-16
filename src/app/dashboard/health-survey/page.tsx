"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HealthSurvey() {
  const router = useRouter();
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
    !allQuestionsAnswered || (hasYesAnswer && !medicalCertificate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that if any answer is "yes", a medical certificate is required
    if (hasYesAnswer && !medicalCertificate) {
      alert(
        "Please upload a medical certificate before submitting the survey."
      );
      return;
    }

    console.log("Health survey submitted:", formData);
    console.log("Medical certificate:", medicalCertificate);
    // Here you would typically send the data to your backend
    // For now, we'll just show a success message or redirect
    alert("Health survey submitted successfully!");
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-8">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="mb-4">
                    <label className="block text-base font-medium text-gray-900 mb-4">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
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
                You answered "Yes" to at least one question. Please upload a
                medical certificate attesting that you can practice physical
                activity.
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required={hasYesAnswer}
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
            {isSubmitDisabled && (
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  isSubmitDisabled
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Submit Survey
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
