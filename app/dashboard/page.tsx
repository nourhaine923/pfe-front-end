// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/context";
import PatientsOverviewChart from "@/components/dashboard/PatientsOverviewChart";
import ScoresDashboard from "@/components/dashboard/ScoresDashboard";
import { BarChart3, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"patients" | "scores">("patients");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 px-4">
              <button
                onClick={() => setActiveTab("patients")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "patients"
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Activity className="h-4 w-4" />
                Patients Overview
              </button>
              <button
                onClick={() => setActiveTab("scores")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "scores"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Scores Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "patients" && <PatientsOverviewChart />}
        {activeTab === "scores" && <ScoresDashboard />}
        
      </div>
    </div>
  );
}