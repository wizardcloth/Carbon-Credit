import { useState, useEffect } from "react";
import { Clock, Eye } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Link } from "react-router-dom";
import { createHeader } from "@/authProvider/authProvider";

interface PendingProject {
  _id: string;
  farmerName: string;
  landArea: number;
  village: string;
  district: string;
  waterRegimeDuringCultivation: string;
  createdAt: string;
}

const AdminPending = () => {
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const header = await createHeader();
      const res = await axiosInstance.get("/admin/projects/pending", header);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      console.error("Error fetching pending projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Verification
          </h2>
        </div>
        <p className="text-gray-600">
          {projects.length} project(s) waiting for verification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {project.farmerName}
              </h3>
              <p className="text-sm text-gray-600">
                {project.village}, {project.district}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Area: {project.landArea} hectares
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>

            <Link
              to={`/admin/projects/${project._id}`}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Review Project
            </Link>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending projects</p>
        </div>
      )}
    </div>
  );
};

export default AdminPending;
