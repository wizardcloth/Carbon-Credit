import express from "express";
import User from "../Model/User.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/:userId/project", async (req, res) => {
  try {
    const { userId } = req.params;
    const projectData = req.body;

    // 🔹 Handle emissionData mapping
    if (projectData.emissionData) {
      projectData.emissionData = {
        tier: projectData.emissionData.method === "Tier 1" ? 1 : 2,
        dailyEmissionFactor: projectData.emissionData.daily_ef_kg_ha_day,
        totalCH4Emissions: projectData.emissionData.total_ch4_emissions_kg,
        co2Equivalent: projectData.emissionData.co2_equivalent_tons,
        carbonCreditsEligible:
          projectData.emissionData.carbon_credits_potential,
        calculatedAt: new Date(),
      };
    }

    // 🔹 Find existing user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found. Cannot register project for non-existing user.",
      });
    }

    // 🔹 Update basic user details if provided
    if (projectData.firstName) user.firstName = projectData.firstName;
    if (projectData.lastName) user.lastName = projectData.lastName;
    if (projectData.phoneNumber) user.phoneNumber = projectData.phoneNumber;
    if (projectData.aadharNumber) user.aadharNumber = projectData.aadharNumber;

    // 🔹 Check if project with same landSurveyNumber exists
    const projectExists = user.projects.some(
      (p) => p.landSurveyNumber === projectData.landSurveyNumber
    );

    if (projectExists) {
      return res.status(400).json({
        success: false,
        error:
          "Project with this land survey number already exists for this user.",
      });
    }

    // 🔹 Add new project
    user.projects.push({
      _id: uuidv4(),
      ...projectData,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      user,
    });
  } catch (error) {
    console.error("Error adding project:", error);

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
