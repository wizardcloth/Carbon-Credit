import { useState, useEffect } from "react";
import { CheckCircle, Eye, Download, MapPin, Calendar, TrendingUp } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createHeader } from "@/authProvider/authProvider";

interface ApprovedProject {
  _id: string;
  farmerName: string;
  landArea: number;
  village: string;
  district: string;
  state: string;
  waterRegimeDuringCultivation: string;
  emissionData?: {
    emission_reduction?: {
      carbon_credit_potential_tco2e: number;
      estimated_annual_carbon_credits: number;
    };
  };
  verifiedAt: string;
  verifiedBy?: string;
  createdAt: string;
}

const AdminApproved = () => {
  const [projects, setProjects] = useState<ApprovedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCredits: 0,
    totalLandArea: 0,
  });

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  const fetchApprovedProjects = async () => {
    try {
      const header = await createHeader();     
      const res = await axiosInstance.get("/admin/projects/approved",header);
      if (res.data.success) {
        setProjects(res.data.projects);
        
        // Calculate stats
        const totalCredits = res.data.projects.reduce(
          (sum: number, p: ApprovedProject) =>
            sum + (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0),
          0
        );
        const totalLandArea = res.data.projects.reduce(
          (sum: number, p: ApprovedProject) => sum + p.landArea,
          0
        );

        setStats({
          totalProjects: res.data.projects.length,
          totalCredits,
          totalLandArea,
        });
      }
    } catch (error) {
      console.error("Error fetching approved projects:", error);
      toast.error("Failed to load approved projects");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Farmer Name",
      "Village",
      "District",
      "Land Area (ha)",
      "Carbon Credits (tCO2e)",
      "Water Regime",
      "Approved Date",
    ];

    const rows = projects.map((p) => [
      p.farmerName,
      p.village,
      p.district,
      p.landArea,
      p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e?.toFixed(2) || "N/A",
      p.waterRegimeDuringCultivation,
      new Date(p.verifiedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `approved-projects-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Approved Projects</h2>
              <p className="text-green-100">Verified and ready for carbon credit issuance</p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-green-100 text-sm mb-1">Total Projects</p>
            <p className="text-3xl font-bold">{stats.totalProjects}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-green-100 text-sm mb-1">Total Carbon Credits</p>
            <p className="text-3xl font-bold">{stats.totalCredits.toFixed(2)}</p>
            <p className="text-green-100 text-xs">tonnes CO₂e</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-green-100 text-sm mb-1">Total Land Area</p>
            <p className="text-3xl font-bold">{stats.totalLandArea.toFixed(2)}</p>
            <p className="text-green-100 text-xs">hectares</p>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b-2 border-green-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Farmer Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Land Area
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Carbon Credits
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Water Regime
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Approved Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{project.farmerName}</div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{project.village}</div>
                        <div className="text-xs text-gray-500">{project.district}, {project.state}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {project.landArea} ha
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-bold text-green-700">
                          {project.emissionData?.emission_reduction?.carbon_credit_potential_tco2e?.toFixed(2) || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ≈ {project.emissionData?.emission_reduction?.estimated_annual_carbon_credits || 0} credits
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {project.waterRegimeDuringCultivation.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(project.verifiedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/admin/projects/${project._id}`}
                      className="text-green-600 hover:text-green-900 font-medium text-sm flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No approved projects yet</p>
        </div>
      )}
    </div>
  );
};

export default AdminApproved;
