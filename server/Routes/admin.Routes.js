// backend/routes/admin.routes.js
/**
 * RICE DETECTION ALGORITHM - ACADEMIC REFERENCES
 * ================================================
 *
 * This implementation is based on peer-reviewed research in agricultural remote sensing:
 *
 * 1. Zhang et al. (2015) - Phenology-based rice mapping using MODIS
 *    - LSWI + 0.05 ≥ EVI condition for flooding/transplanting detection
 *    - https://pmc.ncbi.nlm.nih.gov/articles/PMC5034934/
 *
 * 2. Xiao et al. (2005, 2006) - Paddy rice mapping in South and Southeast Asia
 *    - LSWI sensitivity to vegetation water content
 *    - Phenology-based algorithms for rice growth dynamics
 *    - https://www.ceom.ou.edu/media/docs/upload/Xiao_2006_rice_asia.pdf
 *
 * 3. Sellaperumal et al. (2025) - Sentinel-1 SAR time series analysis
 *    - VV backscatter: -22.03 to -17.69 dB at flooding
 *    - Maximum: -16.10 to -14.20 dB at heading stage
 *    - https://pmc.ncbi.nlm.nih.gov/articles/PMC11894211/
 *
 * 4. Boschetti et al. (2014) - Spectral indices for paddy rice
 *    - Comparative analysis of normalized difference spectral indices
 *    - https://pmc.ncbi.nlm.nih.gov/articles/PMC3930609/
 *
 * 5. Ryu et al. (2010) - Field spectral measurements in paddy rice
 *    - LSWI decreases linearly with NDVI until NDVI ~0.8
 *    - Rice/non-rice discrimination methodology
 *    - https://www.mssanz.org.au/modsim2011/E4/ryu.pdf
 *
 * ALGORITHM VALIDATION:
 * - NDVI range: 0.4-0.8 (validated across multiple studies)
 * - LSWI threshold: >0.2 (standard for rice water content)
 * - EVI range: 0.3-0.85 (peak biomass consideration)
 * - SAR VV threshold: -18 dB (improved from -15 dB based on research)
 * - Multi-criteria approach: 4/5 criteria (reduces false positives)
 */

import { Router } from "express";
import { protectRoute, Admin } from "../middleware/auth.middleware.js";
import ee from "@google/earthengine";
import initializeEarthEngine, { isInitialized } from "../earthEngine.js";
import User from "../Model/User.js";

import blockchainService from "../blockchain/service/blockchainService.mjs";


const router = Router();

// ============================================
// RICE DETECTION CONFIGURATION
// Research-validated thresholds
// ============================================
const RICE_DETECTION_CONFIG = {
  ndvi: { min: 0.4, max: 0.8 }, // Validated: Zhang et al. (2015)
  lswi: { min: 0.2 }, // Validated: Xiao et al. (2005, 2006)
  evi: { min: 0.3, max: 0.85 }, // Updated: Peak biomass consideration
  ndwi: { min: -0.1 }, // Water content threshold
  ndviLswiMaxDiff: 0.3, // Rice-specific ratio

  sar: {
    vvFloodingThreshold: -18, // Updated: Sellaperumal et al. (2025)
    waterPercentageMin: 0.3,
  },

  waterRegime: {
    continuousFlooded: { min: 0.4 }, // 40%+ coverage required
    intermittent: { min: 0.15, max: 0.5 }, // 15-50% range
    irrigated: { lswiMin: 0.15, waterMin: 0.2 },
    upland: { max: 0.2 }, // <20% acceptable
  },
};

// Protect all admin routes
router.use(protectRoute, Admin);

/**
 * GET /admin/check
 * Verify admin access
 */
router.get("/check", (req, res) => {
  res.status(200).json({ admin: true });
});

/**
 * GET /admin/overview
 * Get dashboard overview statistics
 */
router.get("/overview", async (req, res) => {
  try {
    // Get all users and their projects
    const users = await User.find();

    const allProjects = users.flatMap((user) =>
      user.projects.map((project) => ({
        ...project.toObject(),
        userId: user._id,
        userEmail: user.email,
      }))
    );

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalProjects: allProjects.length,
      pendingProjects: allProjects.filter(
        (p) => p.verificationStatus === "pending"
      ).length,
      approvedProjects: allProjects.filter(
        (p) => p.verificationStatus === "verified"
      ).length,
      rejectedProjects: allProjects.filter(
        (p) => p.verificationStatus === "rejected"
      ).length,
      totalCarbonCredits: allProjects.reduce(
        (sum, p) =>
          sum +
          (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e ||
            0),
        0
      ),
      totalLandArea: allProjects.reduce((sum, p) => sum + (p.landArea || 0), 0),
      averageCreditsPerProject: 0,
    };

    stats.averageCreditsPerProject =
      stats.totalProjects > 0
        ? stats.totalCarbonCredits / stats.totalProjects
        : 0;

    // Get recent projects (last 5)
    const recentProjects = allProjects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Generate trend data (last 6 months)
    const trendData = generateTrendData(allProjects);

    res.json({
      success: true,
      stats,
      recentProjects,
      trendData,
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch overview data",
    });
  }
});

/**
 * GET /admin/users
 * Get all users
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});


/**
 * GET /admin/users/:userId
 * Get specific user details
 */
router.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
});

/**
 * GET /admin/projects
 * Get all projects across all users
 */
router.get("/projects", async (req, res) => {
  try {
    const users = await User.find();

    const projects = users.flatMap((user) =>
      user.projects.map((project) => ({
        ...project.toObject(),
        userId: user._id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
      }))
    );

    // Sort by creation date (newest first)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
    });
  }
});

/**
 * GET /admin/projects/pending
 * Get all pending projects
 */
router.get("/projects/pending", async (req, res) => {
  try {
    const users = await User.find({ "projects.verificationStatus": "pending" });

    const projects = users.flatMap((user) =>
      user.projects
        .filter((p) => p.verificationStatus === "pending")
        .map((project) => ({
          ...project.toObject(),
          userId: user._id,
        }))
    );

    projects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching pending projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending projects",
    });
  }
});

/**
 * GET /admin/projects/approved
 * Get all approved projects
 */
router.get("/projects/approved", async (req, res) => {
  try {
    const users = await User.find({
      "projects.verificationStatus": "verified",
    });

    const projects = users.flatMap((user) =>
      user.projects
        .filter((p) => p.verificationStatus === "verified")
        .map((project) => ({
          ...project.toObject(),
          userId: user._id,
        }))
    );

    projects.sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt));

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching approved projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch approved projects",
    });
  }
});

/**
 * GET /admin/projects/rejected
 * Get all rejected projects
 */
router.get("/projects/rejected", async (req, res) => {
  try {
    const users = await User.find({
      "projects.verificationStatus": "rejected",
    });

    const projects = users.flatMap((user) =>
      user.projects
        .filter((p) => p.verificationStatus === "rejected")
        .map((project) => ({
          ...project.toObject(),
          userId: user._id,
        }))
    );

    projects.sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt));

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching rejected projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch rejected projects",
    });
  }
});

router.get("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findOne({ "projects._id": projectId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const project = user.projects.id(projectId);
    const projectObj = project.toObject();

    // Fix MongoDB legacy coordinates for GeoJSON
    function parseCoord(coord) {
      if (typeof coord === "number") return coord;
      if (coord?.$numberDouble) return parseFloat(coord.$numberDouble);
      if (coord?.$numberInt) return parseInt(coord.$numberInt);
      return parseFloat(coord);
    }
    if (projectObj.boundary?.geometry?.coordinates) {
      projectObj.boundary.geometry.coordinates =
        projectObj.boundary.geometry.coordinates.map((ring) =>
          ring.map((coord) => [parseCoord(coord[0]), parseCoord(coord[1])])
        );
    }

    res.json({
      success: true,
      project: {
        ...projectObj,
        userId: user._id,
        userEmail: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
    });
  }
});

/**
 * POST /admin/projects/:projectId/approve
 * Approve a project
 */
router.post("/projects/:projectId/approve", async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const user = await User.findOne({ "projects._id": projectId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "Project not found" 
      });
    }

    const project = user.projects.id(projectId);

    if (project.verificationStatus === "verified") {
      return res.status(400).json({ 
        success: false, 
        error: "Already approved" 
      });
    }

    // Update database
    project.verificationStatus = "verified";
    project.verifiedAt = new Date();
    project.verifiedBy = req.user._id;
    await user.save();

    // Blockchain operations
    let blockchainResult = { 
      success: false, 
      message: 'Blockchain unavailable' 
    };

    try {
      const isAvailable = await blockchainService.isAvailable();
      
      if (isAvailable) {
        // Generate wallet if needed
        if (!project.walletAddress) {
          const wallet = blockchainService.generateWallet();
          project.walletAddress = wallet.address;
          
          await blockchainService.registerFarmer({
            walletAddress: wallet.address,
            aadharNumber: project.aadharNumber,
            farmerName: project.farmerName
          });
        }

        // Get carbon credits
        const carbonCredits = 
          project.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0;

        // Register project on blockchain
        await blockchainService.registerProject({
          projectId: project._id,
          farmerAddress: project.walletAddress,
          landArea: project.landArea,
          carbonCredits: carbonCredits,
          dataHash: JSON.stringify({
            surveyNumber: project.landSurveyNumber,
            verifiedAt: project.verifiedAt
          })
        });

        // Mint tokens
        const mintResult = await blockchainService.verifyAndMintTokens(project._id);

        if (mintResult.success) {
          project.tokenGenerated = true;
          project.transactionHash = mintResult.transactionHash;
          project.tokenId = project._id;
          await user.save();

          blockchainResult = {
            success: true,
            transactionHash: mintResult.transactionHash,
            walletAddress: project.walletAddress,
            tokensIssued: carbonCredits,
            message: 'Tokens minted successfully'
          };
        }
      }
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      blockchainResult = {
        success: false,
        error: blockchainError.message,
        message: 'Approved but blockchain failed'
      };
    }

    res.json({
      success: true,
      message: "Project approved",
      project,
      blockchain: blockchainResult
    });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to approve" 
    });
  }
});

/**
 * POST /admin/projects/:projectId/reject
 * Reject a project
 */
router.post("/projects/:projectId/reject", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required",
      });
    }

    const user = await User.findOne({ "projects._id": projectId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const project = user.projects.id(projectId);

    project.verificationStatus = "rejected";
    project.verifiedAt = new Date();
    project.verifiedBy = req.user._id;
    project.rejectionReason = reason;

    await user.save();

    res.json({
      success: true,
      message: "Project rejected",
      project,
    });
  } catch (error) {
    console.error("Error rejecting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reject project",
    });
  }
});


/**
 * GET /admin/analytics
 * Get analytics data for dashboard
 */
router.get("/analytics", async (req, res) => {
  try {
    const users = await User.find();

    const allProjects = users.flatMap((user) =>
      user.projects.map((project) => project.toObject())
    );

    // Status distribution
    const statusDistribution = [
      {
        name: "Pending",
        value: allProjects.filter((p) => p.verificationStatus === "pending")
          .length,
      },
      {
        name: "Approved",
        value: allProjects.filter((p) => p.verificationStatus === "verified")
          .length,
      },
      {
        name: "Rejected",
        value: allProjects.filter((p) => p.verificationStatus === "rejected")
          .length,
      },
    ];

    // District-wise data
    const districtMap = new Map();
    allProjects.forEach((p) => {
      const district = p.district || "Unknown";
      if (!districtMap.has(district)) {
        districtMap.set(district, { district, projects: 0, credits: 0 });
      }
      const data = districtMap.get(district);
      data.projects++;
      data.credits +=
        p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0;
    });
    const districtData = Array.from(districtMap.values()).sort(
      (a, b) => b.credits - a.credits
    );

    // Water regime distribution
    const waterRegimeMap = new Map();
    allProjects.forEach((p) => {
      const regime = p.waterRegimeDuringCultivation || "Unknown";
      waterRegimeMap.set(regime, (waterRegimeMap.get(regime) || 0) + 1);
    });
    const waterRegimeDistribution = Array.from(waterRegimeMap.entries()).map(
      ([regime, count]) => ({ regime, count })
    );

    // Monthly trend (last 6 months)
    const monthlyTrend = generateMonthlyTrend(allProjects);

    // Total stats
    const totalStats = {
      totalProjects: allProjects.length,
      totalCredits: allProjects.reduce(
        (sum, p) =>
          sum +
          (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e ||
            0),
        0
      ),
      totalLandArea: allProjects.reduce((sum, p) => sum + (p.landArea || 0), 0),
      averageCreditsPerHectare: 0,
    };

    totalStats.averageCreditsPerHectare =
      totalStats.totalLandArea > 0
        ? totalStats.totalCredits / totalStats.totalLandArea
        : 0;

    res.json({
      success: true,
      analytics: {
        statusDistribution,
        districtData,
        waterRegimeDistribution,
        monthlyTrend,
        totalStats,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
    });
  }
});

router.get("/blockchain/stats", async (req, res) => {
  try {
    const isAvailable = await blockchainService.isAvailable();
    
    if (!isAvailable) {
      return res.json({ 
        success: true, 
        available: false,
        message: 'Blockchain not available'
      });
    }

    const stats = await blockchainService.getStats();
    
    res.json({ 
      success: true, 
      available: true, 
      ...stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /admin/farmers/:walletAddress/balance
 * Get farmer's token balance
 */
router.get("/farmers/:walletAddress/balance", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const isAvailable = await blockchainService.isAvailable();
    
    if (!isAvailable) {
      return res.json({ 
        success: true, 
        available: false,
        balance: 0 
      });
    }
    
    const result = await blockchainService.getBalance(walletAddress);
    
    res.json({
      success: true,
      available: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /admin/projects/:projectId/blockchain
 * Get project blockchain information
 */
router.get("/projects/:projectId/blockchain", async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const isAvailable = await blockchainService.isAvailable();
    
    if (!isAvailable) {
      return res.json({ 
        success: true, 
        available: false 
      });
    }
    
    const result = await blockchainService.getProject(projectId);
    
    res.json({
      success: true,
      available: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});



/**
 * GET /api/admin/farmers/balances
 * Get all farmers' wallet balances from blockchain
 */
router.get('/farmers/balances', protectRoute, Admin, async (req, res) => {
  try {
    // Find all users with verified projects that have wallet addresses
    const users = await User.find({ 
      'projects.walletAddress': { $exists: true, $ne: null },
      'projects.verificationStatus': 'verified'
    });
    
    const isAvailable = await blockchainService.isAvailable();

    const farmersBalances = await Promise.all(
      users.map(async (user) => {
        // Get first verified project with wallet
        const verifiedProject = user.projects.find(
          p => p.walletAddress && p.verificationStatus === 'verified'
        );
        
        if (!verifiedProject) return null;

        // Count total verified projects for this farmer
        const projectCount = user.projects.filter(
          p => p.verificationStatus === 'verified'
        ).length;

        if (!isAvailable) {
          // Return database data if blockchain unavailable
          return {
            address: verifiedProject.walletAddress,
            farmerName: verifiedProject.farmerName,
            balance: '0.00',
            totalCredits: '0.00',
            projectCount,
            blockchainAvailable: false
          };
        }

        try {
          // Get balance from blockchain
          const balanceResult = await blockchainService.getBalance(
            verifiedProject.walletAddress
          );
          
          // Get farmer details from blockchain
          const farmerResult = await blockchainService.getFarmer(
            verifiedProject.walletAddress
          );

          return {
            address: verifiedProject.walletAddress,
            farmerName: verifiedProject.farmerName,
            balance: balanceResult.balance || '0.00',
            totalCredits: farmerResult.farmer?.totalCredits || '0.00',
            projectCount: farmerResult.farmer?.totalProjects || projectCount,
            blockchainAvailable: true
          };
        } catch (error) {
          console.error(`Error getting balance for ${verifiedProject.walletAddress}:`, error);
          return {
            address: verifiedProject.walletAddress,
            farmerName: verifiedProject.farmerName,
            balance: '0.00',
            totalCredits: '0.00',
            projectCount,
            blockchainAvailable: false
          };
        }
      })
    );

    // Filter out null values
    const filtered = farmersBalances.filter(f => f !== null);

    res.json({ 
      success: true, 
      farmers: filtered,
      blockchainAvailable: isAvailable
    });
  } catch (error) {
    console.error('Error fetching farmers balances:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/admin/blockchain/transactions
 * Get recent blockchain transactions
 */
router.get('/blockchain/transactions', protectRoute, Admin, async (req, res) => {
  try {
    // Get all verified projects with transaction hashes
    const users = await User.find({ 
      'projects.transactionHash': { $exists: true, $ne: null }
    });

    const transactions = [];
    
    users.forEach(user => {
      user.projects.forEach(project => {
        if (project.transactionHash && project.verificationStatus === 'verified') {
          transactions.push({
            transactionHash: project.transactionHash,
            farmerName: project.farmerName,
            walletAddress: project.walletAddress,
            carbonCredits: project.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0,
            verifiedAt: project.verifiedAt,
            projectId: project._id
          });
        }
      });
    });

    // Sort by verification date (most recent first)
    transactions.sort((a, b) => 
      new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()
    );

    res.json({ 
      success: true, 
      transactions: transactions.slice(0, 50) // Return last 50 transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /admin/projects/:projectId
 * Delete a project
 */
router.delete("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findOne({ "projects._id": projectId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Use pull() to remove the subdocument
    user.projects.pull(projectId);
    await user.save();

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete project",
    });
  }
});

/**
 * POST /admin/verify-satellite/:projectId
 * Verify project using satellite imagery
 *
 * IMPROVED RICE DETECTION ALGORITHM
 * Based on academic research (see file header for references)
 */
router.post("/verify-satellite/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project
    const user = await User.findOne({ "projects._id": projectId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    const project = user.projects.id(projectId);
    if (!project.boundary) {
      return res
        .status(400)
        .json({ success: false, error: "No boundary data" });
    }

    // Ensure Earth Engine is initialized
    if (!isInitialized()) {
      await initializeEarthEngine();
    }

    // Extract coordinates from GeoJSON
    const coordinates = project.boundary.geometry.coordinates[0];
    const polygon = ee.Geometry.Polygon(coordinates);

    // Calculate actual area (in hectares)
    const actualAreaM2 = polygon.area().getInfo();
    const actualArea = actualAreaM2 / 10000;

    // Define time period for satellite data
    const projectDate = new Date(project.createdAt);
    const endDate = new Date(projectDate);
    const startDate = new Date(projectDate);
    startDate.setMonth(startDate.getMonth() - 3); // 3 months for better coverage

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(
      `Fetching satellite data from ${startDateStr} to ${endDateStr}`
    );

    // ============================================
    // SENTINEL-2: MULTI-SPECTRAL ANALYSIS
    // ============================================

    const sentinel2 = ee
      .ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
      .filterDate(startDateStr, endDateStr)
      .filterBounds(polygon)
      .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
      .select(["B2", "B3", "B4", "B8", "B11", "B12"]); // Blue, Green, Red, NIR, SWIR1, SWIR2

    const s2Count = sentinel2.size().getInfo();
    console.log(`Found ${s2Count} Sentinel-2 images`);

    let ndviAverage = 0;
    let ndwiAverage = 0;
    let lswi = 0;
    let evi = 0;
    let cropDetected = false;
    let confidenceScore = 0;
    let detectionReason = "";

    if (s2Count > 0) {
      // Calculate multiple spectral indices
      const indices = sentinel2.map((image) => {
        // NDVI: (NIR - RED) / (NIR + RED) - General vegetation
        const ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI");

        // NDWI: (GREEN - NIR) / (GREEN + NIR) - Water content in vegetation
        const ndwi = image.normalizedDifference(["B3", "B8"]).rename("NDWI");

        // LSWI: (NIR - SWIR1) / (NIR + SWIR1) - Land surface water index (rice-specific)
        const lswi = image.normalizedDifference(["B8", "B11"]).rename("LSWI");

        // EVI: 2.5 * ((NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1))
        // Enhanced Vegetation Index - better for high biomass areas
        const nir = image.select("B8");
        const red = image.select("B4");
        const blue = image.select("B2");
        const evi = nir
          .subtract(red)
          .divide(nir.add(red.multiply(6)).subtract(blue.multiply(7.5)).add(1))
          .multiply(2.5)
          .rename("EVI");

        return image.addBands([ndvi, ndwi, lswi, evi]);
      });

      const indicesMean = indices.mean();

      // Get statistics for the polygon
      const stats = indicesMean
        .reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: polygon,
          scale: 10,
          maxPixels: 1e9,
        })
        .getInfo();

      ndviAverage = stats.NDVI || 0;
      ndwiAverage = stats.NDWI || 0;
      lswi = stats.LSWI || 0;
      evi = stats.EVI || 0;

      console.log(
        `NDVI: ${ndviAverage}, NDWI: ${ndwiAverage}, LSWI: ${lswi}, EVI: ${evi}`
      );

      // ============================================
      // IMPROVED RICE DETECTION LOGIC
      // Based on Zhang et al. (2015), Xiao et al. (2005, 2006)
      // ============================================

      // Early flooding signal detection (Xiao et al. 2005)
      // During flooding/transplanting, LSWI ≥ NDVI is characteristic of rice
      const earlyFloodingSignal = lswi >= ndviAverage - 0.05;

      // Rice-specific criteria based on research
      const criteria = {
        // NDVI: Rice should have moderate to high NDVI (0.4-0.8)
        // Too high (>0.8) might be dense trees/forest
        ndviOk:
          ndviAverage >= RICE_DETECTION_CONFIG.ndvi.min &&
          ndviAverage <= RICE_DETECTION_CONFIG.ndvi.max,

        // LSWI: Rice fields have high water content (LSWI > 0.2)
        // Trees typically have lower LSWI
        lswiOk: lswi > RICE_DETECTION_CONFIG.lswi.min,

        // IMPROVED: Enhanced NDVI-LSWI relationship check
        // Either close ratio OR early flooding signal (Xiao et al. 2005)
        ndviLswiRatio:
          Math.abs(ndviAverage - lswi) <
            RICE_DETECTION_CONFIG.ndviLswiMaxDiff || earlyFloodingSignal,

        // NDWI: Rice should have higher water content than trees
        // Positive NDWI indicates water presence
        ndwiOk: ndwiAverage > RICE_DETECTION_CONFIG.ndwi.min,

        // IMPROVED: EVI upper bound increased to 0.85 for peak biomass
        // Research shows rice can exceed 0.6-0.7 at peak growth
        eviOk:
          evi >= RICE_DETECTION_CONFIG.evi.min &&
          evi <= RICE_DETECTION_CONFIG.evi.max,
      };

      // Count how many criteria are met
      const criteriaCount = Object.values(criteria).filter(Boolean).length;
      confidenceScore = (criteriaCount / 5) * 100; // Percentage

      // Rice detection: at least 4 out of 5 criteria should be met
      cropDetected = criteriaCount >= 4;

      // IMPROVED: Enhanced detection reasoning with transparency
      if (cropDetected) {
        detectionReason = `Rice detected with ${confidenceScore.toFixed(
          0
        )}% confidence (${criteriaCount}/5 criteria met)`;

        if (earlyFloodingSignal) {
          detectionReason += ` - Early flooding signal detected (LSWI ≥ NDVI)`;
        }
      } else if (ndviAverage > 0.7 && lswi < 0.2) {
        detectionReason = `High NDVI (${ndviAverage.toFixed(
          2
        )}) but low water content (LSWI: ${lswi.toFixed(
          2
        )}) - likely trees/forest, not rice`;
        cropDetected = false;
      } else if (ndviAverage < RICE_DETECTION_CONFIG.ndvi.min) {
        detectionReason = `Low vegetation index (NDVI: ${ndviAverage.toFixed(
          2
        )}) - likely bare soil, buildings, or dry land`;
        cropDetected = false;
      } else if (ndwiAverage < -0.3) {
        detectionReason = `Very low water content (NDWI: ${ndwiAverage.toFixed(
          2
        )}) - not suitable for rice cultivation`;
        cropDetected = false;
      } else {
        detectionReason = `Vegetation detected but criteria insufficient for rice (confidence: ${confidenceScore.toFixed(
          0
        )}%, ${criteriaCount}/5 criteria)`;
        cropDetected = false;
      }

      console.log(
        `Rice Detection: ${cropDetected}, Reason: ${detectionReason}`
      );
    }

    // ============================================
    // IMPROVED SENTINEL-1 SAR FOR WATER DETECTION
    // Based on Sellaperumal et al. (2025)
    // ============================================

    const sentinel1 = ee
      .ImageCollection("COPERNICUS/S1_GRD")
      .filterDate(startDateStr, endDateStr)
      .filterBounds(polygon)
      .filter(ee.Filter.eq("instrumentMode", "IW"))
      .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
      .select("VV");

    const s1Count = sentinel1.size().getInfo();
    console.log(`Found ${s1Count} Sentinel-1 images`);

    let waterDetected = false;
    let waterPercentage = 0;

    if (s1Count > 0) {
      const sentinel1Filtered = sentinel1.map((image) => {
        return image.focal_median(50, "circle", "meters");
      });

      const vvMean = sentinel1Filtered.mean();

      // IMPROVED: Changed threshold from -15 to -18 dB (critical fix)
      // Research shows rice flooding occurs at -17 to -22 dB
      const waterMask = vvMean.lt(
        RICE_DETECTION_CONFIG.sar.vvFloodingThreshold
      );

      const waterStats = waterMask
        .reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: polygon,
          scale: 10,
          maxPixels: 1e9,
        })
        .getInfo();

      waterPercentage = waterStats.VV || 0;
      waterDetected =
        waterPercentage > RICE_DETECTION_CONFIG.sar.waterPercentageMin;

      console.log(
        `Water Percentage: ${(waterPercentage * 100).toFixed(
          1
        )}%, Water Detected: ${waterDetected}`
      );
    }

    // ============================================
    // VERIFICATION RESULTS
    // ============================================

    const areaDifference = Math.abs(project.landArea - actualArea);
    const areaMatchPercentage = (areaDifference / project.landArea) * 100;
    const areaMatch = areaMatchPercentage < 15;

    const declaredWaterRegime =
      project.waterRegimeDuringCultivation.toLowerCase();

    // IMPROVED: Water regime matching logic with refined thresholds
    let waterRegimeMatch = false;
    let waterRegimeReason = "";

    if (declaredWaterRegime.includes("continuously_flooded")) {
      // IMPROVED: 40%+ coverage required (more realistic than 50%)
      waterRegimeMatch =
        waterDetected &&
        waterPercentage >
          RICE_DETECTION_CONFIG.waterRegime.continuousFlooded.min;
      waterRegimeReason = waterDetected
        ? `Water detected (${(waterPercentage * 100).toFixed(1)}% coverage) ${
            waterRegimeMatch ? "matches" : "insufficient for"
          } continuously flooded regime`
        : `No significant water detected - does not match continuously flooded regime`;
    } else if (
      declaredWaterRegime.includes("intermittently_flooded") ||
      declaredWaterRegime.includes("rainfed")
    ) {
      // IMPROVED: 15-50% range (adjusted from 20-60%)
      waterRegimeMatch =
        waterDetected &&
        waterPercentage > RICE_DETECTION_CONFIG.waterRegime.intermittent.min &&
        waterPercentage < RICE_DETECTION_CONFIG.waterRegime.intermittent.max;
      waterRegimeReason = waterDetected
        ? `Intermittent water detected (${(waterPercentage * 100).toFixed(
            1
          )}% coverage) ${
            waterRegimeMatch ? "matches" : "does not match"
          } regime`
        : `Water pattern does not match intermittently flooded regime`;
    } else if (declaredWaterRegime.includes("irrigated")) {
      // Irrigated fields may not always show standing water in SAR
      // Check LSWI (water in vegetation) instead
      waterRegimeMatch =
        lswi > RICE_DETECTION_CONFIG.waterRegime.irrigated.lswiMin ||
        (waterDetected &&
          waterPercentage >
            RICE_DETECTION_CONFIG.waterRegime.irrigated.waterMin);
      waterRegimeReason =
        lswi > RICE_DETECTION_CONFIG.waterRegime.irrigated.lswiMin
          ? `High vegetation water content (LSWI: ${lswi.toFixed(
              2
            )}) indicates irrigation`
          : waterDetected
          ? `Water detected (${(waterPercentage * 100).toFixed(
              1
            )}%) matches irrigated regime`
          : `Low water indicators - may not be actively irrigated`;
    } else if (
      declaredWaterRegime.includes("upland") ||
      declaredWaterRegime.includes("dry")
    ) {
      // IMPROVED: More lenient threshold for dry regime
      waterRegimeMatch =
        !waterDetected ||
        waterPercentage < RICE_DETECTION_CONFIG.waterRegime.upland.max;
      waterRegimeReason = !waterDetected
        ? `No water detected - matches dry/upland regime`
        : `Water detected (${(waterPercentage * 100).toFixed(1)}%) - ${
            waterRegimeMatch ? "acceptable" : "excessive"
          } for dry regime`;
    } else {
      // Unknown regime - use basic check
      const expectedWaterPresence =
        declaredWaterRegime.includes("flooded") ||
        declaredWaterRegime.includes("irrigated");
      waterRegimeMatch =
        (expectedWaterPresence && waterDetected) ||
        (!expectedWaterPresence && !waterDetected);
      waterRegimeReason = `Standard water detection applied for unknown regime`;
    }

    console.log(
      `Water Regime Match: ${waterRegimeMatch}, Reason: ${waterRegimeReason}`
    );

    const verification = {
      declaredArea: project.landArea,
      actualArea: parseFloat(actualArea.toFixed(2)),
      areaMatch: areaMatch,
      areaMatchPercentage: parseFloat(areaMatchPercentage.toFixed(2)),

      // Vegetation indices
      ndviAverage: parseFloat(ndviAverage.toFixed(3)),
      ndwiAverage: parseFloat(ndwiAverage.toFixed(3)),
      lswi: parseFloat(lswi.toFixed(3)),
      evi: parseFloat(evi.toFixed(3)),

      // Detection results
      cropDetected: cropDetected,
      confidenceScore: parseFloat(confidenceScore.toFixed(1)),
      detectionReason: detectionReason,

      // Water detection
      waterDetected: waterDetected,
      waterPercentage: parseFloat((waterPercentage * 100).toFixed(2)),
      waterRegimeMatch: waterRegimeMatch,
      waterRegimeReason: waterRegimeReason,

      // Metadata
      declaredWaterRegime: project.waterRegimeDuringCultivation,
      cultivationPeriod: project.cultivationPeriod,
      lastUpdated: new Date().toISOString(),
      sentinel2ImageCount: s2Count,
      sentinel1ImageCount: s1Count,
      verificationPeriod: {
        start: startDateStr,
        end: endDateStr,
      },

      // IMPROVED: Add configuration used for transparency
      algorithmVersion: "1.1.0-research-validated",
      configUsed: RICE_DETECTION_CONFIG,
    };

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error("Satellite verification error:", error);
    res.status(500).json({
      success: false,
      error: "Satellite verification failed",
      details: error.message,
    });
  }
});




function generateTrendData(projects) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    const monthProjects = projects.filter((p) => {
      const projectDate = new Date(p.createdAt);
      return (
        projectDate.getMonth() === date.getMonth() &&
        projectDate.getFullYear() === date.getFullYear()
      );
    });

    months.push({
      month: monthName,
      projects: monthProjects.length,
      credits: monthProjects.reduce(
        (sum, p) =>
          sum +
          (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e ||
            0),
        0
      ),
    });
  }

  return months;
}

function generateMonthlyTrend(projects) {
  return generateTrendData(projects);
}

export default router;

