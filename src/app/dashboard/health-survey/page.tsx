"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function HealthSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [, setViewingUserId] = useState<string | null>(null);
  const [viewingUserName, setViewingUserName] = useState<string>("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [medicalCertificateUrl, setMedicalCertificateUrl] = useState<string | null>(null);
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
    documentType: "medical", // Default to medical certificate
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

        // Check if we're viewing another user's health survey
        const userIdParam = searchParams.get("userId");
        const targetUserId = userIdParam || user.id;
        const isViewingOtherUser = userIdParam && userIdParam !== user.id;
        
        setViewingUserId(targetUserId);
        setIsReadOnly(!!isViewingOtherUser);

        // If viewing another user, get their profile info for display
        if (isViewingOtherUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", targetUserId)
            .single();
          
          if (profile) {
            const userName = profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile.first_name || profile.email?.split("@")[0] || "User";
            setViewingUserName(userName);
          }
        }

        const { data: survey, error: surveyError } = await supabase
          .from("health_surveys")
          .select("*")
          .eq("user_id", targetUserId)
          .single();

        if (surveyError && surveyError.code !== "PGRST116") {
          throw surveyError;
        }

        if (survey) {
          // Check if survey is completed
          if (survey.completed_at) {
            setSurveyCompleted(true);
          }
          
          // Store medical certificate URL if available
          if (survey.medical_certificate_url) {
            setMedicalCertificateUrl(survey.medical_certificate_url);
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
            documentType: survey.document_type || "medical",
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
  }, [router, supabase, searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  // Check if all questions are answered
  const allQuestionsAnswered = Object.values(formData).every(
    (value) => value !== ""
  );

  // Check if submit button should be disabled - always require file upload
  const isSubmitDisabled =
    !allQuestionsAnswered || !medicalCertificate || saving || surveyCompleted || isReadOnly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent form submission when viewing another user's survey or if completed
    if (isReadOnly || surveyCompleted) {
      return;
    }

    // Validate that a medical certificate or sports license is uploaded
    if (!medicalCertificate) {
      setError(
        "Please upload a medical certificate or sports license before submitting the survey."
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

      // Upload file to Supabase Storage
      let fileUrl = null;
      const fileName = null;

      if (medicalCertificate) {
        // Make sure the path includes the user ID as a folder name first
        const fileName = `${Date.now()}-${medicalCertificate.name}`;
        const filePath = `${user.id}/${fileName}`; // This is the key change - put user.id as a folder

        const { error: uploadError } = await supabase.storage
          .from("health_documents")
          .upload(filePath, medicalCertificate, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("File upload error:", uploadError);
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Get public URL for the file
        const {
          data: { publicUrl },
        } = supabase.storage.from("health_documents").getPublicUrl(filePath);

        fileUrl = publicUrl;
        console.log("File uploaded successfully:", fileUrl);
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
        has_medical_certificate: true, // Always true now since we require it
        medical_certificate_url: fileUrl,
        medical_certificate_filename: fileName,
        document_type: formData.documentType,
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

      // Update dashboard progress
      try {
        const { error: progressError } = await supabase
          .from("dashboard_progress")
          .upsert({
            user_id: user.id,
            health_survey_completed: true,
          });

        if (progressError) {
          console.warn("Dashboard progress update failed:", progressError);
        }
      } catch (progressErr) {
        console.warn("Dashboard progress update skipped:", progressErr);
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
      documentType: "medical",
    });
    setMedicalCertificate(null);
    router.push("/dashboard");
  };

  const questions = [
    {
      id: "familyCardiacDeath",
      question:
        "Un membre de votre famille est-il décédé subitement d&apos;une cause cardiaque ou inexpliquée ?",
      name: "familyCardiacDeath",
    },
    {
      id: "chestPainPalpitations",
      question:
        "Avez-vous ressenti des douleurs thoraciques, des palpitations, un essoufflement inhabituel ou une gêne ?",
      name: "chestPainPalpitations",
    },
    {
      id: "asthmaWheezing",
      question: "Avez-vous eu un épisode de respiration sifflante (asthme) ?",
      name: "asthmaWheezing",
    },
    {
      id: "lossOfConsciousness",
      question: "Avez-vous eu une perte de connaissance ?",
      name: "lossOfConsciousness",
    },
    {
      id: "muscleJointPain",
      question: "Avez-vous ressenti des douleurs ou gênes musculaires ou articulaires ?",
      name: "muscleJointPain",
    },
    {
      id: "regularMedications",
      question: "Prenez-vous des médicaments régulièrement ?",
      name: "regularMedications",
    },
    {
      id: "medicalPrescription",
      question:
        "Vous a-t-on prescrit des médicaments ou êtes-vous sous surveillance médicale ?",
      name: "medicalPrescription",
    },
    {
      id: "exerciseInducedPain",
      question: "Avez-vous ressenti une douleur déclenchée par une activité physique ?",
      name: "exerciseInducedPain",
    },
    {
      id: "pregnancyRecentBirth",
      question:
        "Êtes-vous enceinte ou avez-vous accouché au cours des 4 derniers mois ?",
      name: "pregnancyRecentBirth",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Questionnaire santé
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
        {/* Back button for admin viewing other users' surveys */}
        {isReadOnly && (
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux coureurs
            </button>
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isReadOnly ? `Questionnaire santé de ${viewingUserName}` : "Questionnaire santé"}
          </h1>
          <p className="text-lg text-gray-600">Au cours des 12 derniers mois</p>
          <p className="text-sm text-gray-500 mt-2">
            {isReadOnly 
              ? "Informations du questionnaire santé de cet utilisateur (lecture seule)."
              : "Veuillez répondre honnêtement à toutes les questions pour nous aider à créer un programme d&apos;entraînement sûr et efficace pour vous."
            }
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
                  Questionnaire santé complété
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Vous avez déjà complété ce questionnaire santé. Les informations
                  ci-dessous sont en lecture seule et ne peuvent pas être modifiées.
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
                          disabled={surveyCompleted || isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            (surveyCompleted || isReadOnly)
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          required
                        />
                        <span
                          className={`ml-2 text-sm ${
                            (surveyCompleted || isReadOnly) ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          Oui
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
                          disabled={surveyCompleted || isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            (surveyCompleted || isReadOnly)
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          required
                        />
                        <span
                          className={`ml-2 text-sm ${
                            (surveyCompleted || isReadOnly) ? "text-gray-500" : "text-gray-700"
                          }`}
                        >
                          Non
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Certificate Upload - Always required now */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Document requis
            </h3>
            <p className="text-amber-700 mb-4">
              Veuillez télécharger un certificat médical ou une licence sportive attestant
              que vous pouvez pratiquer une activité physique.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Type de document
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  disabled={surveyCompleted || isReadOnly}
                  className={`block w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 ${
                    (surveyCompleted || isReadOnly) ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  required
                >
                  <option value="medical">Certificat médical</option>
                  <option value="sports">Licence sportive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Téléchargez votre{" "}
                  {formData.documentType === "medical"
                    ? "certificat médical"
                    : "licence sportive"}
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="medicalCertificate"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={surveyCompleted || isReadOnly}
                    className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                      (surveyCompleted || isReadOnly) ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    required={!surveyCompleted && !isReadOnly}
                  />
                </div>
                {medicalCertificate && (
                  <p className="mt-2 text-sm text-green-600">
                    Fichier sélectionné : {medicalCertificate.name}
                  </p>
                )}
                
                {/* Medical Certificate View Button - Show when admin is viewing and certificate exists */}
                {isReadOnly && medicalCertificateUrl && (
                  <div className="mt-4">
                    <a
                      href={medicalCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Voir le certificat médical
                    </a>
                  </div>
                )}
                
                {/* Show message if no certificate available for admin */}
                {isReadOnly && !medicalCertificateUrl && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Aucun certificat médical n&apos;a encore été téléchargé par cet utilisateur.
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-amber-600">
                  Formats acceptés : PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10 Mo)
                </p>
              </div>
            </div>
          </div>

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
                  Avis important
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Un certificat médical ou une licence sportive valide est requis
                  avant de pouvoir commencer tout programme d&apos;entraînement. Cela garantit votre
                  sécurité et nous aide à créer un plan d&apos;entraînement approprié pour
                  vous.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for own survey or read-only back button */}
          <div className="pt-6">
            {!isReadOnly && isSubmitDisabled && !surveyCompleted && (
              <p className="text-sm text-amber-600 mb-4 text-right">
                {!allQuestionsAnswered
                  ? "Veuillez répondre à toutes les questions pour continuer."
                  : !medicalCertificate
                  ? "Veuillez télécharger un document requis pour soumettre le questionnaire."
                  : ""}
              </p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isReadOnly ? "Retour aux coureurs" : surveyCompleted ? "Retour au tableau de bord" : "Annuler"}
              </button>
              {!isReadOnly && (
                surveyCompleted ? (
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
                    <span>Questionnaire complété</span>
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
                    <span>{saving ? "Envoi en cours..." : "Soumettre le questionnaire"}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function HealthSurvey() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HealthSurveyContent />
    </Suspense>
  );
}
