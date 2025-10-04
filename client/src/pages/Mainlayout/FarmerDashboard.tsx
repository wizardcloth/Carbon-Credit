import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, TrendingUp, Leaf, DollarSign, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axiosInstance from "@/lib/axios";

interface Project {
  id: string;
  name: string;
  status: string;
  estimatedCredits: number;
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  totalCredits: number;
  totalEarnings: number;
  verifiedProjects: number;
}

const FarmerDashboard: React.FC = () => {
  // const [signingOut, setSigningOut] = useState(false);
  const [user] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalCredits: 0,
    totalEarnings: 0,
    verifiedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate("/Dashboard/projects");
  };

  useEffect(() => {
    if (user) {
      console.log(`user id: ${user?.uid}`);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/farmers/${user?.uid}/projects`);

      if (res.data.success) {
        const projectsData = res.data.projects;

        // Map projects into the format your dashboard expects
        const fetchedProjects = projectsData.map((p: any) => ({
          id: p._id,
          name: p.waterManagement,
          status: p.verificationStatus,
          estimatedCredits: p.emissionData?.carbonCreditsEligible || 0,
          createdAt: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString()
            : "",
        }));

        // Calculate stats
        const dashboardStats = {
          totalProjects: fetchedProjects.length,
          totalCredits: fetchedProjects.reduce(
            (sum: number, p: Project) => sum + p.estimatedCredits,
            0
          ),
          totalEarnings: fetchedProjects.reduce(
            (sum: number, p: Project) => sum + (p.estimatedCredits * 100 || 0), // example conversion
            0
          ),
          verifiedProjects: fetchedProjects.filter(
            (p: Project) => p.status === "verified"
          ).length,
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
      case "approved":
        return "text-green-600 bg-green-100";
      case "under_review":
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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If user is null, we'll be redirected by useEffect

  return (
    <div className="space-y-6">
      {/* Welcome Section */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-0 md:mx-8 mt-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
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
              {stats.totalCredits.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Tons CO2e generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              From carbon credit sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Projects
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
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
          onClick={() => {
            handleCreateProject();
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 mx-0 md:mx-8">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Created on{" "}
                    {new Date(project.createdAt).toLocaleDateString()}
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
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Credits
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {project.estimatedCredits}{" "}
                    <span className="text-sm font-normal">tons CO2e</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/project/${project.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {project.status === "approved" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
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
                sustainable farming
              </CardDescription>
              <Button className="bg-green-600 hover:bg-green-700">
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
