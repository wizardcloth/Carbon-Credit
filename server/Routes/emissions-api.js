// backend/routes/emissions.js
import express from "express";
const router = express.Router();

// Rice Emission Calculator Class (Backend Implementation)
class RiceEmissionCalculator {
  constructor() {
    // India-specific baseline emission factor (kg CH4/ha/day)
    this.baselineEF = 0.51;

    // Cultivation periods for Indian rice seasons (days)
    this.cultivationPeriods = {
      kharif: 120, // Monsoon season (June-Nov)
      rabi: 110, // Winter season (Dec-April)
      summer: 90, // Summer season (April-June)
    };

    // Water regime scaling factors (SFw)
    this.waterRegimeSF = {
      continuously_flooded: 1.0,
      single_aeration: 0.68,
      multiple_aeration: 0.48,
      intermittent_irrigation: 0.52,
      awd_mild: 0.63,
      awd_moderate: 0.48,
      rainfed_flood_prone: 1.28,
      rainfed_drought_prone: 0.42,
      deepwater: 1.3,
    };

    // Pre-season water regime scaling factors (SFp)
    this.preseasonSF = {
      non_flooded: 1.0,
      flooded_30_days: 1.22,
      flooded_180_days: 1.68,
    };

    // Organic amendment scaling factors (SFo)
    this.organicAmendmentSF = {
      no_organic: 1.0,
      rice_straw_fresh: 1.59,
      rice_straw_composted: 1.19,
      farmyard_manure: 1.43,
      green_manure: 1.71,
      biogas_slurry: 1.29,
    };

    // Soil type scaling factors (India-specific)
    this.soilTypeSF = {
      alluvial: 1.1,
      laterite: 0.9,
      black_cotton: 1.0,
      red_sandy: 0.8,
      coastal_saline: 1.2,
    };

    // Rice cultivar scaling factors
    this.cultivarSF = {
      traditional: 1.0,
      high_yielding: 1.1,
      hybrid: 1.15,
      aromatic: 0.95,
    };
  }

  // Tier 1 Calculation Method
  calculateTier1(data) {
    const {
      landArea,
      season,
      waterManagement,
      organicMaterial,
      preSeasonWater,
    } = data;

    const cultivationDays = this.cultivationPeriods[season];

    // Get scaling factors
    const sfW = this.waterRegimeSF[waterManagement];
    const sfP = this.preseasonSF[preSeasonWater];
    const sfO = this.organicAmendmentSF[organicMaterial];

    // Calculate daily emission factor
    const dailyEF = this.baselineEF * sfW * sfP * sfO;

    // Total seasonal emissions (kg CH4)
    const totalEmissions = landArea * dailyEF * cultivationDays;

    // Convert to CO2 equivalent (CH4 has GWP of 28)
    const co2Equivalent = (totalEmissions * 28) / 1000;

    return {
      method: "Tier 1",
      area_ha: landArea,
      season: season,
      cultivation_days: cultivationDays,
      daily_ef_kg_ha_day: parseFloat(dailyEF.toFixed(3)),
      total_ch4_emissions_kg: parseFloat(totalEmissions.toFixed(2)),
      co2_equivalent_tons: parseFloat(co2Equivalent.toFixed(2)),
      carbon_credits_potential: parseFloat(co2Equivalent.toFixed(2)),
      scaling_factors: {
        water_regime: sfW,
        preseason: sfP,
        organic_amendment: sfO,
      },
    };
  }

  // Tier 2 Calculation Method
  calculateTier2(data) {
    const {
      landArea,
      season,
      waterManagement,
      organicMaterial,
      preSeasonWater,
      soilType,
      riceVariety,
    } = data;

    const cultivationDays = this.cultivationPeriods[season];

    // Get all scaling factors
    const sfW = this.waterRegimeSF[waterManagement];
    const sfP = this.preseasonSF[preSeasonWater];
    const sfO = this.organicAmendmentSF[organicMaterial];
    const sfS = this.soilTypeSF[soilType];
    const sfR = this.cultivarSF[riceVariety];

    // Calculate daily emission factor with all scaling factors
    const dailyEF = this.baselineEF * sfW * sfP * sfO * sfS * sfR;

    // Total seasonal emissions (kg CH4)
    const totalEmissions = landArea * dailyEF * cultivationDays;

    // Convert to CO2 equivalent
    const co2Equivalent = (totalEmissions * 28) / 1000;

    return {
      method: "Tier 2",
      area_ha: landArea,
      season: season,
      cultivation_days: cultivationDays,
      daily_ef_kg_ha_day: parseFloat(dailyEF.toFixed(3)),
      total_ch4_emissions_kg: parseFloat(totalEmissions.toFixed(2)),
      co2_equivalent_tons: parseFloat(co2Equivalent.toFixed(2)),
      carbon_credits_potential: parseFloat(co2Equivalent.toFixed(2)),
      scaling_factors: {
        water_regime: sfW,
        preseason: sfP,
        organic_amendment: sfO,
        soil_type: sfS,
        cultivar: sfR,
      },
    };
  }

  // Calculate baseline vs improved scenario
  calculateEmissionReduction(baselineData, improvedData, tier = 1) {
    const baselineCalc =
      tier === 1
        ? this.calculateTier1(baselineData)
        : this.calculateTier2(baselineData);

    const improvedCalc =
      tier === 1
        ? this.calculateTier1(improvedData)
        : this.calculateTier2(improvedData);

    const emissionReduction =
      baselineCalc.co2_equivalent_tons - improvedCalc.co2_equivalent_tons;
    const reductionPercentage =
      (emissionReduction / baselineCalc.co2_equivalent_tons) * 100;

    return {
      baseline: baselineCalc,
      improved: improvedCalc,
      emission_reduction_tons: parseFloat(emissionReduction.toFixed(2)),
      reduction_percentage: parseFloat(reductionPercentage.toFixed(2)),
      carbon_credits_earned: parseFloat(emissionReduction.toFixed(2)),
    };
  }
}

const calculator = new RiceEmissionCalculator();

// API Endpoints

// POST /api/emissions/calculate-tier1
router.post("/calculate-tier1", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    const required = [
      "landArea",
      "season",
      "waterManagement",
      "organicMaterial",
      "preSeasonWater",
    ];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Calculate emissions
    const result = calculator.calculateTier1(formData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Tier 1 calculation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during calculation",
    });
  }
});

// POST /api/emissions/calculate-tier2
router.post("/calculate-tier2", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    const required = [
      "landArea",
      "season",
      "waterManagement",
      "organicMaterial",
      "preSeasonWater",
      "soilType",
      "riceVariety",
    ];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Calculate emissions
    const result = calculator.calculateTier2(formData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Tier 2 calculation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during calculation",
    });
  }
});

// POST /api/emissions/compare-scenarios
router.post("/compare-scenarios", async (req, res) => {
  try {
    const { baseline, improved, tier } = req.body;

    if (!baseline || !improved) {
      return res.status(400).json({
        success: false,
        error: "Both baseline and improved scenarios are required",
      });
    }

    const tierLevel = tier || 1;
    const comparison = calculator.calculateEmissionReduction(
      baseline,
      improved,
      tierLevel
    );

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error("Scenario comparison error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during comparison",
    });
  }
});

// GET /api/emissions/parameters
router.get("/parameters", (req, res) => {
  try {
    const parameters = {
      waterRegimeOptions: Object.keys(calculator.waterRegimeSF).map((key) => ({
        value: key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        scaling_factor: calculator.waterRegimeSF[key],
      })),

      organicAmendmentOptions: Object.keys(calculator.organicAmendmentSF).map(
        (key) => ({
          value: key,
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          scaling_factor: calculator.organicAmendmentSF[key],
        })
      ),

      soilTypeOptions: Object.keys(calculator.soilTypeSF).map((key) => ({
        value: key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        scaling_factor: calculator.soilTypeSF[key],
      })),

      cultivarOptions: Object.keys(calculator.cultivarSF).map((key) => ({
        value: key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        scaling_factor: calculator.cultivarSF[key],
      })),

      seasonOptions: Object.keys(calculator.cultivationPeriods).map((key) => ({
        value: key,
        label: key.replace(/\b\w/g, (l) => l.toUpperCase()),
        cultivation_days: calculator.cultivationPeriods[key],
      })),
    };

    res.json({
      success: true,
      data: parameters,
    });
  } catch (error) {
    console.error("Parameters fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// module.exports = router;
export default router;
