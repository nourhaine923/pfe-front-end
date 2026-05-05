// components/dashboard/PatientsOverviewChart.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity, 
  Heart, 
  Droplet,
  Hospital,
  ChevronDown,
  Filter
} from "lucide-react";
import api from "@/services/api";

// ============================================
// TYPES
// ============================================

interface DashboardStats {
  totalPatients: number;
  recipients: number;
  donors: number;
  totalTransplantations: number;
  totalFollowUps: number;
  stablePatients: number;
  criticalPatients: number;
}

interface HospitalData {
  name: string;
  patients: number;
  transplantations: number;
  successRate: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

type HospitalViewType = "transplantations" | "success";

// ============================================
// MAIN COMPONENT
// ============================================

export default function PatientsOverviewChart() {
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    recipients: 0,
    donors: 0,
    totalTransplantations: 0,
    totalFollowUps: 0,
    stablePatients: 0,
    criticalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [hospitalViewType, setHospitalViewType] = useState<HospitalViewType>("transplantations");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all patients
      const patientsRes = await api.get("/patients/all");
      const patients = patientsRes.data || [];
      
      // Fetch all transplantations
      const txRes = await api.get("/transplantations", { params: { limit: 100 } });
      const transplantations = txRes.data?.data || txRes.data || [];
      
      // Fetch all follow-ups
      const followUpRes = await api.get("/followups");
      const followUps = followUpRes.data?.data || followUpRes.data || [];
      
      // Calculate stats
      const recipients = patients.filter((p: any) => p.patientRole === "recipient").length;
      const donors = patients.filter((p: any) => p.patientRole === "donor").length;
      
      const stablePatients = followUps.filter((f: any) => f.clinicalStatus === "Stable").length;
      const criticalPatients = followUps.filter((f: any) => 
        f.clinicalStatus === "Critical" || f.clinicalStatus === "Worsening"
      ).length;
      
      setStats({
        totalPatients: patients.length,
        recipients,
        donors,
        totalTransplantations: transplantations.length,
        totalFollowUps: followUps.length,
        stablePatients,
        criticalPatients
      });
      
      // Process hospital data
      processHospitalData(transplantations);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processHospitalData = (transplantations: any[]) => {
    const hospitalMap = new Map<string, HospitalData>();
    
    for (const tx of transplantations) {
      const location = tx.transplantLocation || "Unknown";
      
      if (!hospitalMap.has(location)) {
        hospitalMap.set(location, {
          name: location,
          patients: 0,
          transplantations: 0,
          successRate: 0,
          approvedCount: 0,
          rejectedCount: 0,
          pendingCount: 0
        });
      }
      
      const hospital = hospitalMap.get(location)!;
      hospital.transplantations++;
      
      if (tx.status === "APPROVED") {
        hospital.approvedCount++;
      } else if (tx.status === "REJECTED") {
        hospital.rejectedCount++;
      } else {
        hospital.pendingCount++;
      }
    }
    
    // Calculate success rates
    for (const [_, hospital] of hospitalMap) {
      hospital.successRate = hospital.transplantations > 0 
        ? Math.round((hospital.approvedCount / hospital.transplantations) * 100)
        : 0;
    }
    
    const hospitalArray = Array.from(hospitalMap.values());
    setHospitalData(hospitalArray);
  };

  const renderHospitalChart = () => {
    if (hospitalViewType === "transplantations") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hospitalData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="transplantations" name="Total Transplantations" fill="#70b931d3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="approvedCount" name="Approved" fill="#235e00" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendingCount" name="Pending" fill="#a9a9a9c8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejectedCount" name="Rejected" fill="#921616" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // Success rate view
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hospitalData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
            formatter={(value) => [`${value}%`, "Success Rate"]}
          />
          <Legend />
          <Bar dataKey="successRate" name="Success Rate (%)" fill="#067e3a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
          subtext={`${stats.recipients} recipients, ${stats.donors} donors`}
        />
        <StatCard
          title="Transplantations"
          value={stats.totalTransplantations}
          icon={Heart}
          color="green"
          subtext="Total procedures"
        />
        <StatCard
          title="Follow-ups"
          value={stats.totalFollowUps}
          icon={Calendar}
          color="purple"
          subtext="Post-transplant visits"
        />
        <StatCard
          title="Clinical Status"
          value={stats.stablePatients}
          icon={Activity}
          color="teal"
          subtext={`${stats.criticalPatients} critical cases`}
        />
      </div>

      {/* Hospitals Overview - Main Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 rounded-lg p-2">
              <Hospital className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Hospitals Overview</h3>
              <p className="text-sm text-gray-500">
                {hospitalViewType === "transplantations" 
                  ? "Transplantations by hospital location" 
                  : "Success rate by hospital location"}
              </p>
            </div>
          </div>
          
          {/* View Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              {hospitalViewType === "transplantations" ? "By Hospital" : "Success Rate"}
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {showHospitalDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHospitalDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                  <button
                    onClick={() => { setHospitalViewType("transplantations"); setShowHospitalDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Transplantations by Hospital
                  </button>
                  <button
                    onClick={() => { setHospitalViewType("success"); setShowHospitalDropdown(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Success Rate by Hospital
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="h-96">
            {renderHospitalChart()}
          </div>
          {hospitalData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Hospital className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hospital data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Distribution & Clinical Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientDistributionChart stats={stats} />
        <ClinicalStatusChart stats={stats} />
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-600"
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PATIENT DISTRIBUTION CHART
// ============================================

function PatientDistributionChart({ stats }: { stats: DashboardStats }) {
  const data = [
    { name: "Recipients", value: stats.recipients, color: "#00bebe" },
    { name: "Donors", value: stats.donors, color: "#00a3c0" }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4">Patient Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// CLINICAL STATUS CHART
// ============================================

function ClinicalStatusChart({ stats }: { stats: DashboardStats }) {
  const stablePercent = stats.totalFollowUps > 0 ? (stats.stablePatients / stats.totalFollowUps) * 100 : 0;
  const criticalPercent = stats.totalFollowUps > 0 ? (stats.criticalPatients / stats.totalFollowUps) * 100 : 0;
  const otherPercent = stats.totalFollowUps > 0 ? 100 - stablePercent - criticalPercent : 0;
  
  const data = [
    { name: "Stable", value: stats.stablePatients, percent: stablePercent, color: "#81d200e2" },
    { name: "Critical/Worsening", value: stats.criticalPatients, percent: criticalPercent, color: "#7c1616" },
    { name: "Other", value: stats.totalFollowUps - stats.stablePatients - stats.criticalPatients, percent: otherPercent, color: "#037547" }
  ].filter(d => d.value > 0);
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4">Clinical Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis type="category" dataKey="name" />
            <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
            <Bar dataKey="percent" fill="#9bc200" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}