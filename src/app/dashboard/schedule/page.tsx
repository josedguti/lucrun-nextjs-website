"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

interface RunnerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface PaymentRecord {
  id?: string;
  user_id: string;
  year: number;
  month: number;
  is_paid: boolean;
  payment_date?: string | null;
  amount?: number | null;
  notes?: string | null;
}

function ScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runners, setRunners] = useState<RunnerProfile[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  useEffect(() => {
    const userId = searchParams.get("userId");
    // For regular users, always show their own data
    // For admin, respect the URL parameter
    if (!isAdmin && currentUserId) {
      setSelectedUserId(currentUserId);
    } else {
      setSelectedUserId(userId); // This will set it to userId or null
    }
  }, [searchParams, isAdmin, currentUserId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is admin
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const userIsAdmin = user.email === "luc.run.coach@gmail.com";
        setIsAdmin(userIsAdmin);
        setCurrentUserId(user.id);

        // Fetch runners based on user role
        let runnersData: RunnerProfile[] = [];

        if (userIsAdmin) {
          // Admin: Fetch all runners (excluding admin)
          const { data, error: runnersError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .neq("email", "luc.run.coach@gmail.com")
            .order("first_name", { ascending: true });

          if (runnersError) {
            console.error("Error fetching runners:", runnersError);
            return;
          }
          runnersData = data || [];
        } else {
          // Regular user: Only fetch their own profile
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }
          runnersData = data ? [data] : [];
          // Automatically set selectedUserId to current user for regular users
          setSelectedUserId(user.id);
        }

        setRunners(runnersData);

        // Fetch payment records for the current year
        // For regular users, only fetch their own records
        let paymentsQuery = supabase
          .from("payment_records")
          .select("*")
          .eq("year", currentYear);

        if (!userIsAdmin) {
          paymentsQuery = paymentsQuery.eq("user_id", user.id);
        }

        const { data: paymentsData, error: paymentsError } =
          await paymentsQuery;

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          return;
        }

        setPaymentRecords(paymentsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, supabase, router]);

  const getPaymentStatus = (userId: string, month: number): boolean => {
    const record = paymentRecords.find(
      (p) => p.user_id === userId && p.month === month + 1
    );
    return record?.is_paid || false;
  };

  const handlePaymentToggle = async (userId: string, month: number) => {
    try {
      setSaving(true);
      const isPaid = getPaymentStatus(userId, month);
      const monthNumber = month + 1; // Convert from 0-indexed to 1-indexed

      // Check if record exists
      const existingRecord = paymentRecords.find(
        (p) => p.user_id === userId && p.month === monthNumber
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("payment_records")
          .update({
            is_paid: !isPaid,
            payment_date: !isPaid
              ? new Date().toISOString().split("T")[0]
              : null,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRecord.id);

        if (error) {
          console.error("Error updating payment:", error);
          alert("Erreur lors de la mise à jour du paiement");
          return;
        }

        // Update local state
        setPaymentRecords((prev) =>
          prev.map((p) =>
            p.id === existingRecord.id
              ? {
                  ...p,
                  is_paid: !isPaid,
                  payment_date: !isPaid
                    ? new Date().toISOString().split("T")[0]
                    : null,
                }
              : p
          )
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("payment_records")
          .insert({
            user_id: userId,
            year: currentYear,
            month: monthNumber,
            is_paid: true,
            payment_date: new Date().toISOString().split("T")[0],
            updated_by: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating payment:", error);
          alert("Erreur lors de la création du paiement");
          return;
        }

        // Add to local state
        setPaymentRecords((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Error toggling payment:", error);
      alert("Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const getRunnerName = (runner: RunnerProfile): string => {
    if (runner.first_name && runner.last_name) {
      return `${runner.first_name} ${runner.last_name}`;
    }
    return (
      runner.first_name || runner.email?.split("@")[0] || "Utilisateur inconnu"
    );
  };

  const displayedRunners = selectedUserId
    ? runners.filter((r) => r.id === selectedUserId)
    : runners;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement de l&apos;échéancier...
              </p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Échéancier de paiement
              </h1>
              <p className="text-lg text-gray-600">
                {isAdmin
                  ? selectedUserId
                    ? `Suivi des paiements pour ${getRunnerName(
                        displayedRunners[0]
                      )}`
                    : "Gérer les paiements mensuels de tous les coureurs"
                  : "Consulter votre échéancier de paiement"}
              </p>
            </div>
            {selectedUserId && isAdmin && (
              <button
                onClick={() => router.push("/dashboard/schedule")}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Voir tous les coureurs
              </button>
            )}
          </div>
        </div>

        {/* Year Selector */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setCurrentYear(currentYear - 1)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← {currentYear - 1}
          </button>
          <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-lg">
            {currentYear}
          </div>
          <button
            onClick={() => setCurrentYear(currentYear + 1)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {currentYear + 1} →
          </button>
        </div>

        {/* Payment Grid */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                  Coureur
                </th>
                {months.map((month, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedRunners.map((runner) => (
                <tr key={runner.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {getRunnerName(runner)}
                  </td>
                  {months.map((_, monthIndex) => (
                    <td
                      key={monthIndex}
                      className="px-4 py-4 whitespace-nowrap text-center"
                    >
                      <input
                        type="checkbox"
                        checked={getPaymentStatus(runner.id, monthIndex)}
                        onChange={() =>
                          handlePaymentToggle(runner.id, monthIndex)
                        }
                        disabled={saving || !isAdmin}
                        className={`w-5 h-5 rounded focus:ring-green-500 ${
                          isAdmin
                            ? "text-green-600 border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            : "text-gray-600 border-gray-500 cursor-not-allowed opacity-100"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {displayedRunners.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun coureur trouvé</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="w-5 h-5 text-green-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">= Payé</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  className="w-5 h-5 text-green-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">= Non payé</span>
              </div>
            </div>
            {!isAdmin && (
              <div className="text-sm text-gray-600 italic">
                ℹ️ Consultation uniquement (lecture seule)
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de l&apos;échéancier...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
