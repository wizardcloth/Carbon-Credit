import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  TrendingUp,
  Leaf,
  DollarSign,
  Eye,
  MapPin,
  Calendar,
  Droplets,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axiosInstance from "@/lib/axios";

interface Project {
  id: string;
  farmerName: string;
  landSurveyNumber: string;
  village: string;
  district: string;
  state: string;
  landArea: number;
  waterRegime: string;
  tier: number;
  status: string;
  estimatedCredits: number;
  baselineEmissions: number;
  projectEmissions: number;
  reductionPercentage: string;
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  totalCredits: number;
  totalEarnings: number;
  verifiedProjects: number;
  totalLandArea: number;
  totalEmissionReduction: number;
}

const FarmerDashboard: React.FC = () => {
  const [user] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalCredits: 0,
    totalEarnings: 0,
    verifiedProjects: 0,
    totalLandArea: 0,
    totalEmissionReduction: 0,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate("/Dashboard/projects");
  };

  useEffect(() => {
    if (user) {
      // console.log(`user id: ${user?.uid}`);
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/farmers/${user?.uid}/projects`);

      if (res.data.success) {
        const projectsData = res.data.projects;

        // Map projects into the format your dashboard expects
        const fetchedProjects = projectsData.map((p: any) => {
          // Determine tier and extract appropriate data
          const tier = p.emissionData?.tier || 1;
          let estimatedCredits = 0;
          let baselineEmissions = 0;
          let projectEmissions = 0;
          let reductionPercentage = "0";

          if (tier === 2 && p.emissionData?.emission_reduction) {
            // Tier 2 projects with new structure
            estimatedCredits = parseFloat(
              p.emissionData.emission_reduction.carbon_credit_potential_tco2e || 0
            );
            baselineEmissions = parseFloat(
              p.emissionData.baseline_emissions?.co2_equivalent_tons || 0
            );
            projectEmissions = parseFloat(
              p.emissionData.project_emissions?.co2_equivalent_tons || 0
            );
            reductionPercentage =
              p.emissionData.emission_reduction.reduction_percentage || "0";
          } else {
            // Tier 1 or legacy projects
            estimatedCredits = p.emissionData?.carbonCreditsEligible || 0;
            projectEmissions = p.emissionData?.co2Equivalent || 0;
          }

          return {
            id: p._id,
            farmerName: p.farmerName || "N/A",
            landSurveyNumber: p.landSurveyNumber || "N/A",
            village: p.village || "",
            district: p.district || "",
            state: p.state || "India",
            landArea: p.landArea || 0,
            waterRegime:
              p.waterRegimeDuringCultivation || p.waterManagement || "N/A",
            tier,
            status: p.verificationStatus || "pending",
            estimatedCredits,
            baselineEmissions,
            projectEmissions,
            reductionPercentage,
            createdAt: p.createdAt
              ? new Date(p.createdAt).toISOString()
              : new Date().toISOString(),
          };
        });

        // Calculate stats
        const dashboardStats = {
          totalProjects: fetchedProjects.length,
          totalCredits: fetchedProjects.reduce(
            (sum: number, p: Project) => sum + p.estimatedCredits,
            0
          ),
          totalEarnings: fetchedProjects.reduce(
            (sum: number, p: Project) =>
              sum + p.estimatedCredits * 100, // $100 per credit (example)
            0
          ),
          verifiedProjects: fetchedProjects.filter(
            (p: Project) => p.status === "verified"
          ).length,
          totalLandArea: fetchedProjects.reduce(
            (sum: number, p: Project) => sum + p.landArea,
            0
          ),
          totalEmissionReduction: fetchedProjects.reduce(
            (sum: number, p: Project) => sum + p.estimatedCredits,
            0
          ),
        };

        setProjects(fetchedProjects);
        setStats(dashboardStats);
      } else {
        console.error("Failed to fetch projects:", res.data.error);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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
      single_aeration: "Single Aeration",
      multiple_aeration: "Multiple Aeration",
      intermittent_irrigation: "Intermittent Irrigation",
      awd_mild: "AWD (Mild)",
      awd_moderate: "AWD (Moderate)",
    };
    return regimeMap[regime] || regime.replace(/_/g, " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-0 md:mx-8 mt-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active carbon projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carbon Credits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCredits.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tons CO₂e potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Land</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLandArea.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Hectares enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Projects
            </CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="flex justify-between items-center mx-8">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Button
          className="bg-green-600 hover:bg-green-700 hover:cursor-pointer"
          onClick={handleCreateProject}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 mx-0 md:mx-8">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">
                      {project.farmerName}
                    </CardTitle>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Tier {project.tier}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-4 mt-2">
                
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {project.landArea.toFixed(2)} ha
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusText(project.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Water Management Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Water Management:
                  </span>
                  <span className="text-blue-700">
                    {getWaterRegimeDisplay(project.waterRegime)}
                  </span>
                </div>
              </div>

              {/* Tier 2 Emission Details */}
              {project.tier === 2 && project.baselineEmissions > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Baseline Emissions
                    </p>
                    <p className="text-sm font-semibold text-red-600">
                      {project.baselineEmissions.toFixed(2)} t CO₂e
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Project Emissions
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {project.projectEmissions.toFixed(2)} t CO₂e
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Reduction
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      {project.reductionPercentage}%
                    </p>
                  </div>
                </div>
              )}

              {/* Carbon Credits and Actions */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Carbon Credit Potential
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-green-600">
                      {project.estimatedCredits.toFixed(2)}
                    </p>
                    <span className="text-sm font-normal text-gray-600">
                      t CO₂e
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(project.estimatedCredits * 100).toFixed(0)} potential
                    earnings
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Link to={`/project/${project.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {project.status === "verified" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Sell Credits
                    </Button>
                  )}
                </div>
              </div>

            
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No Projects Yet</CardTitle>
              <CardDescription className="mb-4">
                Start your first carbon credit project to begin earning from
                sustainable farming practices
              </CardDescription>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateProject}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
