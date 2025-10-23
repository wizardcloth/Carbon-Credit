import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  MapPin,
  User,
  Phone,
  Droplets,
  Leaf,
} from "lucide-react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import { createHeader } from "@/authProvider/authProvider";

interface ProjectDetails {
  _id: string;
  farmerName: string;
  phoneNumber: string;
  aadharNumber: string;
  landSurveyNumber: string;
  village: string;
  district: string;
  state: string;
  landArea: number;
  cultivationPeriod: number;
  waterRegimeDuringCultivation: string;
  preSeasonWaterRegime: string;
  organicAmendments: Array<{
    type: string;
    applicationRate: number;
    timing: string;
  }>;
  boundary: any;
  emissionData?: any;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

const geoJsonStyle = {
  color: "#FF0000", // Red outline
  weight: 3,
  opacity: 1,
  fillColor: "#FFFF00", // Yellow fill
  fillOpacity: 0.3,
};

const onEachFeature = (feature: any, layer: any) => {
  if (feature?.properties?.name) {
    layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
  }
};

const AdminProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (projectId) fetchProjectDetails();
    // eslint-disable-next-line
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const header = await createHeader();
      const res = await axiosInstance.get(
        `/admin/projects/${projectId}`,
        header
      );
      if (res.data.success) setProject(res.data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project details");
      navigate("/admin/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!project) return;
    const confirmed = window.confirm(
      `Are you sure you want to approve ${project.farmerName}'s project?`
    );
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const header = await createHeader();
      const res = await axiosInstance.post(
        `/admin/projects/${projectId}/approve`,
        {},
        header
      );
      if (res.data.success) {
        toast.success("Project approved successfully!");
        navigate("/admin/approved");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to approve project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!project) return;
    const reason = prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      const header = await createHeader();
      const res = await axiosInstance.post(
        `/admin/projects/${projectId}/reject`,
        { reason },
        header
      );
      if (res.data.success) {
        toast.success("Project rejected");
        navigate("/admin/rejected");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reject project");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  if (!project)
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/projects")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Projects
        </button>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(
            project.verificationStatus
          )}`}
        >
          {project.verificationStatus.toUpperCase()}
        </span>
      </div>

      {/* Project Title */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          {project.farmerName}'s Rice Cultivation Project
        </h1>
        <p className="text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {project.village ? `${project.village}, ` : ""}
          {project.district}, {project.state}
        </p>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Farmer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Farmer Name</p>
            <p className="font-semibold">{project.farmerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone Number
            </p>
            <p className="font-semibold">{project.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Aadhar Number</p>
            <p className="font-semibold font-mono">
              {project.aadharNumber.replace(
                /(\d{4})(\d{4})(\d{4})/,
                "$1 $2 $3"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Land & Cultivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Land Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Land Area</p>
              <p className="text-2xl font-bold text-green-700">
                {project.landArea} <span className="text-sm">hectares</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Survey Number</p>
              <p className="font-semibold">{project.landSurveyNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cultivation Period</p>
              <p className="font-semibold">{project.cultivationPeriod} days</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            Water Management
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">During Cultivation</p>
              <p className="font-semibold text-blue-700">
                {project.waterRegimeDuringCultivation.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pre-Season Regime</p>
              <p className="font-semibold text-blue-700">
                {project.preSeasonWaterRegime.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      {project.boundary?.geometry?.coordinates?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Field Boundary</h3>
          <div className="h-[400px] rounded-lg overflow-hidden">
            {(() => {
              const ring = project.boundary.geometry.coordinates[0];
              // center of polygon for map
              const lats = ring.map((c: number[]) => c[1]);
              const lngs = ring.map((c: number[]) => c[0]);
              const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
              const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

              return (
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={17}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  />
                  <GeoJSON
                    key={project._id}
                    data={project.boundary}
                    style={geoJsonStyle}
                    onEachFeature={onEachFeature}
                  />
                </MapContainer>
              );
            })()}
          </div>
        </div>
      )}

      {/* Emission Data */}
      {project.emissionData && project.emissionData.emission_reduction && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-2 border-green-200">
          <h3 className="font-semibold text-xl mb-4 text-green-900">
            Carbon Credit Assessment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-1">Baseline Emissions</p>
              <p className="text-2xl font-bold text-red-700">
                {project.emissionData.baseline_emissions?.co2_equivalent_tons}
              </p>
              <p className="text-xs text-gray-500">t CO₂e</p>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Project Emissions</p>
              <p className="text-2xl font-bold text-blue-700">
                {project.emissionData.project_emissions?.co2_equivalent_tons}
              </p>
              <p className="text-xs text-gray-500">t CO₂e</p>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Reduction</p>
              <p className="text-2xl font-bold text-green-700">
                {project.emissionData.emission_reduction.reduction_percentage}
              </p>
              <p className="text-xs text-gray-500">reduction achieved</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white text-center">
            <p className="text-sm mb-2 opacity-90">
              💰 Carbon Credit Potential
            </p>
            <p className="text-5xl font-bold mb-2">
              {
                project.emissionData.emission_reduction
                  .carbon_credit_potential_tco2e
              }
            </p>
            <p className="text-xl">tonnes CO₂e</p>
            <p className="text-sm mt-3 opacity-90">
              ≈{" "}
              {
                project.emissionData.emission_reduction
                  .estimated_annual_carbon_credits
              }{" "}
              Carbon Credits
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {project.verificationStatus === "pending" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Verification Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <Check className="h-5 w-5" />
              Approve Project
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <X className="h-5 w-5" />
              Reject Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectDetails;
