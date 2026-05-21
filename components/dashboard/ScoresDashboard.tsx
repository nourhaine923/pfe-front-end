"use client"; // Next.js directive for client-side rendering - this component uses browser APIs, charts, and interactive features

import React, { useEffect, useState } from "react"; // React core imports for component and state management
import { useRouter } from "next/navigation"; // Next.js router for programmatic navigation to detail pages
// Recharts components for data visualization
import {
  XAxis,           // X-axis component for charts
  YAxis,           // Y-axis component for charts
  Tooltip,         // Hover tooltip for chart data points
  CartesianGrid,   // Background grid lines for charts
  ResponsiveContainer, // Makes charts responsive to parent container size
  BarChart,        // Bar chart component for comparisons
  Bar,             // Individual bar element in bar chart
  Legend,          // Color legend for chart series
  AreaChart,       // Area chart for trends over time
  Area             // Area element for AreaChart
} from "recharts";
// Lucide icons for visual elements and UI components
import { 
  TrendingUp,     // Icon for average/trend statistics
  Target,         // Icon for scores/goals
  Zap,            // Icon for urgency/energy (used for Transplant Urgency)
  Activity,       // Icon for medical activity (used for Follow-up Risk)
  Calendar,       // Icon for date/time (used in monthly chart)
  Trophy,         // Icon for top scores/leaderboard
  Eye             // Icon for view details button
} from "lucide-react";
import api from "@/services/api"; // API service for backend HTTP requests

// TypeScript interface for detailed score data from individual transplantations
interface DetailedScoreData {
  transplantationId: string;    // Unique ID of the transplantation
  transplantNumber: string;      // Human-readable transplant number/identifier
  patientName: string;           // Full name of the patient
  patientId: string;             // Patient's unique identifier
  transplantDate: string;        // Date when transplant occurred
  score1: number;                // SCORE_1: Transplant Urgency Score (0-100)
  score2: number;                // SCORE_2: Follow-up Risk Score (0-100)
  score3: number;                // SCORE_3: Success Probability Score (0-100)
}

// TypeScript interface for monthly aggregated score data
interface MonthlyAverageData {
  month: string;                 // Human-readable month label (e.g., "Jan 2024")
  monthKey: string;              // Sortable month key (e.g., "2024-01")
  avgTransplantUrgency: number;  // Average urgency score for the month
  avgFollowUpRisk: number;       // Average risk score for the month
  avgSuccessProbability: number; // Average success probability for the month
  count: number;                 // Number of transplantations that month
}

// Main component for displaying clinical scores dashboard
export default function ScoresDashboard() {
  const router = useRouter(); // Initialize router for navigation
  // State management
  const [detailedScores, setDetailedScores] = useState<DetailedScoreData[]>([]); // All individual scores
  const [monthlyData, setMonthlyData] = useState<MonthlyAverageData[]>([]); // Monthly aggregated data
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [selectedScore, setSelectedScore] = useState<"transplantUrgency" | "followUpRisk" | "successProbability">("transplantUrgency"); // Currently selected score type

  // Effect hook - fetches score data when component mounts
  useEffect(() => {
    fetchScoreData(); // Initial data load
  }, []); // Empty dependency array = run once on mount

  // Fetches all score data from backend API
  const fetchScoreData = async () => {
    try {
      setLoading(true); // Show loading state
      
      // Fetch transplantations (limit 100 for performance)
      const txRes = await api.get("/transplantations", { params: { limit: 100 } });
      const transplantations = txRes.data?.data || txRes.data || []; // Handle both response structures
      
      const scoresData: DetailedScoreData[] = []; // Array to store processed scores
      
      // Iterate through each transplantation to fetch associated scores
      for (const tx of transplantations) {
        let patientName = "Unknown Patient"; // Default patient name
        let patientId = ""; // Default patient ID
        
        // Extract patient information from different possible data structures
        if (tx.recipient) {
          // Case 1: Recipient object is populated
          patientName = `${tx.recipient.firstName} ${tx.recipient.lastName}`;
          patientId = tx.recipient._id;
        } else if (tx.recipient_id) {
          // Case 2: Only recipient ID is available - need to fetch patient data
          patientId = tx.recipient_id;
          try {
            const recipientRes = await api.get(`/patients/${tx.recipient_id}`);
            const recipient = recipientRes.data;
            patientName = `${recipient.firstName} ${recipient.lastName}`;
          } catch (err) {
            console.error("Error fetching recipient:", err);
          }
        }
        
        // Fetch score history for this transplantation
        const scoresRes = await api.get(`/scores/history/${tx._id}`);
        const scores = scoresRes.data || [];
        
        // Find specific score types in the response
        const score1 = scores.find((s: any) => s.score_type === "SCORE_1"); // Transplant Urgency
        const score2 = scores.find((s: any) => s.score_type === "SCORE_2"); // Follow-up Risk
        const score3 = scores.find((s: any) => s.score_type === "SCORE_3"); // Success Probability
        
        // Push processed score data to array
        scoresData.push({
          transplantationId: tx._id,
          transplantNumber: tx.transplantNumber || tx._id.slice(-6), // Use last 6 chars of ID as fallback
          patientName: patientName,
          patientId: patientId,
          transplantDate: tx.transplantDate,
          score1: score1?.value || 0, // Default to 0 if no score
          score2: score2?.value || 0,
          score3: score3?.value || 0
        });
      }
      
      setDetailedScores(scoresData); // Store all individual scores
      
      // Process data to calculate monthly averages
      const monthlyMap = new Map<string, MonthlyAverageData>();
      
      scoresData.forEach((score) => {
        if (!score.transplantDate) return; // Skip if no transplant date
        
        // Extract year and month from transplant date
        const date = new Date(score.transplantDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: "2024-01"
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // Format: "Jan 2024"
        
        // Initialize monthly entry if not exists
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: monthLabel,
            monthKey: monthKey,
            avgTransplantUrgency: 0,
            avgFollowUpRisk: 0,
            avgSuccessProbability: 0,
            count: 0
          });
        }
        
        // Accumulate scores for this month
        const entry = monthlyMap.get(monthKey)!;
        entry.avgTransplantUrgency += score.score1;
        entry.avgFollowUpRisk += score.score2;
        entry.avgSuccessProbability += score.score3;
        entry.count++;
      });
      
      // Calculate averages for each month
      const monthlyArray: MonthlyAverageData[] = [];
      for (const [_, entry] of monthlyMap) {
        monthlyArray.push({
          ...entry,
          avgTransplantUrgency: entry.count > 0 ? Math.round(entry.avgTransplantUrgency / entry.count) : 0,
          avgFollowUpRisk: entry.count > 0 ? Math.round(entry.avgFollowUpRisk / entry.count) : 0,
          avgSuccessProbability: entry.count > 0 ? Math.round(entry.avgSuccessProbability / entry.count) : 0
        });
      }
      
      // Sort months chronologically
      monthlyArray.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      setMonthlyData(monthlyArray);
      
    } catch (error) {
      console.error("Error fetching score data:", error); // Log error to console
    } finally {
      setLoading(false); // Always clear loading state
    }
  };

  // Returns top N scores for the selected score type
  const getTopScores = (scoreType: "transplantUrgency" | "followUpRisk" | "successProbability", limit: number = 10): DetailedScoreData[] => {
    // Map score type to the corresponding field in DetailedScoreData
    const scoreKey = scoreType === "transplantUrgency" ? "score1" : scoreType === "followUpRisk" ? "score2" : "score3";
    // Sort descending by score and take first 'limit' items
    return [...detailedScores]
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, limit);
  };

  // Calculates statistics (average, min, max) for the selected score type
  const getStatistics = (scoreType: "transplantUrgency" | "followUpRisk" | "successProbability") => {
    const scoreKey = scoreType === "transplantUrgency" ? "score1" : scoreType === "followUpRisk" ? "score2" : "score3";
    const values = detailedScores.map(s => s[scoreKey]).filter(v => v > 0); // Filter out zero values
    
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, total: 0 }; // No data available
    }
    
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length); // Calculate average
    const max = Math.max(...values); // Find maximum value
    const min = Math.min(...values); // Find minimum value
    
    return { avg, min, max, total: values.length }; // Return statistics
  };

  // Returns chart color for each score type
  const getScoreColor = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "#ef4444"; // Red for urgency (high risk)
      case "followUpRisk": return "#8b5cf6";      // Purple for risk
      case "successProbability": return "#14b8a6"; // Teal for success (positive)
      default: return "#6b7280"; // Gray default
    }
  };

  // Returns background color class for badge/stats cards
  const getScoreBgColor = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "bg-red-100 text-red-700";
      case "followUpRisk": return "bg-purple-100 text-purple-700";
      case "successProbability": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Returns full display label for score type
  const getScoreLabel = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "Transplant Urgency Score";
      case "followUpRisk": return "Follow-up Risk Score";
      case "successProbability": return "Success Probability Score";
      default: return "Score";
    }
  };

  // Returns short label for score type (used in UI)
  const getShortLabel = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "Urgency";
      case "followUpRisk": return "Risk";
      case "successProbability": return "Success";
      default: return "Score";
    }
  };

  // Determines risk/level category based on score value
  const getScoreLevel = (score: number, scoreType: string) => {
    if (scoreType === "successProbability") {
      // For success probability: higher is better
      if (score >= 70) return { label: "High", color: "text-green-600", bg: "bg-green-100" };
      if (score >= 50) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" };
      return { label: "Low", color: "text-red-600", bg: "bg-red-100" };
    } else {
      // For urgency/risk scores: higher is worse
      if (score >= 70) return { label: "High Risk", color: "text-red-600", bg: "bg-red-100" };
      if (score >= 50) return { label: "Moderate Risk", color: "text-yellow-600", bg: "bg-yellow-100" };
      return { label: "Low Risk", color: "text-green-600", bg: "bg-green-100" };
    }
  };

  // Navigates to transplantation details page
  const handleViewDetails = (transplantationId: string) => {
    router.push(`/transplantations/${transplantationId}`);
  };

  // Get statistics and top scores for the selected score type
  const stats = getStatistics(selectedScore);
  const topScores = getTopScores(selectedScore, 10);

  // Loading state - shows spinner while data is being fetched
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading score data...</p>
      </div>
    );
  }

  // Main render - displays the complete dashboard
  return (
    <div className="space-y-6">
      {/* Score Selector - Toggle buttons for different score types */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {[
            { value: "transplantUrgency", label: "Transplant Urgency", color: "red", icon: Zap },
            { value: "followUpRisk", label: "Follow-up Risk", color: "purple", icon: Activity },
            { value: "successProbability", label: "Success Probability", color: "teal", icon: Target }
          ].map((score) => (
            <button
              key={score.value}
              onClick={() => setSelectedScore(score.value as any)}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedScore === score.value
                  ? `bg-${score.color}-600 text-white` // Active button style
                  : "text-gray-600 hover:bg-gray-100" // Inactive button style
              }`}
            >
              <score.icon className="h-4 w-4" />
              {score.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards - Key metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${getScoreBgColor(selectedScore)}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average {getShortLabel(selectedScore)} Score</p>
              <p className="text-2xl font-bold text-gray-800">{stats.avg}</p>
              <p className="text-xs text-gray-400">Based on {stats.total} transplantations</p>
            </div>
          </div>
        </div>
        
        {/* Highest Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-green-100 text-green-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Score</p>
              <p className="text-2xl font-bold text-gray-800">{stats.max}</p>
              <p className="text-xs text-gray-400">Maximum value recorded</p>
            </div>
          </div>
        </div>
        
        {/* Lowest Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-yellow-100 text-yellow-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lowest Score</p>
              <p className="text-2xl font-bold text-gray-800">{stats.min}</p>
              <p className="text-xs text-gray-400">Minimum value recorded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Average Chart - Area chart showing trends over time */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Monthly Average {getShortLabel(selectedScore)} Score
            </h2>
            <p className="text-sm text-gray-500">Average score values per month</p>
          </div>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              {/* Gradient definition for area fill */}
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getScoreColor(selectedScore)} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getScoreColor(selectedScore)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Dashed grid lines */}
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} /> {/* Months on X axis */}
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fontSize: 12 }}
                domain={[0, 100]} // Fixed domain 0-100 for scores
                label={{ value: "Score", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Area
                type="monotone" // Smooth curve between points
                dataKey={
                  selectedScore === "transplantUrgency" ? "avgTransplantUrgency" :
                  selectedScore === "followUpRisk" ? "avgFollowUpRisk" : "avgSuccessProbability"
                }
                name={getScoreLabel(selectedScore)}
                stroke={getScoreColor(selectedScore)}
                fill={getScoreColor(selectedScore)}
                fillOpacity={0.1} // Semi-transparent fill
                strokeWidth={2}
                dot={{ fill: getScoreColor(selectedScore), r: 4 }} // Data points
                activeDot={{ r: 6 }} // Larger dot on hover
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Empty state - shown when no monthly data */}
        {monthlyData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No monthly data available</p>
          </div>
        )}
      </div>

      {/* All Scores Comparison - Bar chart showing individual transplant scores */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {getScoreLabel(selectedScore)} - All Transplantations
            </h3>
            <p className="text-sm text-gray-500">
              Score distribution across all transplantations
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={detailedScores.slice(-15)} // Show last 15 transplants
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="transplantNumber" 
                stroke="#9ca3af" 
                tick={{ fontSize: 10 }}
                angle={-45} // Rotate labels for readability
                textAnchor="end"
                height={70}
                interval={0} // Show all labels
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#9ca3af" 
                tick={{ fontSize: 12 }}
                label={{ value: "Score", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
              />
              <Tooltip 
                formatter={(value) => [`${value}`, getScoreLabel(selectedScore)]}
                labelFormatter={(label) => `Transplant: ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar 
                dataKey={selectedScore === "transplantUrgency" ? "score1" : selectedScore === "followUpRisk" ? "score2" : "score3"} 
                name={getScoreLabel(selectedScore)} 
                fill={getScoreColor(selectedScore)} 
                radius={[4, 4, 0, 0]} // Rounded top corners
                label={{ position: 'top', fontSize: 11, fill: '#374151' }} // Show values above bars
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Empty state for no scores */}
        {detailedScores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No score data available</p>
          </div>
        )}

        {/* Summary statistics footer */}
        {detailedScores.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
            <div className="text-center flex-1">
              <p className="text-gray-400">Highest</p>
              <p className="font-bold text-gray-800">{stats.max}</p>
            </div>
            <div className="text-center flex-1 border-x border-gray-100">
              <p className="text-gray-400">Average</p>
              <p className="font-bold text-gray-800">{stats.avg}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-400">Lowest</p>
              <p className="font-bold text-gray-800">{stats.min}</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Scores Table - Leaderboard of highest scoring transplantations */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Top {getShortLabel(selectedScore)} Scores
              </h3>
              <p className="text-sm text-gray-500">
                Highest {getScoreLabel(selectedScore)} values - Click the eye button to view transplantation details
              </p>
            </div>
            <Trophy className="h-6 w-6 text-teal-500" /> {/* Trophy icon for top scores */}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transplantation #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transplant Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topScores.map((item, idx) => {
                // Get the score value based on selected score type
                const scoreValue = selectedScore === "transplantUrgency" ? item.score1 : selectedScore === "followUpRisk" ? item.score2 : item.score3;
                const level = getScoreLevel(scoreValue, selectedScore); // Determine risk level
                return (
                  <tr key={item.transplantationId} className="hover:bg-gray-50 transition-colors">
                    {/* Rank column with circular badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {item.transplantNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xl font-bold text-gray-800">
                        {scoreValue}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.bg} ${level.color}`}>
                        {level.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.transplantDate ? new Date(item.transplantDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(item.transplantationId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                        title="View Transplantation Details"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Empty state for no scores */}
              {topScores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="h-12 w-12 text-gray-300" />
                      <p>No score data available</p>
                      <p className="text-xs">Click "Calculate" on a transplantation to generate scores</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer showing count of displayed scores */}
        {topScores.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing top {topScores.length} of {detailedScores.length} transplantations
          </div>
        )}
      </div>
    </div>
  );
}