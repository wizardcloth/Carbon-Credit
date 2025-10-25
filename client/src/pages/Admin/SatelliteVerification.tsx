import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import axiosInstance from "@/lib/axios";
import {
  Satellite,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import { createHeader } from "@/authProvider/authProvider";
import type { Feature, Polygon } from "geojson";

interface Project {
  _id: string;
  farmerName: string;
  landArea: number;
  village: string;
  district: string;
  waterRegimeDuringCultivation: string;
  boundary: any;
  verificationStatus: string;
}

interface SatelliteData {
  declaredArea: number;
  actualArea: number;
  areaMatch: boolean;
  ndviAverage: number;
  cropDetected: boolean;
  waterDetected: boolean;
  waterRegimeMatch: boolean;
  cultivationPeriod: number;
  lastUpdated: string;
  ndwiAverage: number;
  lswi: number;
  evi: number;
  confidenceScore: number;
  detectionReason: string;
  waterPercentage: number;
  areaMatchPercentage: number;
  waterRegimeReason: string;
}

const SatelliteVerification = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(
    null
  );
  const [verifying, setVerifying] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setSatelliteData(null);
    setMapKey((prev) => prev + 1);
  }, [selectedProject]);

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
      console.error("Error fetching projects:", error);
    }
  };

  const verifySatelliteData = async (projectId: string) => {
    setVerifying(true);
    try {
      const header = await createHeader();
      const res = await axiosInstance.post(
        `/admin/verify-satellite/${projectId}`,
        {},
        header
      );

      if (res.data.success) {
        setSatelliteData(res.data.verification);
        toast.success("Satellite verification completed!");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedProject) return;

    try {
      const header = await createHeader();
      await axiosInstance.post(
        `/admin/projects/${selectedProject._id}/approve`,
        {},
        header
      );
      toast.success("Project approved!");
      fetchPendingProjects();
      setSelectedProject(null);
      setSatelliteData(null);
    } catch (error) {
      toast.error("Failed to approve project");
    }
  };

  const handleReject = async () => {
    if (!selectedProject) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const header = await createHeader();
      await axiosInstance.post(
        `/admin/projects/${selectedProject._id}/reject`,
        { reason },
        header
      );
      toast.success("Project rejected");
      fetchPendingProjects();
      setSelectedProject(null);
      setSatelliteData(null);
    } catch (error) {
      toast.error("Failed to reject project");
    }
  };

  // Helper function to interpret NDVI
  const getNDVIInterpretation = (ndvi: number) => {
    if (ndvi < 0.2) return "Bare soil/No vegetation";
    if (ndvi < 0.3) return "Sparse vegetation";
    if (ndvi < 0.4) return "Low vegetation";
    if (ndvi < 0.6) return "Moderate vegetation";
    if (ndvi < 0.8) return "Healthy vegetation";
    return "Dense vegetation/Forest";
  };

  const polygonCoords =
    selectedProject?.boundary?.geometry?.coordinates?.[0]?.map(
      (coord: number[]) => [coord[1], coord[0]]
    );

  const validGeoJson: Feature<Polygon> | null = selectedProject?.boundary
    ? {
        type: "Feature",
        geometry: selectedProject.boundary.geometry,
        properties: {},
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Satellite className="h-6 w-6 mr-2 text-indigo-600" />
          Satellite Verification Dashboard
        </h2>
        <p className="text-gray-600">
          Verify farmer-submitted data using Google Earth Engine and Sentinel
          satellite imagery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 max-h-[600px] overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">
            Pending Verification ({projects.length})
          </h3>
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => setSelectedProject(project)}
              className={`w-full text-left p-4 rounded-lg mb-2 transition-all ${
                selectedProject?._id === project._id
                  ? "bg-indigo-50 border-2 border-indigo-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold text-gray-900">
                {project.farmerName}
              </p>
              <p className="text-sm text-gray-600">
                {project.village}, {project.district}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Area: {project.landArea} ha
              </p>
            </button>
          ))}
        </div>

        {/* Map & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <>
              {/* Map */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    Field Boundary - {selectedProject.farmerName}
                  </h3>
                  <button
                    onClick={() => verifySatelliteData(selectedProject._id)}
                    disabled={verifying}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Satellite className="h-4 w-4" />
                        Verify with Satellite
                      </>
                    )}
                  </button>
                </div>

                <div className="h-[400px] rounded-lg overflow-hidden">
                  {selectedProject.boundary &&
                    polygonCoords &&
                    validGeoJson && (
                      <MapContainer
                        key={mapKey}
                        bounds={polygonCoords}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <GeoJSON
                          key={selectedProject._id}
                          data={validGeoJson}
                          style={{
                            color: "red",
                            weight: 2,
                            fillColor: "yellow",
                            fillOpacity: 0.45,
                          }}
                        />
                      </MapContainer>
                    )}
                </div>
              </div>

              {/* Verification Results */}
              {satelliteData && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Verification Results
                  </h3>

                  {/* Detection Reason Banner */}
                  <div
                    className={`mb-4 p-4 rounded-lg border-2 ${
                      satelliteData.cropDetected
                        ? "bg-green-50 border-green-300"
                        : "bg-yellow-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Info
                        className={`h-5 w-5 mt-0.5 ${
                          satelliteData.cropDetected
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <div>
                        <p
                          className={`font-semibold ${
                            satelliteData.cropDetected
                              ? "text-green-900"
                              : "text-yellow-900"
                          }`}
                        >
                          {satelliteData.detectionReason}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Confidence Score: {satelliteData.confidenceScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Area Verification */}
                    <VerificationCard
                      title="Area Verification"
                      declared={`${satelliteData.declaredArea} ha`}
                      actual={`${satelliteData.actualArea} ha`}
                      match={satelliteData.areaMatch}
                      extra={`Difference: ${satelliteData.areaMatchPercentage}%`}
                    />

                    {/* Rice Crop Detection */}
                    <VerificationCard
                      title="Rice Crop Detection"
                      declared="Rice"
                      actual={
                        satelliteData.cropDetected
                          ? `Rice Detected (${satelliteData.confidenceScore.toFixed(
                              0
                            )}%)`
                          : "No Rice"
                      }
                      match={satelliteData.cropDetected}
                      extra={`LSWI: ${satelliteData.lswi.toFixed(
                        2
                      )} | EVI: ${satelliteData.evi.toFixed(2)}`}
                    />

                    {/* Water Regime */}
                    <VerificationCard
                      title="Water Regime"
                      declared={selectedProject.waterRegimeDuringCultivation.replace(
                        /_/g,
                        " "
                      )}
                      actual={
                        satelliteData.waterDetected
                          ? `Water: ${satelliteData.waterPercentage.toFixed(
                              1
                            )}%`
                          : "Dry/No Water"
                      }
                      match={satelliteData.waterRegimeMatch}
                      extra={satelliteData.waterRegimeReason}
                    />

                    {/* NDVI (Informational - not used for rice detection) */}
                    <VerificationCard
                      title="NDVI (Vegetation Index)"
                      declared="Reference Only"
                      actual={`${satelliteData.ndviAverage.toFixed(2)}`}
                      match={true} // Always show as info, not pass/fail
                      extra={getNDVIInterpretation(satelliteData.ndviAverage)}
                      isInfo={true} // New prop to style differently
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Approve Project
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      Reject Project
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Satellite className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a project to verify</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VerificationCard = ({
  title,
  declared,
  actual,
  match,
  extra,
  isInfo = false,
}: {
  title: string;
  declared: string;
  actual: string;
  match: boolean;
  extra?: string;
  isInfo?: boolean;
}) => (
  <div
    className={`p-4 rounded-lg border-2 ${
      isInfo
        ? "border-blue-300 bg-blue-50" // Info style for NDVI
        : match
        ? "border-green-300 bg-green-50"
        : "border-red-300 bg-red-50"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      {isInfo ? (
        <Info className="h-5 w-5 text-blue-600" />
      ) : match ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-red-600" />
      )}
    </div>
    <div className="space-y-1 text-sm">
      <p className="text-gray-600">
        Declared: <span className="font-medium">{declared}</span>
      </p>
      <p className="text-gray-600">
        Detected: <span className="font-medium">{actual}</span>
      </p>
      {extra && (
        <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-300">
          {extra}
        </p>
      )}
    </div>
  </div>
);

export default SatelliteVerification;
