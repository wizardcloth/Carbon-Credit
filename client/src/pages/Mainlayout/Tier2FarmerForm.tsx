import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { createHeader } from "@/authProvider/authProvider";
import axiosInstance from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import MapBoundarySelector from "@/components/MapBoundarySelector";
import toast from "react-hot-toast";

interface OrganicAmendment {
  type: string;
  applicationRate: number; // tonnes/ha
  timing: string; // 'short' (<30 days) or 'long' (>30 days)
}

interface Tier2FormData {
  // Personal Details
  farmerName: string;
  phoneNumber: string;
  aadharNumber: string;
  landSurveyNumber: string;
  village: string;
  district: string;
  state: string;

  // Core Agronomic Fields (Required for IPCC 2019 Tier 2)
  landArea: number; // hectares
  cultivationPeriod: number; // days (default 112 for South Asia)
  waterRegimeDuringCultivation: string; // SFw
  preSeasonWaterRegime: string; // SFp
  organicAmendments: OrganicAmendment[]; // For SFo calculation

  // Map boundary
  boundary?: any;
}

const Tier2FarmerForm = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [boundary, setBoundary] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ✅ INITIALIZE WITH BASELINE ORGANIC AMENDMENT (5 tonnes/ha rice straw)
  const [formData, setFormData] = useState<Tier2FormData>({
    farmerName: "",
    phoneNumber: "",
    aadharNumber: "",
    landSurveyNumber: "",
    village: "",
    district: "",
    state: "India",
    landArea: 0,
    cultivationPeriod: 112,
    waterRegimeDuringCultivation: "continuously_flooded",
    preSeasonWaterRegime: "non_flooded_less_180",
    organicAmendments: [
      {
        type: "straw",
        applicationRate: 5.0,
        timing: "long",
      },
    ],
  });

  const [currentAmendment, setCurrentAmendment] = useState<OrganicAmendment>({
    type: "none",
    applicationRate: 0,
    timing: "long",
  });

  const handleInputChange = (field: keyof Tier2FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (result) setResult(null); // Clear results if form changes
  };

  const addOrganicAmendment = () => {
    if (
      currentAmendment.type !== "none" &&
      currentAmendment.applicationRate > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        organicAmendments: [...prev.organicAmendments, { ...currentAmendment }],
      }));
      setCurrentAmendment({ type: "none", applicationRate: 0, timing: "long" });
      if (result) setResult(null);
    }
  };

  const removeAmendment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      organicAmendments: prev.organicAmendments.filter((_, i) => i !== index),
    }));
    if (result) setResult(null);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.farmerName.trim())
      newErrors.farmerName = "Farmer name is required";
    if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10 digits";
    if (!/^\d{12}$/.test(formData.aadharNumber))
      newErrors.aadharNumber = "Aadhar number must be 12 digits";
    if (!formData.landSurveyNumber.trim())
      newErrors.landSurveyNumber = "Survey number required";
    if (formData.landArea <= 0) newErrors.landArea = "Enter a valid land area";
    if (formData.cultivationPeriod <= 0 || formData.cultivationPeriod > 200)
      newErrors.cultivationPeriod =
        "Enter valid cultivation period (1-200 days)";
    if (!boundary) newErrors.boundary = "Please mark your field on map";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    setIsCalculating(true);
    try {
      const header = await createHeader();
      const res = await axiosInstance.post(
        "/emissions/calculate-tier2",
        { ...formData, boundary },
        header
      );
      if (res.data.success) {
        setResult(res.data.data);

        const netReduction = parseFloat(
          res.data.data.emission_reduction.net_reduction_tco2e
        );
        if (netReduction <= 0) {
          toast.error(
            "⚠️ Your current practices show no emission reduction compared to baseline.",
            { duration: 5000 }
          );
        } else {
          toast.success(
            `✅ Potential: ${netReduction.toFixed(2)} t CO₂e credits!`,
            { duration: 4000 }
          );
        }
      }
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(
        err.response?.data?.error || "Failed to calculate emissions"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async () => {
    if (!result) {
      toast.error("⚠️ Please calculate emissions first");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const header = await createHeader();

      const submissionData = {
        ...formData,
        boundary,
        emissionData: result,
      };

      const res = await axiosInstance.post(
        `/farmers/${user?.uid}/tier2`,
        submissionData,
        header
      );

      if (res.data.success) {
        toast.success("✅ Project submitted successfully!");
        navigate("/Dashboard");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(
        error.response?.data?.error || "Failed to submit project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-2">
            Tier 2 – CH₄ Emission Assessment
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Based on IPCC 2019 Refinement, Volume 4, Chapter 5 - Rice Cultivation
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center text-base sm:text-lg">
            <span className="mr-2">👤</span> Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Farmer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter farmer name"
                value={formData.farmerName}
                maxLength={30}
                onChange={(e) => handleInputChange("farmerName", e.target.value)}
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.farmerName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.farmerName && (
                <p className="text-red-600 text-xs mt-1">{errors.farmerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                maxLength={10}
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Aadhar Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="12-digit Aadhar"
                value={formData.aadharNumber}
                onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
                maxLength={12}
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.aadharNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.aadharNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.aadharNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Land Survey Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Survey ID or Plot No."
                value={formData.landSurveyNumber}
                maxLength={12}
                onChange={(e) =>
                  handleInputChange("landSurveyNumber", e.target.value)
                }
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.landSurveyNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.landSurveyNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.landSurveyNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Village</label>
              <input
                type="text"
                placeholder="Village name"
                maxLength={20}
                value={formData.village}
                onChange={(e) => handleInputChange("village", e.target.value)}
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">District</label>
              <input
                type="text"
                placeholder="District name"
                value={formData.district}
                maxLength={20}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              />
            </div>
          </div>
        </div>

        {/* Cultivation Parameters */}
        <div className="bg-green-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center text-base sm:text-lg">
            <span className="mr-2">🌾</span> Cultivation Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Land Area (hectares) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="Enter area in hectares"
                value={formData.landArea || ""}
                onChange={(e) =>
                  handleInputChange("landArea", parseFloat(e.target.value) || 0)
                }
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.landArea ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.landArea && (
                <p className="text-red-600 text-xs mt-1">{errors.landArea}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cultivation Period (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Default: 112 days"
                value={formData.cultivationPeriod}
                onChange={(e) =>
                  handleInputChange(
                    "cultivationPeriod",
                    parseInt(e.target.value) || 112
                  )
                }
                className={`w-full p-3 border rounded-lg text-base ${
                  errors.cultivationPeriod ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                IPCC 2019 default: 112 days (range: 90-140)
              </p>
              {errors.cultivationPeriod && (
                <p className="text-red-600 text-xs mt-1">{errors.cultivationPeriod}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Water Regime During Cultivation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.waterRegimeDuringCultivation}
                onChange={(e) =>
                  handleInputChange("waterRegimeDuringCultivation", e.target.value)
                }
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              >
                <option value="continuously_flooded">
                  Continuously Flooded (SFw = 1.00)
                </option>
                <option value="single_drainage">
                  Single Drainage (SFw = 0.71)
                </option>
                <option value="multiple_drainage_awd">
                  Multiple Drainage / AWD (SFw = 0.55)
                </option>
                <option value="regular_rainfed">
                  Regular Rainfed (SFw = 0.54)
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                IPCC 2019 Table 5.12
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Pre-Season Water Regime <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.preSeasonWaterRegime}
                onChange={(e) =>
                  handleInputChange("preSeasonWaterRegime", e.target.value)
                }
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              >
                <option value="non_flooded_less_180">
                  Non-flooded &lt; 180 days (SFp = 1.00)
                </option>
                <option value="non_flooded_more_180">
                  Non-flooded &gt; 180 days (SFp = 0.89)
                </option>
                <option value="flooded_more_30">
                  Flooded &gt; 30 days before (SFp = 2.41)
                </option>
                <option value="non_flooded_more_365">
                  Non-flooded &gt; 365 days (SFp = 0.59)
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                IPCC 2019 Table 5.13
              </p>
            </div>
          </div>
        </div>

        {/* Organic Amendments */}
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3 text-base sm:text-lg">
            🌱 Organic Amendments
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            SFo = (1 + Σ(ROAi × CFOAi))^0.59 (IPCC 2019 Table 5.14)
          </p>

          {/* Info Box */}
          <div className="bg-blue-100 border-l-4 border-blue-500 p-3 mb-4 rounded-r">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>ℹ️ Note:</strong> Your current amendment represents the
              <strong> baseline</strong>. To earn credits, <strong>reduce</strong> amendments
              or improve water management.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amendment Type
              </label>
              <select
                value={currentAmendment.type}
                onChange={(e) =>
                  setCurrentAmendment({
                    ...currentAmendment,
                    type: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              >
                <option value="none">None / Select</option>
                <option value="straw">Rice Straw</option>
                <option value="compost">Compost (CFOA = 0.17)</option>
                <option value="farmyard_manure">
                  Farmyard Manure (CFOA = 0.21)
                </option>
                <option value="green_manure">Green Manure (CFOA = 0.45)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Application Rate (tonnes/ha)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="e.g., 5.0"
                value={currentAmendment.applicationRate || ""}
                onChange={(e) =>
                  setCurrentAmendment({
                    ...currentAmendment,
                    applicationRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Straw: DRY weight; Others: FRESH weight
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Application Timing
              </label>
              <select
                value={currentAmendment.timing}
                onChange={(e) =>
                  setCurrentAmendment({
                    ...currentAmendment,
                    timing: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg border-gray-300 text-base"
                disabled={currentAmendment.type !== "straw"}
              >
                <option value="short">
                  &lt; 30 days (CFOA = 1.00)
                </option>
                <option value="long">
                  &gt; 30 days (CFOA = 0.19)
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only for straw; others use fixed CFOA
              </p>
            </div>
          </div>

          <button
            onClick={addOrganicAmendment}
            className="w-full sm:w-auto bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 font-medium text-base"
          >
            + Add Amendment
          </button>

          {/* Amendments List */}
          {formData.organicAmendments.length > 0 && (
            <div className="bg-white p-4 rounded-lg border mt-4">
              <h4 className="font-medium mb-3 text-sm sm:text-base">
                Current Organic Amendments:
              </h4>
              <ul className="space-y-2">
                {formData.organicAmendments.map((amendment, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded gap-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {index === 0 && formData.organicAmendments.length === 1 && (
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                          BASELINE
                        </span>
                      )}
                      <span className="text-sm sm:text-base">
                        <strong>{amendment.type.toUpperCase()}:</strong>{" "}
                        {amendment.applicationRate} t/ha
                        {amendment.type === "straw" &&
                          ` (${amendment.timing} term)`}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAmendment(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium self-start sm:self-auto"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              {formData.organicAmendments.length === 1 &&
                formData.organicAmendments[0].type === "straw" &&
                formData.organicAmendments[0].applicationRate === 5.0 && (
                  <p className="text-xs text-gray-600 mt-3 italic">
                    💡 Tip: This is your baseline. To earn credits, modify
                    amendments or improve water management.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Map Selector */}
        <div className="bg-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold text-green-700 mb-3 flex items-center text-base sm:text-lg">
            <span className="mr-2">📍</span> Locate Your Field on Map
          </h3>
          <MapBoundarySelector onBoundaryChange={setBoundary} />
          {errors.boundary && (
            <p className="text-red-600 text-sm mt-2">{errors.boundary}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg sm:text-xl text-green-700 border-b-2 border-green-500 pb-2">
              🌿 Emission Results
            </h3>

            {/* Baseline Emissions - Mobile Optimized */}
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <h4 className="font-semibold text-base sm:text-lg mb-2 text-red-700 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📊</span>
                Baseline Emissions
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 italic">
                {result.baseline_emissions.scenario}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-600">Daily EF</p>
                  <p className="font-semibold text-red-700 text-sm sm:text-base">
                    {result.baseline_emissions.daily_ef_kg_ha_day}
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-600">Total CH₄</p>
                  <p className="font-semibold text-red-700 text-sm sm:text-base">
                    {result.baseline_emissions.total_ch4_emissions_kg} kg
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm col-span-2">
                  <p className="text-xs text-gray-600">CO₂ Equivalent</p>
                  <p className="font-semibold text-red-700 text-lg sm:text-xl">
                    {result.baseline_emissions.co2_equivalent_tons} t CO₂e
                  </p>
                </div>
              </div>
            </div>

            {/* Project Emissions - Mobile Optimized */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <h4 className="font-semibold text-base sm:text-lg mb-2 text-blue-700 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">💧</span>
                Project Emissions
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 italic">
                {result.project_emissions.scenario}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-600">Daily EF</p>
                  <p className="font-semibold text-blue-700 text-sm sm:text-base">
                    {result.project_emissions.daily_ef_kg_ha_day}
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                  <p className="text-xs text-gray-600">Total CH₄</p>
                  <p className="font-semibold text-blue-700 text-sm sm:text-base">
                    {result.project_emissions.total_ch4_emissions_kg} kg
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded shadow-sm col-span-2">
                  <p className="text-xs text-gray-600">CO₂ Equivalent</p>
                  <p className="font-semibold text-blue-700 text-lg sm:text-xl">
                    {result.project_emissions.co2_equivalent_tons} t CO₂e
                  </p>
                </div>
              </div>
            </div>

            {/* Carbon Credit Potential - Mobile Optimized */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-lg text-white shadow-lg">
              <p className="text-sm mb-2 opacity-90 text-center">
                💰 Carbon Credit Potential
              </p>
              <p className="font-bold text-4xl sm:text-5xl mb-2 text-center">
                {result.emission_reduction.carbon_credit_potential_tco2e}
              </p>
              <p className="text-lg sm:text-xl text-center">tonnes CO₂e</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4 text-center">
                <p className="text-sm mb-1">Estimated Annual Credits</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {result.emission_reduction.estimated_annual_carbon_credits}
                </p>
              </div>
              <p className="text-center text-base sm:text-lg mt-4">
                {result.emission_reduction.reduction_percentage}% Reduction
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sticky bottom-0 bg-white p-4 rounded-t-lg shadow-lg sm:static sm:bg-transparent sm:shadow-none sm:p-0">
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 bg-blue-600 text-white py-3 sm:py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-all"
          >
            {isCalculating ? "Calculating..." : "🧮 Calculate Emissions"}
          </button>

          {result && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !result}
              className="flex-1 bg-green-600 text-white py-3 sm:py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-all"
            >
              {isSubmitting ? "Submitting..." : "📋 Submit Project"}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {!result && (
          <p className="text-sm text-gray-500 italic mt-4 text-center">
            💡 Calculate emissions first to see your carbon credit potential
          </p>
        )}
      </div>
    </div>
  );
};

export default Tier2FarmerForm;
