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

  const [user, , ] = useAuthState(auth);
  useEffect(() => {
    if(user) {
      console.log(user?.uid);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration
      const mockProjects = [
        {
          id: "1",
          name: "Rice Field Sustainable Practices",
          status: "approved",
          estimatedCredits: 15.5,
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          name: "Organic Wheat Cultivation",
          status: "under_review",
          estimatedCredits: 8.2,
          createdAt: "2024-02-20",
        },
        {
          id: "3",
          name: "Alternate Wetting and Drying",
          status: "draft",
          estimatedCredits: 12.8,
          createdAt: "2024-03-10",
        },
      ];

      const mockStats = {
        totalProjects: mockProjects.length,
        totalCredits: mockProjects.reduce(
          (sum, p) => sum + p.estimatedCredits,
          0
        ),
        totalEarnings: 2840,
        verifiedProjects: mockProjects.filter((p) => p.status === "approved")
          .length,
      };

      setProjects(mockProjects);
      setStats(mockStats);
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
