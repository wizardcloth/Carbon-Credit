import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { createHeader } from "@/authProvider/authProvider";

interface AnalyticsData {
  statusDistribution: { name: string; value: number; }[];
  districtData: { district: string; projects: number; credits: number; }[];
  monthlyTrend: { month: string; projects: number; credits: number; }[];
  waterRegimeDistribution: { regime: string; count: number; }[];
  totalStats: {
    totalProjects: number;
    totalCredits: number;
    totalLandArea: number;
    averageCreditsPerHectare: number;
  };
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const header = await createHeader();
      const res = await axiosInstance.get("/admin/analytics",header);
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">Comprehensive insights into carbon credit projects</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Projects</p>
          <p className="text-4xl font-bold">{analytics.totalStats.totalProjects}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Carbon Credits</p>
          <p className="text-4xl font-bold">{analytics.totalStats.totalCredits.toFixed(1)}</p>
          <p className="text-xs opacity-75">t CO₂e</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Land Area</p>
          <p className="text-4xl font-bold">{analytics.totalStats.totalLandArea.toFixed(1)}</p>
          <p className="text-xs opacity-75">hectares</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Credits/Hectare</p>
          <p className="text-4xl font-bold">
            {analytics.totalStats.averageCreditsPerHectare.toFixed(2)}
          </p>
          <p className="text-xs opacity-75">t CO₂e/ha</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-green-600" />
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={({ name, percent:any }) => `${name}: ${(percent  * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.statusDistribution.map((index:any) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Water Regime Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Water Regime Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.waterRegimeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="regime"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* District-wise Carbon Credits */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Carbon Credits by District (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.districtData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="credits" fill="#10b981" name="Carbon Credits (t CO₂e)" />
              <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Monthly Project Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="projects"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Projects"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="credits"
                stroke="#10b981"
                strokeWidth={2}
                name="Carbon Credits (t CO₂e)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-2 border-green-200">
        <h3 className="font-semibold text-lg mb-4 text-green-900">📊 Key Insights</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>
              Average carbon credit potential per hectare:{" "}
              <strong>{analytics.totalStats.averageCreditsPerHectare.toFixed(2)} t CO₂e/ha</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>
              Most common water regime:{" "}
              <strong>
                {analytics.waterRegimeDistribution[0]?.regime.replace(/_/g, " ")}
              </strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">•</span>
            <span>
              Top performing district:{" "}
              <strong>
                {analytics.districtData[0]?.district} ({analytics.districtData[0]?.credits.toFixed(2)} t CO₂e)
              </strong>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAnalytics;
