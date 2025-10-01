import "./App.css";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import { Route, Routes } from "react-router-dom";
import AuthCallback from "./pages/authCallback/authCallback.google";
import Unauthorized from "./pages/Unauthorized";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Signin" element={<SignupPage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Dashboard" element={<FarmerDashboard />} />
        <Route path="/authcallback/google" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
