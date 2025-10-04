// Tier1FarmerForm.tsx
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { createHeader } from "@/authProvider/authProvider";
import axiosInstance from "@/lib/axios";
import { useNavigate } from "react-router-dom";

interface EmissionData {
  method: string;
  area_ha: number;
  season: string;
  cultivation_days: number;
  daily_ef_kg_ha_day: number;
  total_ch4_emissions_kg: number;
  co2_equivalent_tons: number;
  carbon_credits_potential: number;
  scaling_factors: Record<string, number>;
}

interface Tier1FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  aadharNumber: string;
  village: string;
  district: string;
  state: string;
  landArea: number;
  season: string;
  waterManagement: string;
  organicMaterial: string;
  preSeasonWater: string;
  landSurveyNumber: string;
  emissionData?: EmissionData;
}

const Tier1FarmerForm = () => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState<Tier1FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    aadharNumber: "",
    village: "",
    district: "",
    state: "",
    landArea: 0,
    season: "kharif",
    waterManagement: "continuously_flooded",
    organicMaterial: "no_organic",
    preSeasonWater: "non_flooded",
    landSurveyNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const waterManagementOptions = [
    {
      value: "continuously_flooded",
      label: "Continuously Flooded (Traditional)",
    },
    { value: "single_aeration", label: "Single Aeration (Field dried once)" },
    {
      value: "multiple_aeration",
      label: "Multiple Aeration (Field dried multiple times)",
    },
    { value: "intermittent_irrigation", label: "Intermittent Irrigation" },
    { value: "awd_mild", label: "Alternate Wetting & Drying - Mild" },
    { value: "awd_moderate", label: "Alternate Wetting & Drying - Moderate" },
    { value: "rainfed_flood_prone", label: "Rainfed - Flood Prone Area" },
    { value: "rainfed_drought_prone", label: "Rainfed - Drought Prone Area" },
    { value: "deepwater", label: "Deep Water Rice" },
  ];

  const organicMaterialOptions = [
    { value: "no_organic", label: "No Organic Material" },
    { value: "rice_straw_fresh", label: "Fresh Rice Straw" },
    { value: "rice_straw_composted", label: "Composted Rice Straw" },
    { value: "farmyard_manure", label: "Farmyard Manure (Cow Dung)" },
    { value: "green_manure", label: "Green Manure" },
    { value: "biogas_slurry", label: "Biogas Slurry" },
  ];

  const seasonOptions = [
    { value: "kharif", label: "Kharif (Monsoon Season - June to November)" },
    { value: "rabi", label: "Rabi (Winter Season - December to April)" },
    { value: "summer", label: "Summer (April to June)" },
  ];

  const preSeasonWaterOptions = [
    { value: "non_flooded", label: "Field was not flooded before planting" },
    {
      value: "flooded_30_days",
      label: "Field was flooded for less than 30 days",
    },
    {
      value: "flooded_180_days",
      label: "Field was flooded for more than 180 days",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim())
      newErrors.lastName = "First name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.aadharNumber.trim())
      newErrors.aadharNumber = "Aadhar number is required";
    if (!formData.village.trim())
      newErrors.village = "Village name is required";
    if (!formData.district.trim())
      newErrors.district = "District name is required";
    if (!formData.state.trim()) newErrors.state = "State name is required";
    if (formData.landArea <= 0)
      newErrors.landArea = "Land area must be greater than 0";
    if (!formData.landSurveyNumber.trim())
      newErrors.landSurveyNumber = "Land survey number is required";

    // Validate phone number (10 digits)
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // Validate Aadhar number (12 digits)
    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = "Aadhar number must be 12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!validateForm()) {return;}
      try {
        const header = await createHeader();
        const res = await axiosInstance.post(
          `/farmers/${user?.uid}/project`,
          formData,
          header
        );

        if (res.data.success) {
          navigate("/Dashboard/projects");
        } else {
          console.error("Registration failed:", res.data.error);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }

  };

  const [emissionData, setEmissionData] = useState<any | null>(null);

  const handleCalculate = async () => {
    if (!validateForm()) {return;}

    // console.log("cicked");
   
    setIsCalculating(true);
    try {
      const header = await createHeader();
      const res = await axiosInstance.post(
        "/emissions/calculate-tier1",
        formData,
        header
      );
      if (res.data.success) {
        setEmissionData(res.data.data);
        setFormData((prev) => ({
          ...prev,
          emissionData: res.data.data,
        }));
      }
    } catch (err) {
      console.error("Emission calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (
    field: keyof Tier1FormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Tier 1: Basic Carbon Credit Assessment
        </h2>
        <p className="text-gray-600">
          Please provide basic information about your rice farming practices.
          This form uses simplified calculations based on standard emission
          factors.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Farmer Personal Details */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Farmer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  handleInputChange("firstName", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.farmerName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {errors.farmerName && (
                <p className="text-red-500 text-sm mt-1">{errors.farmerName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  handleInputChange("lastName", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.farmerName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {errors.farmerName && (
                <p className="text-red-500 text-sm mt-1">{errors.farmerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.aadharNumber}
                onChange={(e) =>
                  handleInputChange("aadharNumber", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.aadharNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="12-digit Aadhar number"
                maxLength={12}
              />
              {errors.aadharNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.aadharNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Land Survey Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.landSurveyNumber}
                onChange={(e) =>
                  handleInputChange("landSurveyNumber", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.landSurveyNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Survey/Khasra number"
              />
              {errors.landSurveyNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.landSurveyNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Village <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => handleInputChange("village", e.target.value)}
                className={`w-full p-3 border rounded-md ${
                  errors.village ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Village name"
              />
              {errors.village && (
                <p className="text-red-500 text-sm mt-1">{errors.village}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className={`w-full p-3 border rounded-md ${
                  errors.district ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="District name"
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className={`w-full p-3 border rounded-md ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="State name"
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>
          </div>
        </div>

        {/* Farming Details */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            Farming Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Land Area (Hectares){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.landArea}
                onChange={(e) =>
                  handleInputChange("landArea", parseFloat(e.target.value))
                }
                className={`w-full p-3 border rounded-md ${
                  errors.landArea ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 2.5"
              />
              {errors.landArea && (
                <p className="text-red-500 text-sm mt-1">{errors.landArea}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                1 Hectare = 2.47 Acres = 10,000 sq meters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cropping Season <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.season}
                onChange={(e) => handleInputChange("season", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {seasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Water Management */}
        <div className="bg-cyan-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-cyan-800 mb-4">
            Water Management Practice
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How do you manage water in your rice field?
              </label>
              <select
                value={formData.waterManagement}
                onChange={(e) =>
                  handleInputChange("waterManagement", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {waterManagementOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Alternate Wetting & Drying can
                significantly reduce methane emissions!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-season Water Condition
              </label>
              <select
                value={formData.preSeasonWater}
                onChange={(e) =>
                  handleInputChange("preSeasonWater", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {preSeasonWaterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Organic Material */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            Organic Material Usage
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What organic material do you add to your field?
            </label>
            <select
              value={formData.organicMaterial}
              onChange={(e) =>
                handleInputChange("organicMaterial", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              {organicMaterialOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              💡 <strong>Note:</strong> Composted organic materials generally
              produce fewer emissions than fresh materials.
            </p>
          </div>
        </div>

        {/* emissions data */}
        {emissionData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              🌱 Emission Results ({emissionData.method})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Land Area:</strong> {emissionData.area_ha} ha
              </p>
              <p>
                <strong>Season:</strong> {emissionData.season}
              </p>
              <p>
                <strong>Cultivation Days:</strong>{" "}
                {emissionData.cultivation_days}
              </p>
              <p>
                <strong>Daily EF:</strong> {emissionData.daily_ef_kg_ha_day} kg
                CH₄/ha/day
              </p>
              <p>
                <strong>Total CH₄:</strong>{" "}
                {emissionData.total_ch4_emissions_kg} kg
              </p>
              <p>
                <strong>CO₂ Equivalent:</strong>{" "}
                {emissionData.co2_equivalent_tons} tCO₂e
              </p>
              <p>
                <strong>Carbon Credits Eligible:</strong>{" "}
                {emissionData.carbon_credits_potential}
              </p>
              <p>
                <strong>Calculated At:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition duration-200"
          >
            {isCalculating ? "Calculating..." : "🧮 Calculate Emissions"}
          </button>

    
            <button
              type="submit"
              disabled={
                !formData.emissionData?.carbon_credits_potential ||
                isCalculating
              }
              className={`px-4 py-2 rounded-md font-semibold 
              ${
                !formData.emissionData
                  ? "bg-gray-400 cursor-not-allowed" // disabled look
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              📋 Submit Form
            </button>
          
        </div>
      </form>
    </div>
  );
};

export default Tier1FarmerForm;
