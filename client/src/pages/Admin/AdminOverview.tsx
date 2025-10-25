// AdminOverview.tsx
import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  DollarSign,
  Leaf,
  ArrowRight,
  AlertCircle,
  Calendar,
  Satellite,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import {
  // LineChart,
  // Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { createHeader } from "@/authProvider/authProvider";

interface Stats {
  totalUsers: number;
  totalProjects: number;
  pendingProjects: number;
  approvedProjects: number;
  rejectedProjects: number;
  totalCarbonCredits: number;
  totalLandArea: number;
  totalPotentialRevenue: number;
  averageCreditsPerProject: number;
}

interface RecentProject {
  _id: string;
  farmerName: string;
  landArea: number;
  district: string;
  verificationStatus: string;
  emissionData?: {
    emission_reduction?: {
      carbon_credit_potential_tco2e: number;
    };
  };
  createdAt: string;
}

interface TrendData {
  month: string;
  projects: number;
  credits: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    rejectedProjects: 0,
    totalCarbonCredits: 0,
    totalLandArea: 0,
    totalPotentialRevenue: 0,
    averageCreditsPerProject: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const header = await createHeader();
      const res = await axiosInstance.get("/admin/overview",header);
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentProjects(res.data.recentProjects || []);
        setTrendData(res.data.trendData || []);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/users",
      change: "+12%",
      changePositive: true,
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: <FileText className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/projects",
      change: "+8%",
      changePositive: true,
    },
    {
      title: "Pending Review",
      value: stats.pendingProjects,
      icon: <Clock className="h-8 w-8" />,
      color: "from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/admin/pending",
      change: "-5%",
      changePositive: true,
    },
    {
      title: "Approved",
      value: stats.approvedProjects,
      icon: <CheckCircle className="h-8 w-8" />,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/approved",
      change: "+15%",
      changePositive: true,
    },
    {
      title: "Carbon Credits",
      value: `${stats.totalCarbonCredits.toFixed(1)}`,
      subtitle: "t CO₂e",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/analytics",
      change: "+22%",
      changePositive: true,
    },
    {
      title: "Total Land Area",
      value: `${stats.totalLandArea.toFixed(1)}`,
      subtitle: "hectares",
      icon: <MapPin className="h-8 w-8" />,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      link: "/admin/projects",
      change: "+10%",
      changePositive: true,
    },
  ];

  const statusDistribution = [
    { name: "Pending", value: stats.pendingProjects, color: "#f59e0b" },
    { name: "Approved", value: stats.approvedProjects, color: "#10b981" },
    { name: "Rejected", value: stats.rejectedProjects, color: "#ef4444" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-green-600 to-emerald-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-green-100 text-lg">
              Monitor and manage carbon credit verification in real-time
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-green-300 group">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${card.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform`}
                >
                  <div className={card.textColor}>{card.icon}</div>
                </div>
                {card.change && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      card.changePositive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {card.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                {card.subtitle && (
                  <span className="text-sm text-gray-500">{card.subtitle}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Project Trends (Last 6 Months)
            </h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="projects"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorProjects)"
                name="Projects"
              />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCredits)"
                name="Carbon Credits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {statusDistribution.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/pending"
              className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Review Pending Projects
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.pendingProjects} projects waiting
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/satellite"
              className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2 rounded-lg">
                  <Satellite className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Satellite Verification
                  </p>
                  <p className="text-sm text-gray-600">
                    Verify field boundaries
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">
                    Detailed insights & reports
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalUsers} registered users
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Recent Submissions
            </h3>
            <Link
              to="/admin/projects"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                to={`/admin/projects/${project._id}`}
                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {project.farmerName}
                  </p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.verificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : project.verificationStatus === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {project.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {project.landArea} ha
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {project.emissionData?.emission_reduction && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {project.emissionData.emission_reduction.carbon_credit_potential_tco2e.toFixed(
                      2
                    )}{" "}
                    t CO₂e
                  </div>
                )}
              </Link>
            ))}

            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No recent projects</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-2 border-green-200">
        <h3 className="font-semibold text-lg mb-4 text-green-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Potential Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.totalCarbonCredits * 100).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">@ ₹100 per credit</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Credits/Project</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageCreditsPerProject.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">t CO₂e per project</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects > 0
                    ? (
                        (stats.approvedProjects / stats.totalProjects) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500">of total submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {stats.pendingProjects > 10 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">Action Required</p>
              <p className="text-sm text-yellow-800">
                You have {stats.pendingProjects} projects pending verification.
                Please review them to avoid delays.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
