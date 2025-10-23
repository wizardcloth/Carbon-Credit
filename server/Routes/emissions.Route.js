import express from "express";
const router = express.Router();

/**
 * IPCC 2019 Refinement – Tier 2 (AFOLU Vol.4, Ch.5 Rice Cultivation)
 * Enhanced to include baseline calculation and carbon credit potential
 * 
 * Key Formulas:
 * 1. Baseline Emission: EF_baseline = EFc × SFw_baseline × SFp × SFo_baseline
 * 2. Project Emission: EF_project = EFc × SFw_project × SFp × SFo_project  
 * 3. Emission Reduction: ER = (EF_baseline - EF_project) × cultivation_period × land_area
 * 4. Carbon Credit Potential = Emission Reduction (in tCO2e)
 */

class RiceEmissionCalculator {
  constructor() {
    // IPCC 2019 Table 5.11 - Regional Baseline Emission Factors
    this.regionalBaselineEF = {
      south_asia: 0.85,    // India, Pakistan, Bangladesh, etc.
      east_asia: 1.32,
      southeast_asia: 1.22,
      africa: 1.19,
      europe: 1.56,
      north_america: 0.65,
      south_america: 1.27,
      global_default: 1.19
    };

    this.defaultCultivationPeriod = 112; // days for South Asia

    // IPCC 2019 Table 5.12 - Water Regime Scaling Factors (SFw)
    this.waterRegimeSF = {
      continuously_flooded: 1.00,
      single_drainage: 0.71,
      multiple_drainage_awd: 0.55,
      regular_rainfed: 0.54,
      drought_prone: 0.16,
      deep_water: 0.06,
      upland: 0.00
    };

    // IPCC 2019 Table 5.13 - Pre-season Water Regime Scaling Factors (SFp)
    this.preSeasonSF = {
      non_flooded_less_180: 1.00,
      non_flooded_more_180: 0.89,
      flooded_more_30: 2.41,
      non_flooded_more_365: 0.59
    };

    // IPCC 2019 Table 5.14 - Conversion Factors for Organic Amendments (CFOA)
    this.organicAmendmentCFOA = {
      straw_short: 1.00,
      straw_long: 0.19,
      compost: 0.17,
      farmyard_manure: 0.21,
      green_manure: 0.45
    };

    // GWP for CH4 over 100-year period (IPCC AR6: 28, Gold Standard may use 25-28)
    this.ch4_gwp = 28;
    
    // Uncertainty deduction as per Gold Standard (15% for default values)
    this.uncertainty_deduction = 0.15;
  }

  /**
   * Calculate SFo (Organic Amendment Scaling Factor)
   * Formula: SFo = (1 + Σ(ROAi × CFOAi))^0.59
   */
  calculateOrganicAmendmentSF(organicAmendments) {
    if (!organicAmendments || organicAmendments.length === 0) {
      return 1.0;
    }

    let sum = 0;
    for (const amendment of organicAmendments) {
      const { type, applicationRate, timing } = amendment;
      
      let cfoa = 0;
      if (type === "straw") {
        cfoa = timing === "short" 
          ? this.organicAmendmentCFOA.straw_short 
          : this.organicAmendmentCFOA.straw_long;
      } else if (type === "compost") {
        cfoa = this.organicAmendmentCFOA.compost;
      } else if (type === "farmyard_manure") {
        cfoa = this.organicAmendmentCFOA.farmyard_manure;
      } else if (type === "green_manure") {
        cfoa = this.organicAmendmentCFOA.green_manure;
      }

      sum += applicationRate * cfoa;
    }

    const sfo = Math.pow(1 + sum, 0.59);
    return sfo;
  }

  /**
   * Calculate BASELINE emissions (Business-as-usual scenario)
   * This represents what emissions would be if the farmer continues conventional practices
   * 
   * Baseline assumes: Continuously flooded rice cultivation
   */
  calculateBaselineEmissions(data) {
    const {
      landArea,
      cultivationPeriod = this.defaultCultivationPeriod,
      preSeasonWaterRegime,
      organicAmendments = [],
      region = "south_asia"
    } = data;

    // Baseline emission factor (EFc)
    const efc = this.regionalBaselineEF[region] || this.regionalBaselineEF.south_asia;

    // Baseline water regime: CONTINUOUSLY FLOODED (conventional practice)
    const sfW_baseline = this.waterRegimeSF.continuously_flooded; // 1.00

    // Pre-season water regime (same for baseline and project)
    const sfP = this.preSeasonSF[preSeasonWaterRegime] || 1.0;

    // Baseline organic amendment (conventional practice - typically with straw)
    // Assume 5 tonnes/ha of straw (IPCC default for conventional practice)
    const baselineOrganicAmendments = [
      { type: "straw", applicationRate: 5.0, timing: "long" }
    ];
    const sfO_baseline = this.calculateOrganicAmendmentSF(baselineOrganicAmendments);

    // Soil type and cultivar scaling factors (default = 1.0)
    const sfS = 1.0;
    const sfR = 1.0;

    // Calculate baseline daily emission factor
    // EF_baseline = EFc × SFw_baseline × SFp × SFo_baseline × SFs × SFr
    const dailyEF_baseline = efc * sfW_baseline * sfP * sfO_baseline * sfS * sfR;

    // Calculate total baseline CH4 emissions
    // Total CH4 = EF × cultivation_period × land_area
    const totalCH4_baseline = landArea * dailyEF_baseline * cultivationPeriod;

    // Convert to CO2 equivalent
    const co2eq_baseline = (totalCH4_baseline * this.ch4_gwp) / 1000; // Convert kg to tonnes

    return {
      daily_ef_kg_ha_day: dailyEF_baseline.toFixed(4),
      total_ch4_emissions_kg: totalCH4_baseline.toFixed(2),
      co2_equivalent_tons: co2eq_baseline.toFixed(3),
      scaling_factors: {
        sfW: sfW_baseline.toFixed(3),
        sfP: sfP.toFixed(3),
        sfO: sfO_baseline.toFixed(3),
        sfS: sfS.toFixed(3),
        sfR: sfR.toFixed(3)
      }
    };
  }

  /**
   * Calculate PROJECT emissions (with improved water management)
   * This is the actual emissions with the farmer's improved practices
   */
  calculateProjectEmissions(data) {
    const {
      landArea,
      cultivationPeriod = this.defaultCultivationPeriod,
      waterRegimeDuringCultivation,
      preSeasonWaterRegime,
      organicAmendments = [],
      region = "south_asia"
    } = data;

    // Project emission factor (EFc)
    const efc = this.regionalBaselineEF[region] || this.regionalBaselineEF.south_asia;

    // Project water regime (improved practice - e.g., AWD, single/multiple drainage)
    const sfW_project = this.waterRegimeSF[waterRegimeDuringCultivation] || 1.0;

    // Pre-season water regime
    const sfP = this.preSeasonSF[preSeasonWaterRegime] || 1.0;

    // Project organic amendment
    const sfO_project = this.calculateOrganicAmendmentSF(organicAmendments);

    // Soil type and cultivar scaling factors
    const sfS = 1.0;
    const sfR = 1.0;

    // Calculate project daily emission factor
    // EF_project = EFc × SFw_project × SFp × SFo_project × SFs × SFr
    const dailyEF_project = efc * sfW_project * sfP * sfO_project * sfS * sfR;

    // Calculate total project CH4 emissions
    const totalCH4_project = landArea * dailyEF_project * cultivationPeriod;

    // Convert to CO2 equivalent
    const co2eq_project = (totalCH4_project * this.ch4_gwp) / 1000;

    return {
      daily_ef_kg_ha_day: dailyEF_project.toFixed(4),
      total_ch4_emissions_kg: totalCH4_project.toFixed(2),
      co2_equivalent_tons: co2eq_project.toFixed(3),
      scaling_factors: {
        sfW: sfW_project.toFixed(3),
        sfP: sfP.toFixed(3),
        sfO: sfO_project.toFixed(3),
        sfS: sfS.toFixed(3),
        sfR: sfR.toFixed(3)
      }
    };
  }

  /**
   * Calculate EMISSION REDUCTION and CARBON CREDIT POTENTIAL
   * Formula: ER = (Baseline Emissions - Project Emissions) × (1 - Uncertainty Deduction)
   * 
   * This is the key metric for carbon credits
   */
  calculateEmissionReduction(baselineEmissions, projectEmissions) {
    // Parse the CO2 equivalent values
    const baseline_co2e = parseFloat(baselineEmissions.co2_equivalent_tons);
    const project_co2e = parseFloat(projectEmissions.co2_equivalent_tons);

    // Calculate gross emission reduction
    const gross_reduction = baseline_co2e - project_co2e;

    // Apply uncertainty deduction (Gold Standard requires 15% for IPCC defaults)
    const net_reduction = gross_reduction * (1 - this.uncertainty_deduction);

    // Calculate reduction percentage
    const reduction_percentage = (gross_reduction / baseline_co2e) * 100;

    return {
      gross_emission_reduction_tco2e: gross_reduction.toFixed(3),
      uncertainty_deduction_percent: (this.uncertainty_deduction * 100).toFixed(0),
      net_emission_reduction_tco2e: net_reduction.toFixed(3),
      reduction_percentage: reduction_percentage.toFixed(2),
      carbon_credit_potential_tco2e: net_reduction.toFixed(3), // 1 credit = 1 tCO2e
      annual_carbon_credits: Math.floor(net_reduction) // Whole number of credits
    };
  }

  /**
   * Calculate comprehensive Tier 2 emissions with baseline comparison
   */
  calculateTier2WithBaseline(data) {
    const {
      landArea,
      cultivationPeriod = this.defaultCultivationPeriod,
      waterRegimeDuringCultivation,
      preSeasonWaterRegime,
      organicAmendments = [],
      region = "south_asia"
    } = data;

    // Get baseline emission factor (EFc)
    const efc = this.regionalBaselineEF[region] || this.regionalBaselineEF.south_asia;

    // Calculate baseline emissions
    const baselineResults = this.calculateBaselineEmissions(data);

    // Calculate project emissions
    const projectResults = this.calculateProjectEmissions(data);

    // Calculate emission reduction and carbon credit potential
    const reductionResults = this.calculateEmissionReduction(baselineResults, projectResults);

    return {
      method: "Tier 2 (IPCC 2019 AFOLU Vol.4 Ch.5) with Gold Standard Alignment",
      region: region,
      area_ha: landArea,
      cultivation_period_days: cultivationPeriod,
      baseline_ef_kg_ha_day: efc.toFixed(3),
      
      // BASELINE EMISSIONS (Business-as-usual)
      baseline_emissions: {
        scenario: "Continuously flooded rice cultivation (conventional practice)",
        daily_ef_kg_ha_day: baselineResults.daily_ef_kg_ha_day,
        total_ch4_emissions_kg: baselineResults.total_ch4_emissions_kg,
        co2_equivalent_tons: baselineResults.co2_equivalent_tons,
        scaling_factors: baselineResults.scaling_factors
      },
      
      // PROJECT EMISSIONS (With improved water management)
      project_emissions: {
        scenario: `Improved water management: ${this.getWaterRegimeDescription(waterRegimeDuringCultivation)}`,
        daily_ef_kg_ha_day: projectResults.daily_ef_kg_ha_day,
        total_ch4_emissions_kg: projectResults.total_ch4_emissions_kg,
        co2_equivalent_tons: projectResults.co2_equivalent_tons,
        scaling_factors: projectResults.scaling_factors
      },
      
      // EMISSION REDUCTION & CARBON CREDIT POTENTIAL
      emission_reduction: {
        gross_reduction_tco2e: reductionResults.gross_emission_reduction_tco2e,
        uncertainty_deduction: `${reductionResults.uncertainty_deduction_percent}%`,
        net_reduction_tco2e: reductionResults.net_emission_reduction_tco2e,
        reduction_percentage: `${reductionResults.reduction_percentage}%`,
        carbon_credit_potential_tco2e: reductionResults.carbon_credit_potential_tco2e,
        estimated_annual_carbon_credits: reductionResults.annual_carbon_credits
      },
      
      organic_amendments_detail: organicAmendments.map(oa => ({
        type: oa.type,
        application_rate_t_ha: oa.applicationRate,
        timing: oa.timing || "N/A"
      })),
      
      ipcc_reference: "IPCC 2019 Refinement, Volume 4, Chapter 5, Tables 5.11-5.14",
      gold_standard_reference: "Gold Standard Methodology v1.0 for Methane Emission Reduction",
      notes: [
        "Baseline assumes continuously flooded conditions (conventional practice)",
        "Emission reduction = Baseline - Project emissions",
        "Carbon credits calculated with 15% uncertainty deduction per Gold Standard",
        "1 carbon credit = 1 tCO2e of verified emission reduction"
      ]
    };
  }

  getWaterRegimeDescription(waterRegime) {
    const descriptions = {
      continuously_flooded: "Continuously Flooded",
      single_drainage: "Single Drainage Period (AWD)",
      multiple_drainage_awd: "Multiple Drainage / AWD",
      regular_rainfed: "Regular Rainfed",
      drought_prone: "Drought Prone",
      deep_water: "Deep Water",
      upland: "Upland / Never Flooded"
    };
    return descriptions[waterRegime] || waterRegime;
  }
}

const calculator = new RiceEmissionCalculator();

/**
 * POST /emissions/calculate-tier2
 * Calculate CH4 emissions using IPCC 2019 Tier 2 methodology
 * NOW INCLUDES: Baseline, Project Emissions, Reduction, and Carbon Credit Potential
 */
router.post("/calculate-tier2", async (req, res) => {
  try {
    const formData = req.body;

    // Validate required fields
    const required = [
      "landArea",
      "cultivationPeriod",
      "waterRegimeDuringCultivation",
      "preSeasonWaterRegime"
    ];

    const missing = required.filter((f) => 
      formData[f] === undefined || formData[f] === null || formData[f] === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`
      });
    }

    // Validate land area
    if (formData.landArea <= 0) {
      return res.status(400).json({
        success: false,
        error: "Land area must be greater than 0"
      });
    }

    // Validate cultivation period
    if (formData.cultivationPeriod <= 0 || formData.cultivationPeriod > 200) {
      return res.status(400).json({
        success: false,
        error: "Cultivation period must be between 1 and 200 days"
      });
    }

    // Validate organic amendments if provided
    if (formData.organicAmendments) {
      for (const amendment of formData.organicAmendments) {
        if (!amendment.type || amendment.applicationRate === undefined) {
          return res.status(400).json({
            success: false,
            error: "Each organic amendment must have type and applicationRate"
          });
        }
        if (amendment.applicationRate < 0) {
          return res.status(400).json({
            success: false,
            error: "Application rate must be non-negative"
          });
        }
      }
    }

    // Calculate emissions with baseline comparison
    const result = calculator.calculateTier2WithBaseline(formData);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Tier 2 calculation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during emission calculation",
      details: error.message
    });
  }
});

/**
 * GET /emissions/ipcc-defaults
 * Get IPCC 2019 default values for reference
 */
router.get("/ipcc-defaults", (req, res) => {
  const calc = new RiceEmissionCalculator();
  res.json({
    success: true,
    data: {
      regional_baseline_ef: calc.regionalBaselineEF,
      water_regime_sf: calc.waterRegimeSF,
      pre_season_sf: calc.preSeasonSF,
      organic_amendment_cfoa: calc.organicAmendmentCFOA,
      default_cultivation_period_south_asia: calc.defaultCultivationPeriod,
      ch4_gwp: calc.ch4_gwp,
      uncertainty_deduction: calc.uncertainty_deduction,
      reference: "IPCC 2019 Refinement, Volume 4, Chapter 5"
    }
  });
});

export default router;