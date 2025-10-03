import express from "express";
import Farmer from "../Model/Farmer-model.js";
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const farmer = await Farmer.findById(id).select("-aadharNumber");
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: "Farmer not found",
      });
    }

    res.json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    console.error("Farmer fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/farmers/register
router.post("/register", async (req, res) => {
  try {
    const farmerData = req.body;

    if (farmerData.emissionData) {
      farmerData.emissionData = {
        tier: farmerData.emissionData.method === "Tier 1" ? 1 : 2,
        dailyEmissionFactor: farmerData.emissionData.daily_ef_kg_ha_day,
        totalCH4Emissions: farmerData.emissionData.total_ch4_emissions_kg,
        co2Equivalent: farmerData.emissionData.co2_equivalent_tons,
        carbonCreditsEligible: farmerData.emissionData.carbon_credits_potential,
        calculatedAt: new Date(),
      };
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({
      $or: [
        { phoneNumber: farmerData.phoneNumber },
        { aadharNumber: farmerData.aadharNumber },
      ],
    });

    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        error: "Farmer already registered with this phone number or Aadhar",
      });
    }

    // Create new farmer
    const farmer = new Farmer(farmerData);
    await farmer.save();

    res.status(201).json({
      success: true,
      message: "Farmer registered successfully",
      // data: {
      //   farmerId: farmer._id,
      //   farmerName: farmer.farmerName,
      //   verificationStatus: farmer.verificationStatus
      // }
    });
  } catch (error) {
    console.error("Farmer registration error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
