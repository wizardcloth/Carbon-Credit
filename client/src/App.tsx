import "./App.css";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FarmerDashboard from "./pages/Mainlayout/FarmerDashboard";
import { Route, Routes } from "react-router-dom";
import AuthCallback from "./pages/authCallback/authCallback.google";
import Unauthorized from "./pages/Unauthorized";
import { Toaster } from "react-hot-toast";
import Mainlayout from "./pages/Mainlayout/Mainlayout";
import Profile from "./pages/Mainlayout/Profile";
import Projects from "./pages/Mainlayout/Projects";
import TokenWallet from "./pages/Mainlayout/TokenWallet";
import Tier2FarmerForm from "./pages/Mainlayout/Tier2FarmerForm";
import ProjectDetailsPage from "./pages/Mainlayout/ProjectDetailsPage";
import BlockchainStats from "./pages/Admin/BlockchainStats";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminPage";
import AdminOverview from "./pages/Admin/AdminOverview";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminProjects from "./pages/Admin/AdminProjects";
import AdminPending from "./pages/Admin/AdminPending";
import AdminApproved from "./pages/Admin/AdminApproved";
import AdminRejected from "./pages/Admin/AdminRejected";
import SatelliteVerification from "./pages/Admin/SatelliteVerification";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminSettings from "./pages/Admin/AdminSetting";
import AdminProjectDetails from "./pages/Admin/AdminProjectDetails";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/Signin" element={<SignupPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/authcallback/google" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes - Nested under AdminDashboard layout */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/:projectId" element={<AdminProjectDetails />} />
          <Route path="pending" element={<AdminPending />} />
          <Route path="approved" element={<AdminApproved />} />
          <Route path="rejected" element={<AdminRejected />} />
          <Route path="satellite" element={<SatelliteVerification />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="blockchain" element={<BlockchainStats />} />
        </Route>

        {/* Farmer Routes - Nested under Mainlayout */}
        <Route element={<Mainlayout />}>
          <Route path="/Dashboard" element={<FarmerDashboard />} />
          <Route path="/Dashboard/Profile" element={<Profile />} />
          <Route path="/assessment/tier-2" element={<Tier2FarmerForm />} />
          <Route path="/Dashboard/Projects" element={<Projects />} />
          <Route path="/Dashboard/Wallet" element={<TokenWallet />} />
          <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
