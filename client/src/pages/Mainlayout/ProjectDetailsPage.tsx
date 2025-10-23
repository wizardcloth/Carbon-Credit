import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axiosInstance from "@/lib/axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Leaf,
  Droplets,
  TrendingDown,
  TrendingUp,
  BadgeCheck,
  Clock,
  User,
  Phone,
  CreditCard,
  FileText,
  Download,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

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
  boundary?: any;
  emissionData?: {
    tier: number;
    baseline_emissions?: {
      scenario: string;
      daily_ef_kg_ha_day: number;
      total_ch4_emissions_kg: number;
      co2_equivalent_tons: number;
      scaling_factors: any;
    };
    project_emissions?: {
      scenario: string;
      daily_ef_kg_ha_day: number;
      total_ch4_emissions_kg: number;
      co2_equivalent_tons: number;
      scaling_factors: any;
    };
    emission_reduction?: {
      gross_reduction_tco2e: number;
      uncertainty_deduction: string;
      net_reduction_tco2e: number;
      reduction_percentage: string;
      carbon_credit_potential_tco2e: number;
      estimated_annual_carbon_credits: number;
    };
    ipcc_reference?: string;
    gold_standard_reference?: string;
    notes?: string[];
  };
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && projectId) {
      fetchProjectDetails();
    }
  }, [user, projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/farmers/${user?.uid}/projects/${projectId}`
      );

      if (res.data.success) {
        setProject(res.data.project);
      } else {
        toast.error("Failed to load project details");
        navigate("/Dashboard");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
      navigate("/Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100 border-green-300";
      case "pending":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "rejected":
        return "text-red-600 bg-red-100 border-red-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getWaterRegimeDisplay = (regime: string) => {
    const regimeMap: { [key: string]: string } = {
      continuously_flooded: "Continuously Flooded",
      single_drainage: "Single Drainage (AWD)",
      multiple_drainage_awd: "Multiple Drainage / AWD",
      regular_rainfed: "Regular Rainfed",
    };
    return regimeMap[regime] || regime.replace(/_/g, " ");
  };

  const getPreSeasonDisplay = (regime: string) => {
    const regimeMap: { [key: string]: string } = {
      non_flooded_less_180: "Non-flooded < 180 days (Double cropping)",
      non_flooded_more_180: "Non-flooded > 180 days (Single cropping)",
      flooded_more_30: "Flooded > 30 days before cultivation",
      non_flooded_more_365: "Non-flooded > 365 days (Upland-paddy rotation)",
    };
    return regimeMap[regime] || regime.replace(/_/g, " ");
  };

  const handleDownloadReport = () => {
    toast.success("Report download feature coming soon!");
  };

  const handleShareProject = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/Dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShareProject}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={handleDownloadReport}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Project Title & Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              {project.farmerName}'s Rice Cultivation Project
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {project.village ? `${project.village}, ` : ""}
              {project.district}, {project.state}
            </p>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <FileText className="h-4 w-4" />
              Survey No: {project.landSurveyNumber}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(
                project.verificationStatus
              )}`}
            >
              {getStatusText(project.verificationStatus)}
            </span>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" />
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Farmer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Aadhar Number
              </p>
              <p className="font-semibold font-mono">
                {project.aadharNumber.replace(
                  /(\d{4})(\d{4})(\d{4})/,
                  "$1 $2 $3"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Land & Cultivation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Land Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Land Area</p>
                <p className="text-2xl font-bold text-green-700">
                  {project.landArea.toFixed(2)}{" "}
                  <span className="text-sm">ha</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Cultivation Period
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {project.cultivationPeriod}{" "}
                  <span className="text-sm">days</span>
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Survey Number</p>
              <p className="font-mono font-semibold bg-gray-100 p-2 rounded">
                {project.landSurveyNumber}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Water Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Water Regime During Cultivation
              </p>
              <p className="font-semibold text-blue-700">
                {getWaterRegimeDisplay(project.waterRegimeDuringCultivation)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Pre-Season Water Regime
              </p>
              <p className="font-semibold text-blue-700">
                {getPreSeasonDisplay(project.preSeasonWaterRegime)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organic Amendments */}
      {project.organicAmendments && project.organicAmendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🌱 Organic Amendments Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.organicAmendments.map((amendment, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"
                >
                  <p className="font-semibold text-yellow-900 capitalize">
                    {amendment.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">
                    {amendment.applicationRate}{" "}
                    <span className="text-sm">t/ha</span>
                  </p>
                  {amendment.type === "straw" && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Applied {amendment.timing === "short" ? "< 30" : "> 30"}{" "}
                      days before cultivation
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emission Data - Only if Tier 2 */}
      {project.emissionData?.tier === 2 &&
        project.emissionData.emission_reduction && (
          <>
            {/* Carbon Credit Potential - Hero Card */}
            <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-none">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-green-100 text-lg mb-2">
                    💰 Carbon Credit Potential
                  </p>
                  <p className="text-6xl font-bold mb-2">
                    {
                      project.emissionData.emission_reduction
                        .carbon_credit_potential_tco2e
                    }
                  </p>
                  <p className="text-2xl text-green-100 mb-4">tonnes CO₂e</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
                    <p className="text-sm mb-1">
                      Estimated Annual Carbon Credits
                    </p>
                    <p className="text-3xl font-bold">
                      {
                        project.emissionData.emission_reduction
                          .estimated_annual_carbon_credits
                      }
                    </p>
                    <p className="text-xs text-green-100 mt-1">
                      (1 Carbon Credit = 1 tonne CO₂e)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emission Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Baseline Emissions */}
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Baseline Emissions
                  </CardTitle>
                  <CardDescription>Business-as-usual scenario</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-600 mb-2">
                    {
                      project.emissionData.baseline_emissions
                        ?.co2_equivalent_tons
                    }
                  </p>
                  <p className="text-sm text-gray-600">t CO₂e</p>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs text-gray-600">
                      Daily EF:{" "}
                      {
                        project.emissionData.baseline_emissions
                          ?.daily_ef_kg_ha_day
                      }{" "}
                      kg CH₄/ha/day
                    </p>
                    <p className="text-xs text-gray-600">
                      Total CH₄:{" "}
                      {
                        project.emissionData.baseline_emissions
                          ?.total_ch4_emissions_kg
                      }{" "}
                      kg
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Emissions */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Project Emissions
                  </CardTitle>
                  <CardDescription>With improved practices</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {
                      project.emissionData.project_emissions
                        ?.co2_equivalent_tons
                    }
                  </p>
                  <p className="text-sm text-gray-600">t CO₂e</p>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs text-gray-600">
                      Daily EF:{" "}
                      {
                        project.emissionData.project_emissions
                          ?.daily_ef_kg_ha_day
                      }{" "}
                      kg CH₄/ha/day
                    </p>
                    <p className="text-xs text-gray-600">
                      Total CH₄:{" "}
                      {
                        project.emissionData.project_emissions
                          ?.total_ch4_emissions_kg
                      }{" "}
                      kg
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emission Reduction */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Emission Reduction
                  </CardTitle>
                  <CardDescription>Net reduction achieved</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {
                      project.emissionData.emission_reduction
                        .reduction_percentage
                    }
                  </p>
                  <p className="text-sm text-gray-600">reduction</p>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs text-gray-600">
                      Gross:{" "}
                      {
                        project.emissionData.emission_reduction
                          .gross_reduction_tco2e
                      }{" "}
                      t CO₂e
                    </p>
                    <p className="text-xs text-gray-600">
                      Net:{" "}
                      {
                        project.emissionData.emission_reduction
                          .net_reduction_tco2e
                      }{" "}
                      t CO₂e
                    </p>
                    <p className="text-xs text-yellow-600">
                      Uncertainty deduction:{" "}
                      {
                        project.emissionData.emission_reduction
                          .uncertainty_deduction
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Methodology References */}
            <Card>
              <CardHeader>
                <CardTitle>📚 Methodology & References</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.emissionData.ipcc_reference && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      IPCC Reference:
                    </p>
                    <p className="text-sm text-gray-600">
                      {project.emissionData.ipcc_reference}
                    </p>
                  </div>
                )}
                {project.emissionData.gold_standard_reference && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Gold Standard Reference:
                    </p>
                    <p className="text-sm text-gray-600">
                      {project.emissionData.gold_standard_reference}
                    </p>
                  </div>
                )}
                {project.emissionData.notes &&
                  project.emissionData.notes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        📋 Key Notes:
                      </p>
                      <ul className="space-y-1">
                        {project.emissionData.notes.map((note, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex gap-2"
                          >
                            <span>•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>
          </>
        )}

      {/* Verification Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                project.verificationStatus === "verified"
                  ? "bg-green-100"
                  : project.verificationStatus === "pending"
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              {project.verificationStatus === "verified" ? (
                <BadgeCheck className="h-6 w-6 text-green-600" />
              ) : project.verificationStatus === "pending" ? (
                <Clock className="h-6 w-6 text-yellow-600" />
              ) : (
                <span className="text-red-600 text-xl">✕</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">
                {getStatusText(project.verificationStatus)}
              </p>
              <p className="text-sm text-gray-600">
                {project.verificationStatus === "verified"
                  ? "Your project has been verified and is eligible for carbon credits"
                  : project.verificationStatus === "pending"
                  ? "Your project is under review by our verification team"
                  : "Your project needs revision. Please contact support."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;
