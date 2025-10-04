import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import SignInButton from "@/components/SignInButton";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import { createHeader } from "@/authProvider/authProvider";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createUserWithEmailAndPassword, , loading] =
    useCreateUserWithEmailAndPassword(auth);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error("firstName cannot be empty");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("lastName cannot be empty");
      return false;
    }
    if (!email.includes("@gmail.com")) {
      toast.error("Email must be a valid Gmail address (example@gmail.com)");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return; // Stop if validation fails

    try {
      await createUserWithEmailAndPassword(email, password);

      const header = await createHeader();

      await axiosInstance.post(
        "/auth/authCallback",
        { firstName, lastName, email ,id: user?.uid},
        header
      );

      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");

      toast.success("Account created successfully");
      navigate("/Dashboard");
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-xs"
        style={{ backgroundImage: `url('/rice-min.jpg')` }}
      />

      <div className="relative rounded-3xl p-10 w-full max-w-md flex flex-col gap-4 md:ml-20">
        <h1 className="text-4xl font-bold font-serif text-white">Sign Up</h1>
        <p className="text-sm text-white mb-4">
          Continue to access your dashboard
        </p>

        <SignInButton />

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-xs text-white">OR</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs text-white">
            First Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your Full Name"
            className="w-full border-gray-400 bg-white border-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Label htmlFor="name" className="text-xs text-white">
            Last Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your Full Name"
            className="w-full border-gray-400 bg-white border-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Label htmlFor="email" className="text-xs text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your Gmail address"
            className="w-full border-gray-400 bg-white border-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Label htmlFor="password" className="text-xs text-white">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create 6-Digit password"
            className="w-full border-gray-400 bg-white border-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          className="w-full hover:cursor-pointer"
          onClick={handleSignIn}
          disabled={loading}
        >
          Sign Up
        </Button>

        <p className="text-sm text-center text-white">
          Already have an account?{" "}
          <Link to="/Login" className="text-[#0000FF] font-semibold underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
