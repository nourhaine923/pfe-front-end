// components/dashboard/ScoresDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, Target, Zap, Activity, Calendar, Trophy, Eye } from "lucide-react";
import api from "@/services/api";

interface DetailedScoreData {
  transplantationId: string;
  transplantNumber: string;
  patientName: string;
  patientId: string;
  transplantDate: string;
  score1: number;
  score2: number;
  score3: number;
}

interface MonthlyAverageData {
  month: string;
  monthKey: string;
  avgTransplantUrgency: number;
  avgFollowUpRisk: number;
  avgSuccessProbability: number;
  count: number;
}

export default function ScoresDashboard() {
  const router = useRouter();
  const [detailedScores, setDetailedScores] = useState<DetailedScoreData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState<"transplantUrgency" | "followUpRisk" | "successProbability">("transplantUrgency");

  useEffect(() => {
    fetchScoreData();
  }, []);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      
      const txRes = await api.get("/transplantations", { params: { limit: 100 } });
      const transplantations = txRes.data?.data || txRes.data || [];
      
      const scoresData: DetailedScoreData[] = [];
      
      for (const tx of transplantations) {
        let patientName = "Unknown Patient";
        let patientId = "";
        
        if (tx.recipient) {
          patientName = `${tx.recipient.firstName} ${tx.recipient.lastName}`;
          patientId = tx.recipient._id;
        } else if (tx.recipient_id) {
          patientId = tx.recipient_id;
          try {
            const recipientRes = await api.get(`/patients/${tx.recipient_id}`);
            const recipient = recipientRes.data;
            patientName = `${recipient.firstName} ${recipient.lastName}`;
          } catch (err) {
            console.error("Error fetching recipient:", err);
          }
        }
        
        const scoresRes = await api.get(`/scores/history/${tx._id}`);
        const scores = scoresRes.data || [];
        
        const score1 = scores.find((s: any) => s.score_type === "SCORE_1");
        const score2 = scores.find((s: any) => s.score_type === "SCORE_2");
        const score3 = scores.find((s: any) => s.score_type === "SCORE_3");
        
        scoresData.push({
          transplantationId: tx._id,
          transplantNumber: tx.transplantNumber || tx._id.slice(-6),
          patientName: patientName,
          patientId: patientId,
          transplantDate: tx.transplantDate,
          score1: score1?.value || 0,
          score2: score2?.value || 0,
          score3: score3?.value || 0
        });
      }
      
      setDetailedScores(scoresData);
      
      const monthlyMap = new Map<string, MonthlyAverageData>();
      
      scoresData.forEach((score) => {
        if (!score.transplantDate) return;
        
        const date = new Date(score.transplantDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
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
        
        const entry = monthlyMap.get(monthKey)!;
        entry.avgTransplantUrgency += score.score1;
        entry.avgFollowUpRisk += score.score2;
        entry.avgSuccessProbability += score.score3;
        entry.count++;
      });
      
      const monthlyArray: MonthlyAverageData[] = [];
      for (const [_, entry] of monthlyMap) {
        monthlyArray.push({
          ...entry,
          avgTransplantUrgency: entry.count > 0 ? Math.round(entry.avgTransplantUrgency / entry.count) : 0,
          avgFollowUpRisk: entry.count > 0 ? Math.round(entry.avgFollowUpRisk / entry.count) : 0,
          avgSuccessProbability: entry.count > 0 ? Math.round(entry.avgSuccessProbability / entry.count) : 0
        });
      }
      
      monthlyArray.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      setMonthlyData(monthlyArray);
      
    } catch (error) {
      console.error("Error fetching score data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTopScores = (scoreType: "transplantUrgency" | "followUpRisk" | "successProbability", limit: number = 10): DetailedScoreData[] => {
    const scoreKey = scoreType === "transplantUrgency" ? "score1" : scoreType === "followUpRisk" ? "score2" : "score3";
    return [...detailedScores]
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, limit);
  };

  const getStatistics = (scoreType: "transplantUrgency" | "followUpRisk" | "successProbability") => {
    const scoreKey = scoreType === "transplantUrgency" ? "score1" : scoreType === "followUpRisk" ? "score2" : "score3";
    const values = detailedScores.map(s => s[scoreKey]).filter(v => v > 0);
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, total: 0 };
    }
    
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return { avg, min, max, total: values.length };
  };

  const getScoreColor = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "#ef4444";
      case "followUpRisk": return "#8b5cf6";
      case "successProbability": return "#14b8a6";
      default: return "#6b7280";
    }
  };

  const getScoreBgColor = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "bg-red-100 text-red-700";
      case "followUpRisk": return "bg-purple-100 text-purple-700";
      case "successProbability": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreLabel = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "Transplant Urgency Score";
      case "followUpRisk": return "Follow-up Risk Score";
      case "successProbability": return "Success Probability Score";
      default: return "Score";
    }
  };

  const getShortLabel = (scoreType: string) => {
    switch(scoreType) {
      case "transplantUrgency": return "Urgency";
      case "followUpRisk": return "Risk";
      case "successProbability": return "Success";
      default: return "Score";
    }
  };

  const getScoreLevel = (score: number, scoreType: string) => {
    if (scoreType === "successProbability") {
      if (score >= 70) return { label: "High", color: "text-green-600", bg: "bg-green-100" };
      if (score >= 50) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" };
      return { label: "Low", color: "text-red-600", bg: "bg-red-100" };
    } else {
      if (score >= 70) return { label: "High Risk", color: "text-red-600", bg: "bg-red-100" };
      if (score >= 50) return { label: "Moderate Risk", color: "text-yellow-600", bg: "bg-yellow-100" };
      return { label: "Low Risk", color: "text-green-600", bg: "bg-green-100" };
    }
  };

  const handleViewDetails = (transplantationId: string) => {
    router.push(`/transplantations/${transplantationId}`);
  };

  const stats = getStatistics(selectedScore);
  const topScores = getTopScores(selectedScore, 10);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading score data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Selector - Using Actual Names */}
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
                  ? `bg-${score.color}-600 text-white`
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <score.icon className="h-4 w-4" />
              {score.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Monthly Average Chart */}
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
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getScoreColor(selectedScore)} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getScoreColor(selectedScore)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
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
                type="monotone"
                dataKey={
                  selectedScore === "transplantUrgency" ? "avgTransplantUrgency" :
                  selectedScore === "followUpRisk" ? "avgFollowUpRisk" : "avgSuccessProbability"
                }
                name={getScoreLabel(selectedScore)}
                stroke={getScoreColor(selectedScore)}
                fill={getScoreColor(selectedScore)}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ fill: getScoreColor(selectedScore), r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {monthlyData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No monthly data available</p>
          </div>
        )}
      </div>

      {/* All Scores Comparison */}
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
              data={detailedScores.slice(-15)}
              margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="transplantNumber" 
                stroke="#9ca3af" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
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
                radius={[4, 4, 0, 0]} 
                label={{ position: 'top', fontSize: 11, fill: '#374151' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {detailedScores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No score data available</p>
          </div>
        )}

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

      {/* Top Scores Table */}
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
            <Trophy className="h-6 w-6 text-teal-500" />
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
                const scoreValue = selectedScore === "transplantUrgency" ? item.score1 : selectedScore === "followUpRisk" ? item.score2 : item.score3;
                const level = getScoreLevel(scoreValue, selectedScore);
                return (
                  <tr key={item.transplantationId} className="hover:bg-gray-50 transition-colors">
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
        
        {topScores.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing top {topScores.length} of {detailedScores.length} transplantations
          </div>
        )}
      </div>
    </div>
  );
}