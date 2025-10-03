// Tier2FarmerForm.tsx
import React, { useState } from "react";

interface Tier1FormData {
  farmerName: string;
  phoneNumber: string;
  village: string;
  district: string;
  state: string;
  landArea: number;
  season: string;
  waterManagement: string;
  organicMaterial: string;
  preSeasonWater: string;
  aadharNumber: string;
  landSurveyNumber: string;
}

interface Tier2FormData extends Tier1FormData {
  soilType: string;
  riceVariety: string;
  previousCrop: string;
  irrigationSource: string;
  fertiliserType: string;
  pesticidesUsed: string;
  labourType: string;
  machineUsage: string;
  cropResidueManagement: string;
  yieldExpected: number;
}

const Tier2FarmerForm: React.FC = ({}) => {
  const [formData, setFormData] = useState<Tier2FormData>({
    // Basic details from Tier 1
    farmerName: "",
    phoneNumber: "",
    village: "",
    district: "",
    state: "",
    landArea: 0,
    season: "kharif",
    waterManagement: "continuously_flooded",
    organicMaterial: "no_organic",
    preSeasonWater: "non_flooded",
    aadharNumber: "",
    landSurveyNumber: "",

    // Additional Tier 2 parameters
    soilType: "alluvial",
    riceVariety: "traditional",
    previousCrop: "rice",
    irrigationSource: "canal",
    fertiliserType: "urea_dap",
    pesticidesUsed: "minimal",
    labourType: "family_labour",
    machineUsage: "tractor_only",
    cropResidueManagement: "incorporated",
    yieldExpected: 3.5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // All options from Tier 1 form (abbreviated here)
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

  // Additional Tier 2 specific options
  const soilTypeOptions = [
    { value: "alluvial", label: "Alluvial Soil (River-deposited, fertile)" },
    { value: "laterite", label: "Laterite Soil (Red, iron-rich)" },
    { value: "black_cotton", label: "Black Cotton Soil (Heavy clay)" },
    { value: "red_sandy", label: "Red Sandy Soil (Well-drained)" },
    { value: "coastal_saline", label: "Coastal Saline Soil" },
  ];

  const riceVarietyOptions = [
    { value: "traditional", label: "Traditional/Local Variety" },
    { value: "high_yielding", label: "High Yielding Variety (HYV)" },
    { value: "hybrid", label: "Hybrid Variety" },
    { value: "aromatic", label: "Aromatic Variety (Basmati type)" },
  ];

  const previousCropOptions = [
    { value: "rice", label: "Rice (Same field)" },
    { value: "wheat", label: "Wheat" },
    { value: "maize", label: "Maize/Corn" },
    { value: "sugarcane", label: "Sugarcane" },
    { value: "cotton", label: "Cotton" },
    { value: "pulses", label: "Pulses (Dal crops)" },
    { value: "vegetables", label: "Vegetables" },
    { value: "fallow", label: "Left Empty (Fallow)" },
  ];

  const irrigationSourceOptions = [
    { value: "canal", label: "Canal Water" },
    { value: "tube_well", label: "Tube Well/Bore Well" },
    { value: "river", label: "River Water" },
    { value: "rain_fed", label: "Rain Fed Only" },
    { value: "pond", label: "Pond/Tank Water" },
  ];

  const fertiliserTypeOptions = [
    { value: "urea_dap", label: "Urea + DAP (Chemical)" },
    { value: "npk_complex", label: "NPK Complex Fertilizer" },
    { value: "organic_only", label: "Only Organic Fertilizer" },
    { value: "integrated", label: "Mix of Chemical + Organic" },
    { value: "minimal", label: "Very Little Fertilizer" },
  ];

  const pesticidesOptions = [
    { value: "none", label: "No Pesticides Used" },
    { value: "minimal", label: "Minimal Use (Only when needed)" },
    { value: "moderate", label: "Regular Use as per guidelines" },
    { value: "organic", label: "Organic/Natural Pest Control" },
  ];

  const labourTypeOptions = [
    { value: "family_labour", label: "Family Labour Only" },
    { value: "hired_labour", label: "Hired Labour" },
    { value: "mixed_labour", label: "Family + Hired Labour" },
  ];

  const machineUsageOptions = [
    { value: "manual_only", label: "All Manual Work" },
    { value: "tractor_only", label: "Tractor for Land Preparation" },
    { value: "transplanter", label: "Tractor + Transplanter" },
    { value: "harvester", label: "Tractor + Harvester" },
    { value: "fully_mechanized", label: "Fully Mechanized" },
  ];

  const cropResidueOptions = [
    { value: "incorporated", label: "Mixed into Soil" },
    { value: "removed", label: "Removed from Field" },
    { value: "burned", label: "Burned (Not Recommended)" },
    { value: "composted", label: "Made into Compost" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validations (same as Tier 1)
    if (!formData.farmerName.trim())
      newErrors.farmerName = "Farmer name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (formData.landArea <= 0)
      newErrors.landArea = "Land area must be greater than 0";
    if (formData.yieldExpected <= 0)
      newErrors.yieldExpected = "Expected yield must be greater than 0";
    if (!formData.village.trim())
      newErrors.village = "Village name is required";
    if (!formData.district.trim())
      newErrors.district = "District name is required";
    if (!formData.state.trim()) newErrors.state = "State name is required";
    if (formData.landArea <= 0)
      newErrors.landArea = "Land area must be greater than 0";
    if (!formData.aadharNumber.trim())
      newErrors.aadharNumber = "Aadhar number is required";
    if (!formData.landSurveyNumber.trim())
      newErrors.landSurveyNumber = "Land survey number is required";

    // Validate phone number
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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     onSubmit(formData);
  //   }
  // };

  const handleCalculate = () => {
    if (validateForm()) {
      setIsCalculating(true);
      // onCalculate(formData);
      setTimeout(() => setIsCalculating(false), 1000);
    }
  };

  const handleInputChange = (
    field: keyof Tier2FormData,
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
          Tier 2: Detailed Carbon Credit Assessment
        </h2>
        <p className="text-gray-600">
          This form collects detailed information for more accurate emission
          calculations using India-specific factors for soil type, rice
          varieties, and farming conditions.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Basic Details (Similar to Tier 1, abbreviated) */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Farmer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farmer name, phone, etc. - abbreviated for brevity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.farmerName}
                onChange={(e) =>
                  handleInputChange("farmerName", e.target.value)
                }
                className={`w-full p-3 border rounded-md ${
                  errors.farmerName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
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

        {/* location detail  */}

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

        {/* Soil and Environmental Conditions */}
        <div className="bg-fuchsia-50 p-4 rounded-lg border border-brown-200">
          <h3 className="text-lg font-semibold text-brown-800 mb-4">
            Soil & Environmental Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => handleInputChange("soilType", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {soilTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Check with your local agricultural officer if unsure
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Irrigation Water Source
              </label>
              <select
                value={formData.irrigationSource}
                onChange={(e) =>
                  handleInputChange("irrigationSource", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {irrigationSourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Crop Details */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Crop Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rice Variety Type
              </label>
              <select
                value={formData.riceVariety}
                onChange={(e) =>
                  handleInputChange("riceVariety", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {riceVarietyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Crop in This Field
              </label>
              <select
                value={formData.previousCrop}
                onChange={(e) =>
                  handleInputChange("previousCrop", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {previousCropOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Yield (Tonnes per Hectare)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.yieldExpected}
                onChange={(e) =>
                  handleInputChange("yieldExpected", parseFloat(e.target.value))
                }
                className={`w-full p-3 border rounded-md ${
                  errors.yieldExpected ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 3.5"
              />
              {errors.yieldExpected && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.yieldExpected}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Average rice yield is 2-5 tonnes/hectare
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Residue Management
              </label>
              <select
                value={formData.cropResidueManagement}
                onChange={(e) =>
                  handleInputChange("cropResidueManagement", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {cropResidueOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Input Management */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">
            Input Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Fertilizer Type Used
              </label>
              <select
                value={formData.fertiliserType}
                onChange={(e) =>
                  handleInputChange("fertiliserType", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {fertiliserTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesticide Usage Level
              </label>
              <select
                value={formData.pesticidesUsed}
                onChange={(e) =>
                  handleInputChange("pesticidesUsed", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {pesticidesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Management Practice
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organic Material Added
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
            </div>
          </div>
        </div>

        {/* Labour and Machinery */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Labour & Machinery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Labour Used
              </label>
              <select
                value={formData.labourType}
                onChange={(e) =>
                  handleInputChange("labourType", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {labourTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Machinery Usage Level
              </label>
              <select
                value={formData.machineUsage}
                onChange={(e) =>
                  handleInputChange("machineUsage", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                {machineUsageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition duration-200"
          >
            {isCalculating
              ? "Calculating..."
              : "🧮 Calculate Detailed Emissions"}
          </button>

          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium transition duration-200"
          >
            📋 Submit Detailed Form
          </button>
        </div>

        {/* Information Box */}
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Tier 2 Benefits:</strong> This detailed assessment
                provides more accurate emission calculations using
                India-specific factors. Your carbon credit potential will be
                calculated based on your exact farming conditions, soil type,
                and management practices.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Tier2FarmerForm;
