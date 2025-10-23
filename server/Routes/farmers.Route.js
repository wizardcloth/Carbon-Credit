import express from "express";
import User from "../Model/User.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// POST api/farmers/:userId/tier2
router.post("/:userId/tier2", async (req, res) => {
  try {
    const { userId } = req.params;
    const projectData = req.body;

    console.log("Received Tier 2 project data:", JSON.stringify(projectData, null, 2));

    // 🔹 Find existing user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found. Cannot register project for non-existing user.",
      });
    }

    // 🔹 Update basic user details if provided
    if (projectData.farmerName && !user.firstName) {
      const nameParts = projectData.farmerName.split(" ");
      user.firstName = nameParts[0];
      user.lastName = nameParts.slice(1).join(" ");
    }
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

    // 🔹 Validate boundary (must be GeoJSON with Polygon geometry)
    if (projectData.boundary) {
      if (!projectData.boundary.geometry || 
          !projectData.boundary.geometry.coordinates ||
          projectData.boundary.geometry.coordinates.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid boundary geometry. Must be a valid GeoJSON Polygon.",
        });
      }
    }

    // 🔹 Create new Tier 2 project
    const newProject = {
      _id: uuidv4(),
      
      // Personal details
      farmerName: projectData.farmerName,
      phoneNumber: projectData.phoneNumber,
      aadharNumber: projectData.aadharNumber,
      
      // Location
      village: projectData.village,
      district: projectData.district,
      state: projectData.state || "India",
      
      // Land details
      landSurveyNumber: projectData.landSurveyNumber,
      landArea: projectData.landArea,
      
      // GeoJSON Boundary
      boundary: projectData.boundary,
      
      // Cultivation parameters
      cultivationPeriod: projectData.cultivationPeriod || 112,
      waterRegimeDuringCultivation: projectData.waterRegimeDuringCultivation,
      preSeasonWaterRegime: projectData.preSeasonWaterRegime,
      
      // Organic amendments
      organicAmendments: projectData.organicAmendments || [],
      
      // Emission data (if calculated)
      emissionData: projectData.emissionData ? {
        tier: 2,
        baseline_emissions: projectData.emissionData.baseline_emissions,
        project_emissions: projectData.emissionData.project_emissions,
        emission_reduction: projectData.emissionData.emission_reduction,
        ipcc_reference: projectData.emissionData.ipcc_reference,
        gold_standard_reference: projectData.emissionData.gold_standard_reference,
        notes: projectData.emissionData.notes,
        calculatedAt: new Date(),
      } : undefined,
      
      // Status
      verificationStatus: "pending",
    };

    // 🔹 Add new project to user
    user.projects.push(newProject);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Tier 2 project added successfully",
      project: newProject,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        aadharNumber: user.aadharNumber,
      },
    });
  } catch (error) {
    console.error("Error adding Tier 2 project:", error);

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
      details: error.message,
    });
  }
});


// GET api/farmers/:userId/projects
router.get("/:userId/projects", async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔹 Find user by ID and select only projects
    const user = await User.findById(userId).select("projects");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      projects: user.projects,
    });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// GET api/farmers/:userId/projects/:projectId
router.get("/:userId/projects/:projectId", async (req, res) => {
  try {
    const { userId, projectId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// PUT api/farmers/:userId/profile
router.put("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phoneNumber, aadharNumber, email } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    user.firstName = firstName;
    user.lastName = lastName;
    user.phoneNumber = phoneNumber;
    user.aadharNumber = aadharNumber;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /farmers/:userId/profile
router.get("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔹 Find user by ID and select only profile fields
    const user = await User.findById(userId).select(
      "firstName lastName phoneNumber aadharNumber email"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        aadharNumber: user.aadharNumber,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// 🔹 NEW: Get projects by location (for spatial queries)
router.get("/location/:state/:district", async (req, res) => {
  try {
    const { state, district } = req.params;

    const users = await User.find({
      "projects.state": state,
      "projects.district": district,
    }).select("projects");

    const projects = users.flatMap((u) =>
      u.projects.filter(
        (p) => p.state === state && p.district === district
      )
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects by location:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
