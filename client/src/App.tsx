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
function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Signin" element={<SignupPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route element={<Mainlayout />}>
          <Route path="/Dashboard" element={<FarmerDashboard />} />
          <Route path="/Dashboard/Profile" element={<Profile />} />
          <Route path="/Dashboard/Projects" element={<Projects />} />
          <Route path="/Dashboard/Wallet" element={<TokenWallet />} />

        </Route>
        <Route path="/authcallback/google" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
