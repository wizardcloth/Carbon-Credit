// backend/Model/User.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    // 🔹 Location Details
    village: String,
    district: String,
    state: String,

    // 🔹 Land Details
    landSurveyNumber: String,
    landArea: {
      type: Number,
      min: 0.1,
    },

    // 🔹 Farming Details
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
    preSeasonWater: {
      type: String,
      enum: ["non_flooded", "flooded_30_days", "flooded_180_days"],
    },

    // 🔹 Tier 2 Specific
    soilType: {
      type: String,
      enum: [
        "alluvial",
        "laterite",
        "black_cotton",
        "red_sandy",
        "coastal_saline",
      ],
    },
    riceVariety: {
      type: String,
      enum: ["traditional", "high_yielding", "hybrid", "aromatic"],
    },
    previousCrop: String,
    irrigationSource: {
      type: String,
      enum: ["canal", "tube_well", "river", "rain_fed", "pond"],
    },
    fertiliserType: {
      type: String,
      enum: [
        "urea_dap",
        "npk_complex",
        "organic_only",
        "integrated",
        "minimal",
      ],
    },
    pesticidesUsed: {
      type: String,
      enum: ["none", "minimal", "moderate", "organic"],
    },
    yieldExpected: {
      type: Number,
      min: 0.1,
    },

    // 🔹 Emission Calculations
    emissionData: {
      tier: {
        type: Number,
        enum: [1, 2],
      },
      dailyEmissionFactor: Number,
      totalCH4Emissions: Number,
      co2Equivalent: Number,
      carbonCreditsEligible: Number,
      calculatedAt: {
        type: Date,
        default: Date.now,
      },
    },

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
      unique: true,
      sparse: true,
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

export default mongoose.model("User", userSchema);
