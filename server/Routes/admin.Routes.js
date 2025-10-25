// backend/routes/admin.routes.js
import { Router } from "express";
import { protectRoute, Admin } from "../middleware/auth.middleware.js";
import ee from '@google/earthengine';
import initializeEarthEngine, { isInitialized } from '../earthEngine.js';
import User from "../Model/User.js";

const router = Router();

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
    
    const allProjects = users.flatMap(user => 
      user.projects.map(project => ({
        ...project.toObject(),
        userId: user._id,
        userEmail: user.email,
      }))
    );

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalProjects: allProjects.length,
      pendingProjects: allProjects.filter(p => p.verificationStatus === "pending").length,
      approvedProjects: allProjects.filter(p => p.verificationStatus === "verified").length,
      rejectedProjects: allProjects.filter(p => p.verificationStatus === "rejected").length,
      totalCarbonCredits: allProjects.reduce(
        (sum, p) => sum + (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0),
        0
      ),
      totalLandArea: allProjects.reduce((sum, p) => sum + (p.landArea || 0), 0),
      averageCreditsPerProject: 0,
    };

    stats.averageCreditsPerProject = stats.totalProjects > 0 
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
    const users = await User.find()
      .select("-__v")
      .sort({ createdAt: -1 });

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
    
    const projects = users.flatMap(user => 
      user.projects.map(project => ({
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
    
    const projects = users.flatMap(user => 
      user.projects
        .filter(p => p.verificationStatus === "pending")
        .map(project => ({
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
    const users = await User.find({ "projects.verificationStatus": "verified" });
    
    const projects = users.flatMap(user => 
      user.projects
        .filter(p => p.verificationStatus === "verified")
        .map(project => ({
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
    const users = await User.find({ "projects.verificationStatus": "rejected" });
    
    const projects = users.flatMap(user => 
      user.projects
        .filter(p => p.verificationStatus === "rejected")
        .map(project => ({
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
      if (typeof coord === 'number') return coord;
      if (coord?.$numberDouble) return parseFloat(coord.$numberDouble);
      if (coord?.$numberInt) return parseInt(coord.$numberInt);
      return parseFloat(coord);
    }
    if (projectObj.boundary?.geometry?.coordinates) {
      projectObj.boundary.geometry.coordinates = projectObj.boundary.geometry.coordinates.map(
        ring => ring.map(coord => [parseCoord(coord[0]), parseCoord(coord[1])])
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
        error: "Project not found",
      });
    }

    const project = user.projects.id(projectId);
    
    if (project.verificationStatus === "verified") {
      return res.status(400).json({
        success: false,
        error: "Project is already approved",
      });
    }

    project.verificationStatus = "verified";
    project.verifiedAt = new Date();
    project.verifiedBy = req.user._id; // Admin who approved

    await user.save();

    res.json({
      success: true,
      message: "Project approved successfully",
      project,
    });
  } catch (error) {
    console.error("Error approving project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve project",
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
    
    const allProjects = users.flatMap(user => 
      user.projects.map(project => project.toObject())
    );

    // Status distribution
    const statusDistribution = [
      {
        name: "Pending",
        value: allProjects.filter(p => p.verificationStatus === "pending").length,
      },
      {
        name: "Approved",
        value: allProjects.filter(p => p.verificationStatus === "verified").length,
      },
      {
        name: "Rejected",
        value: allProjects.filter(p => p.verificationStatus === "rejected").length,
      },
    ];

    // District-wise data
    const districtMap = new Map();
    allProjects.forEach(p => {
      const district = p.district || "Unknown";
      if (!districtMap.has(district)) {
        districtMap.set(district, { district, projects: 0, credits: 0 });
      }
      const data = districtMap.get(district);
      data.projects++;
      data.credits += p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0;
    });
    const districtData = Array.from(districtMap.values())
      .sort((a, b) => b.credits - a.credits);

    // Water regime distribution
    const waterRegimeMap = new Map();
    allProjects.forEach(p => {
      const regime = p.waterRegimeDuringCultivation || "Unknown";
      waterRegimeMap.set(regime, (waterRegimeMap.get(regime) || 0) + 1);
    });
    const waterRegimeDistribution = Array.from(waterRegimeMap.entries())
      .map(([regime, count]) => ({ regime, count }));

    // Monthly trend (last 6 months)
    const monthlyTrend = generateMonthlyTrend(allProjects);

    // Total stats
    const totalStats = {
      totalProjects: allProjects.length,
      totalCredits: allProjects.reduce(
        (sum, p) => sum + (p.emissionData?.emission_reduction?.carbon_credit_potential_tco2e || 0),
        0
      ),
      totalLandArea: allProjects.reduce((sum, p) => sum + (p.landArea || 0), 0),
      averageCreditsPerHectare: 0,
    };

    totalStats.averageCreditsPerHectare = totalStats.totalLandArea > 0
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
        error: "Project not found" 
      });
    }

    // Use pull() to remove the subdocument
    user.projects.pull(projectId);
    await user.save();

    res.json({ 
      success: true, 
      message: "Project deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete project" 
    });
  }
});



router.post("/verify-satellite/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find project
    const user = await User.findOne({ "projects._id": projectId });
    if (!user) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const project = user.projects.id(projectId);
    if (!project.boundary) {
      return res.status(400).json({ success: false, error: "No boundary data" });
    }

    // Ensure Earth Engine is initialized
    if (!isInitialized()) {
      await initializeEarthEngine();
    }

    // Extract coordinates from GeoJSON
    const coordinates = project.boundary.geometry.coordinates[0];

    // Create Earth Engine polygon
    const polygon = ee.Geometry.Polygon(coordinates);

    // Calculate actual area (in hectares)
    const actualAreaM2 = polygon.area().getInfo();
    const actualArea = actualAreaM2 / 10000; // Convert to hectares

    // Define time period for satellite data
    const projectDate = new Date(project.createdAt);
    const endDate = new Date(projectDate);
    const startDate = new Date(projectDate);
    startDate.setMonth(startDate.getMonth() - 2); // 2 months before project creation

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching satellite data from ${startDateStr} to ${endDateStr}`);

    // ============================================
    // SENTINEL-2 FOR CROP DETECTION (NDVI)
    // ============================================

    const sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate(startDateStr, endDateStr)
      .filterBounds(polygon)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
      .select(['B4', 'B8']); // Red and NIR bands

    // Check if we have images
    const s2Count = sentinel2.size().getInfo();
    console.log(`Found ${s2Count} Sentinel-2 images`);

    let ndviAverage = 0;
    let cropDetected = false;

    if (s2Count > 0) {
      // Calculate NDVI: (NIR - RED) / (NIR + RED)
      const ndviCollection = sentinel2.map((image) => {
        return image.normalizedDifference(['B8', 'B4']).rename('NDVI');
      });

      const ndviMean = ndviCollection.mean();

      // Get average NDVI for the polygon
      const ndviStats = ndviMean.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: polygon,
        scale: 10,
        maxPixels: 1e9
      }).getInfo();

      ndviAverage = ndviStats.NDVI || 0;

      // NDVI > 0.4 indicates active vegetation (rice crop)
      cropDetected = ndviAverage > 0.4;

      console.log(`NDVI Average: ${ndviAverage}, Crop Detected: ${cropDetected}`);
    }

    // ============================================
    // SENTINEL-1 SAR FOR WATER DETECTION
    // ============================================

    const sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterDate(startDateStr, endDateStr)
      .filterBounds(polygon)
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
      .select('VV');

    const s1Count = sentinel1.size().getInfo();
    console.log(`Found ${s1Count} Sentinel-1 images`);

    let waterDetected = false;
    let waterPercentage = 0;

    if (s1Count > 0) {
      // Apply speckle filtering
      const sentinel1Filtered = sentinel1.map((image) => {
        return image.focal_median(50, 'circle', 'meters');
      });

      const vvMean = sentinel1Filtered.mean();

      // Water detection threshold: VV < -15 dB indicates water
      const waterMask = vvMean.lt(-15);

      const waterStats = waterMask.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: polygon,
        scale: 10,
        maxPixels: 1e9
      }).getInfo();

      waterPercentage = waterStats.VV || 0;

      // If >30% of pixels show water, consider it flooded
      waterDetected = waterPercentage > 0.3;

      console.log(`Water Percentage: ${waterPercentage}, Water Detected: ${waterDetected}`);
    }

    // ============================================
    // VERIFICATION RESULTS
    // ============================================

    // Check if declared area matches actual area (within 15% tolerance)
    const areaDifference = Math.abs(project.landArea - actualArea);
    const areaMatchPercentage = (areaDifference / project.landArea) * 100;
    const areaMatch = areaMatchPercentage < 15;

    // Check if water regime matches
    const declaredWaterRegime = project.waterRegimeDuringCultivation.toLowerCase();
    const expectedWaterPresence = declaredWaterRegime.includes('flooded') || 
                                   declaredWaterRegime.includes('irrigated');
    const waterRegimeMatch = (expectedWaterPresence && waterDetected) || 
                              (!expectedWaterPresence && !waterDetected);

    const verification = {
      declaredArea: project.landArea,
      actualArea: parseFloat(actualArea.toFixed(2)),
      areaMatch: areaMatch,
      areaMatchPercentage: parseFloat(areaMatchPercentage.toFixed(2)),
      ndviAverage: parseFloat(ndviAverage.toFixed(3)),
      cropDetected: cropDetected,
      waterDetected: waterDetected,
      waterPercentage: parseFloat((waterPercentage * 100).toFixed(2)),
      waterRegimeMatch: waterRegimeMatch,
      declaredWaterRegime: project.waterRegimeDuringCultivation,
      cultivationPeriod: project.cultivationPeriod,
      lastUpdated: new Date().toISOString(),
      sentinel2ImageCount: s2Count,
      sentinel1ImageCount: s1Count,
      verificationPeriod: {
        start: startDateStr,
        end: endDateStr
      }
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

export default router;
