// backend/models/Farmer.js
import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    // Personal Details
    firebaseUID: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
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

    // Location Details
    village: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },

    // Land Details
    landSurveyNumber: {
      type: String,
      required: true,
    },
    landArea: {
      type: Number,
      required: true,
      min: 0.1,
    },

    // Farming Details
    season: {
      type: String,
      enum: ["kharif", "rabi", "summer"],
      required: true,
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
      required: true,
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
      required: true,
    },
    preSeasonWater: {
      type: String,
      enum: ["non_flooded", "flooded_30_days", "flooded_180_days"],
      required: true,
    },

    // Tier 2 specific fields (optional)
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
    previousCrop: {
      type: String,
    },
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

    // Emission Calculations
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

    // Status
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Admin fields
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    verifiedAt: Date,

    // Blockchain token info
    tokenGenerated: {
      type: Boolean,
      default: false,
    },
    tokenId: String,
    transactionHash: String,
    walletAddress: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
farmerSchema.index({ phoneNumber: 1 });
farmerSchema.index({ aadharNumber: 1 });
farmerSchema.index({ district: 1, state: 1 });
farmerSchema.index({ verificationStatus: 1 });

// module.exports = mongoose.model('Farmer', farmerSchema);
export default mongoose.model("Farmer", farmerSchema);
