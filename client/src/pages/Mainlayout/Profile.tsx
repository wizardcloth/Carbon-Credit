import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axiosInstance from "@/lib/axios";

interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber: number | string;
  aadharNumber: number | string;
  email?: string;
}

const FarmerProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    aadharNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/farmers/${user.uid}/profile`);
        if (res.data.success) {
          const userData = res.data.user; // API should return user profile
          setProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            phoneNumber: userData.phoneNumber || "",
            aadharNumber: userData.aadharNumber || "",
            email: userData.email || "",
          });
        } else {
          console.error("Failed to fetch profile:", res.data.error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      const res = await axiosInstance.put(
        `/farmers/${user.uid}/profile`,
        profile
      );
      if (res.data.success) {
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile: " + res.data.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong while updating profile");
    } finally {
      setUpdating(false);
    }
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
      <h1 className="text-2xl font-bold mx-8">Your Profile</h1>

      <Card className="mx-8">
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="border rounded p-2"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="border rounded p-2 flex-1"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Aadhar Number
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="aadharNumber"
                  value={profile.aadharNumber}
                  onChange={handleChange}
                  className="border rounded p-2 flex-1"
                />
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="flex items-center">
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="border rounded p-2 flex-1"
                />
              </div>
            </div>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerProfile;
