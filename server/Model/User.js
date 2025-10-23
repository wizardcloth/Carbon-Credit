// backend/Model/User.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 🔹 Organic Amendment Sub-schema for Tier 2
const organicAmendmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["straw", "compost", "farmyard_manure", "green_manure"],
      required: true,
    },
    applicationRate: {
      type: Number, // tonnes/ha
      required: true,
      min: 0,
    },
    timing: {
      type: String,
      enum: ["short", "long"], // < 30 days or > 30 days before cultivation
      default: "long",
    },
  },
  { _id: false }
);

// 🔹 Emission Data Sub-schema (Enhanced for Tier 2)
const emissionDataSchema = new mongoose.Schema(
  {
    tier: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    
    // Baseline Emissions (Business-as-usual)
    baseline_emissions: {
      scenario: String,
      daily_ef_kg_ha_day: Number,
      total_ch4_emissions_kg: Number,
      co2_equivalent_tons: Number,
      scaling_factors: {
        sfW: Number,
        sfP: Number,
        sfO: Number,
        sfS: Number,
        sfR: Number,
      },
    },

    // Project Emissions (With improved practices)
    project_emissions: {
      scenario: String,
      daily_ef_kg_ha_day: Number,
      total_ch4_emissions_kg: Number,
      co2_equivalent_tons: Number,
      scaling_factors: {
        sfW: Number,
        sfP: Number,
        sfO: Number,
        sfS: Number,
        sfR: Number,
      },
    },

    // Emission Reduction & Carbon Credit Potential
    emission_reduction: {
      gross_reduction_tco2e: Number,
      uncertainty_deduction: String,
      net_reduction_tco2e: Number,
      reduction_percentage: String,
      carbon_credit_potential_tco2e: Number,
      estimated_annual_carbon_credits: Number,
    },

    // Legacy fields (for Tier 1 compatibility)
    dailyEmissionFactor: Number,
    totalCH4Emissions: Number,
    co2Equivalent: Number,
    carbonCreditsEligible: Number,

    // Methodology references
    ipcc_reference: String,
    gold_standard_reference: String,
    notes: [String],

    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },

    // 🔹 Personal Details (from form)
    farmerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\d{10}$/,
    },
    aadharNumber: {
      type: String,
      required: true,
      match: /^\d{12}$/,
    },

    // 🔹 Location Details
    village: {
      type: String,
      maxlength: 20,
    },
    district: {
      type: String,
      maxlength: 20,
    },
    state: {
      type: String,
      default: "India",
    },

    // 🔹 Land Details
    landSurveyNumber: {
      type: String,
      required: true,
      maxlength: 12,
    },
    landArea: {
      type: Number,
      required: true,
      min: 0.01,
    },

    // 🔹 GeoJSON Boundary (for satellite verification)
    boundary: {
      type: {
        type: String,
        enum: ["Feature", "FeatureCollection"],
      },
      properties: mongoose.Schema.Types.Mixed,
      geometry: {
        type: {
          type: String,
          enum: ["Polygon", "MultiPolygon"],
        },
        coordinates: {
          type: [[[Number]]], // Array of coordinate rings
        },
      },
      features: [mongoose.Schema.Types.Mixed], // For FeatureCollection
    },

    // 🔹 Tier 2 Cultivation Parameters (IPCC 2019)
    cultivationPeriod: {
      type: Number,
      default: 112,
      min: 1,
      max: 200,
    },
    waterRegimeDuringCultivation: {
      type: String,
      enum: [
        "continuously_flooded",
        "single_drainage",
        "multiple_drainage_awd",
        "regular_rainfed",
        "drought_prone",
        "deep_water",
        "upland",
      ],
      required: true,
    },
    preSeasonWaterRegime: {
      type: String,
      enum: [
        "non_flooded_less_180",
        "non_flooded_more_180",
        "flooded_more_30",
        "non_flooded_more_365",
      ],
      required: true,
    },

    // 🔹 Organic Amendments (array of amendments)
    organicAmendments: [organicAmendmentSchema],

    // 🔹 Legacy fields (for backward compatibility with Tier 1)
    season: {
      type: String,
      enum: ["kharif", "rabi", "summer"],
    },
    waterManagement: {
      type: String,
      enum: [
        "continuously_flooded",
        "single_aeration",
        "multiple_aeration",
        "intermittent_irrigation",
        "awd_mild",
        "awd_moderate",
        "rainfed_flood_prone",
        "rainfed_drought_prone",
        "deepwater",
      ],
    },
    organicMaterial: {
      type: String,
      enum: [
        "no_organic",
        "rice_straw_fresh",
        "rice_straw_composted",
        "farmyard_manure",
        "green_manure",
        "biogas_slurry",
      ],
    },

    // 🔹 Emission Calculations (Enhanced)
    emissionData: emissionDataSchema,

    // 🔹 Status
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    rejectionReason: String,
    verifiedAt: Date,

    // 🔹 Blockchain Info
    tokenGenerated: {
      type: Boolean,
      default: false,
    },
    tokenId: String,
    transactionHash: String,
    walletAddress: String,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    // 🔹 Basic User Info
    firstName: String,
    lastName: String,
    email: {
      type: String,
      // unique: true,
      // sparse: true,
    },
    phoneNumber: {
      type: String,
      match: /^\d{10}$/,
    },
    aadharNumber: {
      type: String,
      match: /^\d{12}$/,
    },
    imageUrl: String,

    // 🔹 Projects (Farmer Projects)
    projects: [projectSchema],
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ phoneNumber: 1 });
userSchema.index({ aadharNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ "projects.district": 1, "projects.state": 1 });
userSchema.index({ "projects.verificationStatus": 1 });
userSchema.index({ "projects.boundary.geometry": "2dsphere" }); // 🔹 Geospatial index for boundary queries

export default mongoose.model("User", userSchema);
