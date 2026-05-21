// components/dashboard/PatientsOverviewChart.tsx
"use client"; // Next.js directive for client-side rendering - this component uses browser APIs and interactive charts

import React, { useEffect, useState } from "react"; // React core imports for component and hooks
// Recharts library imports for creating responsive charts (line, bar, pie charts)
import {
  LineChart,      // Component for line charts (trends over time)
  Line,           // Line element for LineChart
  XAxis,          // X-axis component for charts
  YAxis,          // Y-axis component for charts
  Tooltip,        // Tooltip that appears on chart hover
  CartesianGrid,  // Grid lines for charts
  ResponsiveContainer, // Wrapper that makes charts responsive to container size
  BarChart,       // Component for bar charts
  Bar,            // Bar element for BarChart
  PieChart,       // Component for pie charts
  Pie,            // Pie element for PieChart
  Cell,           // Individual cell in pie chart (for custom colors)
  Legend          // Legend component for chart labels
} from "recharts";
// Lucide React icons for visual elements
import { 
  Calendar,     // Icon for follow-ups/date-related stats
  Users,        // Icon for patient counts
  TrendingUp,   // Icon for trends/success rates (unused but available)
  Activity,     // Icon for clinical status
  Heart,        // Icon for transplantations
  Droplet,      // Icon for blood-related stats (unused but available)
  Hospital,     // Icon for hospital charts section
  ChevronDown,  // Dropdown chevron icon
  Filter        // Filter icon for view type dropdown
} from "lucide-react";
import api from "@/services/api"; // API service for backend HTTP requests

// TYPES - TypeScript interfaces for data structures

interface DashboardStats {
  totalPatients: number;      // Total number of patients in system
  recipients: number;         // Number of recipient patients
  donors: number;             // Number of donor patients
  totalTransplantations: number; // Total transplant procedures
  totalFollowUps: number;     // Total follow-up visits
  stablePatients: number;     // Patients with stable clinical status
  criticalPatients: number;   // Patients with critical/worsening status
}

interface HospitalData {
  name: string;               // Hospital name/location
  patients: number;           // Number of patients at this hospital
  transplantations: number;   // Total transplantations performed here
  successRate: number;        // Success rate percentage (approved/total)
  approvedCount: number;      // Number of approved transplantations
  rejectedCount: number;      // Number of rejected transplantations
  pendingCount: number;       // Number of pending transplantations
}

type HospitalViewType = "transplantations" | "success"; // Toggle between showing transplant counts or success rates

// MAIN COMPONENT - Dashboard chart container

export default function PatientsOverviewChart() {
  // State management for hospital and statistics data
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([]); // Stores processed hospital data
  const [stats, setStats] = useState<DashboardStats>({ // Stores aggregated statistics
    totalPatients: 0,
    recipients: 0,
    donors: 0,
    totalTransplantations: 0,
    totalFollowUps: 0,
    stablePatients: 0,
    criticalPatients: 0
  });
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [hospitalViewType, setHospitalViewType] = useState<HospitalViewType>("transplantations"); // Current chart view mode
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false); // Controls dropdown menu visibility

  // Effect hook - fetches dashboard data when component mounts
  useEffect(() => {
    fetchDashboardData(); // Initial data load
  }, []); // Empty dependency array means this runs once on mount

  // Fetches all necessary data from backend APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true); // Show loading state while fetching
      
      // Fetch all patients from backend (no pagination for dashboard stats)
      const patientsRes = await api.get("/patients/all");
      const patients = patientsRes.data || []; // Extract patients array (fallback to empty array)
      
      // Fetch all transplantations (limit 100 for performance)
      const txRes = await api.get("/transplantations", { params: { limit: 100 } });
      const transplantations = txRes.data?.data || txRes.data || []; // Handle both response structures
      
      // Fetch all follow-ups
      const followUpRes = await api.get("/followups");
      const followUps = followUpRes.data?.data || followUpRes.data || [];
      
      // Calculate statistics from fetched data
      const recipients = patients.filter((p: any) => p.patientRole === "recipient").length; // Count recipients
      const donors = patients.filter((p: any) => p.patientRole === "donor").length; // Count donors
      
      // Count patients by clinical status from follow-up data
      const stablePatients = followUps.filter((f: any) => f.clinicalStatus === "Stable").length;
      const criticalPatients = followUps.filter((f: any) => 
        f.clinicalStatus === "Critical" || f.clinicalStatus === "Worsening"
      ).length;
      
      // Update stats state with calculated values
      setStats({
        totalPatients: patients.length,
        recipients,
        donors,
        totalTransplantations: transplantations.length,
        totalFollowUps: followUps.length,
        stablePatients,
        criticalPatients
      });
      
      // Process transplantations to extract hospital-specific data
      processHospitalData(transplantations);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error); // Log error to console
    } finally {
      setLoading(false); // Always clear loading state
    }
  };

  // Processes transplantation data to aggregate by hospital
  const processHospitalData = (transplantations: any[]) => {
    const hospitalMap = new Map<string, HospitalData>(); // Map to group data by hospital name
    
    // Iterate through each transplantation record
    for (const tx of transplantations) {
      const location = tx.transplantLocation || "Unknown"; // Get hospital location (default "Unknown")
      
      // Initialize hospital entry if not exists
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
      
      const hospital = hospitalMap.get(location)!; // Get hospital object (non-null assertion)
      hospital.transplantations++; // Increment total transplantations
      
      // Increment appropriate status counter
      if (tx.status === "APPROVED") {
        hospital.approvedCount++;
      } else if (tx.status === "REJECTED") {
        hospital.rejectedCount++;
      } else {
        hospital.pendingCount++; // Any status other than APPROVED/REJECTED
      }
    }
    
    // Calculate success rates for each hospital
    for (const [_, hospital] of hospitalMap) {
      hospital.successRate = hospital.transplantations > 0 
        ? Math.round((hospital.approvedCount / hospital.transplantations) * 100) // Percentage rounded
        : 0; // Avoid division by zero
    }
    
    const hospitalArray = Array.from(hospitalMap.values()); // Convert Map to array
    setHospitalData(hospitalArray); // Update state
  };

  // Renders the appropriate hospital chart based on selected view type
  const renderHospitalChart = () => {
    if (hospitalViewType === "transplantations") {
      // Bar chart showing transplantations by hospital with status breakdown
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hospitalData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Grid lines with dashed pattern */}
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} /> {/* Hospital names on X axis */}
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} /> {/* Count on Y axis */}
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Legend /> {/* Shows bar labels */}
            <Bar dataKey="transplantations" name="Total Transplantations" fill="#70b931d3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="approvedCount" name="Approved" fill="#235e00" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendingCount" name="Pending" fill="#a9a9a9c8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejectedCount" name="Rejected" fill="#921616" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // Success rate view - shows percentage bar chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hospitalData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} domain={[0, 100]} /> {/* Fixed domain 0-100 for percentages */}
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px"
            }}
            formatter={(value) => [`${value}%`, "Success Rate"]} // Format tooltip as percentage
          />
          <Legend />
          <Bar dataKey="successRate" name="Success Rate (%)" fill="#067e3a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Loading state - shows spinner while data is being fetched
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  // Main render - displays all charts and stats
  return (
    <div className="space-y-6">
      {/* Stats Cards Row - Key metrics at a glance */}
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

      {/* Hospitals Overview - Main Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Chart Header with title and dropdown filter */}
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
          
          {/* View Type Dropdown - Toggles between data views */}
          <div className="relative">
            <button
              onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              {hospitalViewType === "transplantations" ? "By Hospital" : "Success Rate"}
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {/* Dropdown Menu */}
            {showHospitalDropdown && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
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
        
        {/* Chart Container */}
        <div className="p-6">
          <div className="h-96">
            {renderHospitalChart()} {/* Dynamically render selected chart type */}
          </div>
          {/* Empty state - shown when no hospital data */}
          {hospitalData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Hospital className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hospital data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Two side-by-side charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientDistributionChart stats={stats} /> {/* Recipient/Donor pie chart */}
        <ClinicalStatusChart stats={stats} /> {/* Clinical status bar chart */}
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT - Reusable metric card
// ============================================

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  // Color mapping for different stat card types
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
          <p className="text-sm text-gray-500 mb-1">{title}</p> {/* Card title */}
          <p className="text-3xl font-bold text-gray-800">{value}</p> {/* Main value */}
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>} {/* Optional subtext */}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" /> {/* Icon with appropriate color */}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PATIENT DISTRIBUTION CHART - Recipients vs Donors pie chart
// ============================================

function PatientDistributionChart({ stats }: { stats: DashboardStats }) {
  // Data structure for pie chart - recipients and donors
  const data = [
    { name: "Recipients", value: stats.recipients, color: "#00bebe" }, // Teal color
    { name: "Donors", value: stats.donors, color: "#00a3c0" } // Blue-teal color
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4">Patient Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" // Center X position
              cy="50%" // Center Y position
              innerRadius={60} // Creates a donut chart (has hole in middle)
              outerRadius={80} // Outer radius of pie
              paddingAngle={5} // Gap between segments
              dataKey="value" // Uses the 'value' field for segment sizes
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Custom label with percentage
            >
              {/* Map each data entry to a colored cell */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip /> {/* Shows values on hover */}
            <Legend /> {/* Shows color legend */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// CLINICAL STATUS CHART - Horizontal bar chart for patient outcomes
// ============================================

function ClinicalStatusChart({ stats }: { stats: DashboardStats }) {
  // Calculate percentages for each clinical status category
  const stablePercent = stats.totalFollowUps > 0 ? (stats.stablePatients / stats.totalFollowUps) * 100 : 0;
  const criticalPercent = stats.totalFollowUps > 0 ? (stats.criticalPatients / stats.totalFollowUps) * 100 : 0;
  const otherPercent = stats.totalFollowUps > 0 ? 100 - stablePercent - criticalPercent : 0;
  
  // Data array for bar chart - filter out zero values
  const data = [
    { name: "Stable", value: stats.stablePatients, percent: stablePercent, color: "#81d200e2" },
    { name: "Critical/Worsening", value: stats.criticalPatients, percent: criticalPercent, color: "#7c1616" },
    { name: "Other", value: stats.totalFollowUps - stats.stablePatients - stats.criticalPatients, percent: otherPercent, color: "#037547" }
  ].filter(d => d.value > 0); // Remove categories with no patients
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4">Clinical Status Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}> {/* Vertical layout for horizontal bars */}
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} /> {/* X axis as percentage */}
            <YAxis type="category" dataKey="name" /> {/* Y axis shows status names */}
            <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} /> {/* Format tooltip */}
            <Bar dataKey="percent" fill="#9bc200" radius={[0, 4, 4, 0]}> {/* Single bar with custom radius */}
              {/* Individual colors per segment */}
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