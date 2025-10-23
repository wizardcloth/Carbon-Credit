// AdminDashboard.tsx
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  // MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  Satellite,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthStore } from "@/Store/useAuthStore";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { isAdmin, isLoading } = useAuthStore();
  if (!isAdmin && !isLoading) {
    return <div></div>;
  }

  const menuItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Overview",
      path: "/admin",
      color: "text-blue-600",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "All Users",
      path: "/admin/users",
      color: "text-purple-600",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "All Projects",
      path: "/admin/projects",
      color: "text-gray-600",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Pending Verification",
      path: "/admin/pending",
      color: "text-yellow-600",
      badge: "pending",
    },
    {
      icon: <Satellite className="h-5 w-5" />,
      label: "Satellite Verification",
      path: "/admin/satellite",
      color: "text-indigo-600",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: "Approved Projects",
      path: "/admin/approved",
      color: "text-green-600",
    },
    {
      icon: <XCircle className="h-5 w-5" />,
      label: "Rejected Projects",
      path: "/admin/rejected",
      color: "text-red-600",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Analytics",
      path: "/admin/analytics",
      color: "text-emerald-600",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/admin/settings",
      color: "text-gray-600",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={isActive(item.path) ? item.color : ""}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  New
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:ml-0 ml-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Carbon Credit Verification Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
