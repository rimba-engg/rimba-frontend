
import {
    LivestockData,
    BiogasData,
    EnergyData,
    FuelProduced,
    ElectricityInfo,
    FacilityInfo,
    CalculationResults
  } from "./calculator-types";
  
  // Constants for calculations
  const METHANE_GWP = 25; // Global Warming Potential of CH4 (Tier 1)
  const MMBTUTOMJ = 1055.06; // Conversion factor from MMBtu to MJ
  const SCHTODENSITY = 0.0423; // kg/scf at standard conditions
  
  // Livestock-specific constants
  const livestockConstants = {
    Dairy: {
      vsExcretionRate: 8.64, // kg VS/animal/day
      bo: 0.24, // m3 CH4/kg VS
      mcfLagoon: 0.68, // Methane Conversion Factor for lagoon
      mcfPit: 0.35, // MCF for storage pit/basin
      mcfDryLot: 0.02, // MCF for daily spread/dry lot
    },
    Swine: {
      vsExcretionRate: 0.48, // kg VS/animal/day
      bo: 0.48, // m3 CH4/kg VS
      mcfLagoon: 0.78,
      mcfPit: 0.45,
      mcfDryLot: 0.01,
    }
  };
  
  // Digester type efficiency
  const digesterEfficiency = {
    "Covered Lagoon": 0.95, // 95% collection efficiency
    "Enclosed Vessel": 0.98, // 98% collection efficiency
  };
  
  // Calculate Baseline Methane Emissions
  export const calculateBaselineMethaneEmissions = (
    livestockData: LivestockData
  ): number => {
    const { 
      livestockType, 
      numberOfAnimals, 
      baselineManureSystem, 
      reportingDays, 
      avgStorageTemperature, 
      fractionVS 
    } = livestockData;
  
    // Get the appropriate constants for the livestock type
    const constants = livestockConstants[livestockType];
    
    // Get the appropriate MCF based on the baseline manure management system
    let mcf = 0;
    switch (baselineManureSystem) {
      case "Open Lagoon":
        mcf = constants.mcfLagoon;
        break;
      case "Storage Pit/Basin":
        mcf = constants.mcfPit;
        break;
      case "Daily Spread/Dry Lot":
        mcf = constants.mcfDryLot;
        break;
    }
    
    // Temperature adjustment for MCF (simplified)
    const tempAdjustment = 1 + (avgStorageTemperature - 20) * 0.01;
    const adjustedMcf = mcf * tempAdjustment;
    
    // Calculate baseline methane emissions
    // BM_CH4 = Number of Animals × VS Excretion Rate × Bo × MCF × RD × VS Fraction
    const baselineEmissions = 
      numberOfAnimals * 
      constants.vsExcretionRate * 
      constants.bo * 
      adjustedMcf * 
      reportingDays * 
      fractionVS * 
      0.67; // Density of methane kg/m3
    
    return baselineEmissions;
  };
  
  // Calculate Project Methane Emissions
  export const calculateProjectMethaneEmissions = (
    livestockData: LivestockData,
    biogasData: BiogasData,
    facilityInfo: FacilityInfo
  ): number => {
    const baselineEmissions = calculateBaselineMethaneEmissions(livestockData);
    const collectionEfficiency = digesterEfficiency[facilityInfo.digesterType];
    
    // Uncollected methane emissions
    const uncollectedEmissions = baselineEmissions * (1 - collectionEfficiency);
    
    // Estimate effluent storage emissions (simplified calculation)
    const effluentStorageEmissions = baselineEmissions * 0.05;
    
    // Estimate venting and fugitive emissions (simplified)
    const ventingEmissions = biogasData.rawBiogasFlow * 
      (biogasData.rawBiogasMethaneContent / 100) * 
      0.01 * // Assume 1% venting
      SCHTODENSITY;
    
    const fugitiveEmissions = biogasData.biogasToUpgrading * 
      (biogasData.upgradingFeedstockMethane / 100) * 
      0.02 * // Assume 2% fugitive losses
      SCHTODENSITY;
    
    return uncollectedEmissions + effluentStorageEmissions + ventingEmissions + fugitiveEmissions;
  };
  
  // Calculate Avoided Methane Credit
  export const calculateAvoidedMethaneCredit = (
    baselineEmissions: number,
    projectEmissions: number,
    fuelProduced: FuelProduced
  ): number => {
    const netMethaneAvoided = baselineEmissions - projectEmissions;
    
    // Convert biomethane from MMBtu to MJ
    const biomethaneEnergyMJ = fuelProduced.biomethaneInjected * MMBTUTOMJ;
    
    if (biomethaneEnergyMJ <= 0) return 0;
    
    // AMC (g CO2e/MJ) = (Net CH4 Avoided (kg) × GWP_CH4 × 1000) / Annual Biomethane Energy (MJ)
    const avoidedMethaneCredit = (netMethaneAvoided * METHANE_GWP * 1000) / biomethaneEnergyMJ;
    
    return avoidedMethaneCredit;
  };
  
  // Calculate Energy-Related Emissions
  export const calculateEnergyEmissions = (
    energyData: EnergyData,
    electricityInfo: ElectricityInfo,
    fuelProduced: FuelProduced
  ): {
    electricityEmissions: number;
    naturalGasEmissions: number;
    dieselEmissions: number;
    fugitiveEmissions: number;
  } => {
    // Convert biomethane from MMBtu to MJ
    const biomethaneEnergyMJ = fuelProduced.biomethaneInjected * MMBTUTOMJ;
    
    if (biomethaneEnergyMJ <= 0) return {
      electricityEmissions: 0,
      naturalGasEmissions: 0,
      dieselEmissions: 0,
      fugitiveEmissions: 0
    };
    
    // Total electricity consumption (kWh)
    const totalElectricity = 
      energyData.baselineElectricityConsumption +
      energyData.digesterElectricityConsumption +
      energyData.upgradingElectricityConsumption -
      fuelProduced.electricityProducedOnsite; // Subtract on-site generation
    
    // Total natural gas consumption (MMBtu)
    const totalNaturalGas = 
      energyData.baselineNaturalGasConsumption +
      energyData.digesterNaturalGasConsumption +
      energyData.upgradingNaturalGasConsumption;
    
    // Total diesel consumption (Gallons)
    const totalDiesel = 
      energyData.baselineDieselConsumption +
      energyData.digesterDieselConsumption +
      energyData.upgradingDieselConsumption;
    
    // Emission factors
    const EF_ELEC = electricityInfo.efElec; // g CO2e/kWh
    const EF_NG = 53.06; // g CO2e/MJ of NG
    const EF_DIESEL = 10180; // g CO2e/Gallon
    
    // Calculate emissions per MJ of biomethane produced
    const electricityEmissions = totalElectricity > 0 
      ? (totalElectricity * EF_ELEC) / biomethaneEnergyMJ 
      : 0;
    
    const naturalGasEmissions = totalNaturalGas > 0 
      ? (totalNaturalGas * MMBTUTOMJ * EF_NG) / biomethaneEnergyMJ 
      : 0;
    
    const dieselEmissions = totalDiesel > 0 
      ? (totalDiesel * EF_DIESEL) / biomethaneEnergyMJ 
      : 0;
    
    // Calculate fugitive methane emissions from tail gas
    const tailGasMethane = energyData.biomethaneTailGasFlow * 
      (energyData.tailGasMethaneContent / 100) * 
      SCHTODENSITY; // Convert to kg
    
    const fugitiveEmissions = tailGasMethane > 0 
      ? (tailGasMethane * METHANE_GWP * 1000) / biomethaneEnergyMJ 
      : 0;
    
    return {
      electricityEmissions,
      naturalGasEmissions,
      dieselEmissions,
      fugitiveEmissions
    };
  };
  
  // Calculate Transport & Tailpipe Emissions
  export const calculateTransportAndTailpipeEmissions = (
    fuelProduced: FuelProduced
  ): {
    transportEmissions: number;
    tailpipeEmissions: number;
  } => {
    // Fixed tailpipe emission factor for RNG combustion
    const tailpipeEmissions = 60; // g CO2e/MJ (approximate)
    
    // Calculate transport emissions based on distance
    const transportEmissionFactor = 0.3; // g CO2e/MJ per mile (approximate)
    const transportEmissions = fuelProduced.distanceToCNG * transportEmissionFactor;
    
    // Add additional emissions for LNG conversion if applicable
    const lngConversionFactor = 5; // g CO2e/MJ (approximate)
    const lngEmissions = (fuelProduced.percentCNGtoLNG / 100) * lngConversionFactor;
    
    return {
      transportEmissions: transportEmissions + lngEmissions,
      tailpipeEmissions
    };
  };
  
  // Calculate Total Carbon Intensity
  export const calculateTotalCarbonIntensity = (
    facilityInfo: FacilityInfo,
    electricityInfo: ElectricityInfo,
    livestockData: LivestockData,
    biogasData: BiogasData,
    energyData: EnergyData,
    fuelProduced: FuelProduced
  ): CalculationResults => {
    // Calculate baseline methane emissions
    const baselineMethaneEmissions = calculateBaselineMethaneEmissions(livestockData);
    
    // Calculate project methane emissions
    const projectMethaneEmissions = calculateProjectMethaneEmissions(
      livestockData,
      biogasData,
      facilityInfo
    );
    
    // Calculate net methane avoided
    const netMethaneAvoided = baselineMethaneEmissions - projectMethaneEmissions;
    
    // Calculate avoided methane credit
    const avoidedMethaneCredit = calculateAvoidedMethaneCredit(
      baselineMethaneEmissions,
      projectMethaneEmissions,
      fuelProduced
    );
    
    // Calculate energy-related emissions
    const {
      electricityEmissions,
      naturalGasEmissions,
      dieselEmissions,
      fugitiveEmissions
    } = calculateEnergyEmissions(energyData, electricityInfo, fuelProduced);
    
    // Calculate transport & tailpipe emissions
    const {
      transportEmissions,
      tailpipeEmissions
    } = calculateTransportAndTailpipeEmissions(fuelProduced);
    
    // Calculate total carbon intensity
    const totalPositiveEmissions = 
      electricityEmissions +
      naturalGasEmissions +
      dieselEmissions +
      fugitiveEmissions +
      tailpipeEmissions +
      transportEmissions;
    
    // Apply credits
    const totalCredits = avoidedMethaneCredit;
    
    // Calculate net CI
    const totalCarbonIntensity = totalPositiveEmissions - totalCredits;
    
    return {
      baselineMethaneEmissions,
      projectMethaneEmissions,
      netMethaneAvoided,
      avoidedMethaneCredit,
      electricityEmissions,
      naturalGasEmissions,
      dieselEmissions,
      fugitiveEmissions,
      tailpipeEmissions,
      transportEmissions,
      totalCarbonIntensity
    };
  };