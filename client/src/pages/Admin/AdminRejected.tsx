import { useState, useEffect } from "react";
import { XCircle, Eye, MapPin, AlertTriangle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createHeader } from "@/authProvider/authProvider";

interface RejectedProject {
  _id: string;
  farmerName: string;
  landArea: number;
  village: string;
  district: string;
  state: string;
  waterRegimeDuringCultivation: string;
  rejectionReason?: string;
  verifiedAt: string;
  createdAt: string;
}

const AdminRejected = () => {
  const [projects, setProjects] = useState<RejectedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejectedProjects();
  }, []);

  const fetchRejectedProjects = async () => {
    try {
      const header = await createHeader();
      const res = await axiosInstance.get("/admin/projects/rejected",header);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      console.error("Error fetching rejected projects:", error);
      toast.error("Failed to load rejected projects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <XCircle className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">Rejected Projects</h2>
        </div>
        <p className="text-red-700">
          {projects.length} project(s) were rejected during verification
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 border-l-4 border-red-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {project.farmerName}
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {project.village}, {project.district}
                </div>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Land Area:</span>
                <span className="font-medium">{project.landArea} ha</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Water Regime:</span>
                <span className="font-medium text-xs">
                  {project.waterRegimeDuringCultivation.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rejected:</span>
                <span className="font-medium">
                  {new Date(project.verifiedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Rejection Reason */}
            {project.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-900 mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-xs text-red-800">
                      {project.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              to={`/admin/projects/${project._id}`}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Link>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No rejected projects</p>
        </div>
      )}
    </div>
  );
};

export default AdminRejected;
