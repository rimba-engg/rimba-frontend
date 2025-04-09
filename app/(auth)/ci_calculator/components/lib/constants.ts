import { CalculatorState, ElectricityInfo, FacilityInfo, LivestockData, BiogasData, EnergyData, FuelProduced, CalculationResults } from "../../page";
import { MONTHS } from "@/lib/constants";

export const electricityMixOptions = [
    { label: "CAMX - California", value: "CAMX", emissionFactor: 241.2 },
    { label: "NWPP - Northwest", value: "NWPP", emissionFactor: 340.5 },
    { label: "RMPA - Rocky Mountains", value: "RMPA", emissionFactor: 520.8 },
    { label: "AZNM - Southwest", value: "AZNM", emissionFactor: 480.5 },
    { label: "MROW - Midwest", value: "MROW", emissionFactor: 568.8 },
    { label: "SRMV - South Central", value: "SRMV", emissionFactor: 410.6 },
    { label: "RFCE - RFC East", value: "RFCE", emissionFactor: 338.2 },
    { label: "RFCM - RFC Michigan", value: "RFCM", emissionFactor: 592.7 },
    { label: "RFCW - RFC West", value: "RFCW", emissionFactor: 537.3 },
    { label: "SRSO - Southeast", value: "SRSO", emissionFactor: 492.0 },
    { label: "NEWE - New England", value: "NEWE", emissionFactor: 253.5 },
    { label: "NYUP - Upstate NY", value: "NYUP", emissionFactor: 158.1 },
    { label: "NYCW - NYC/Westchester", value: "NYCW", emissionFactor: 267.9 },
    { label: "FRCC - Florida", value: "FRCC", emissionFactor: 445.9 }
  ];

  export const defaultCalculatorState: CalculatorState = {
    facilityInfo: {
      companyName: "",
      facilityName: "",
      reportingMonth: MONTHS[0],
      digesterType: "Enclosed Vessel",
      digesterLocation: "",
      avgAnnualTemperature: 15,
    },
    electricityInfo: {
      electricityMix: "CAMX",
      efElec: 241.2,
    },
    livestockData: {
      livestockType: "Dairy",
      numberOfAnimals: 0,
      baselineManureSystem: "Open Lagoon",
      retentionTimeNotes: "",
      populationCalendarDays: [],
      reportingDays: 30,
      avgStorageTemperature: 20,
      fractionVS: 0.8,
      carryoverFromPreviousMonth: 0,
    },
    biogasData: {
      rawBiogasFlow: 0,
      rawBiogasMethaneContent: 60,
      flaredBiogasFlow: 0,
      flaredBiogasMethaneContent: 60,
      biogasToUpgrading: 0,
      upgradingFeedstockMethane: 60,
    },
    energyData: {
      baselineDieselConsumption: 0,
      baselineNaturalGasConsumption: 0,
      baselineElectricityConsumption: 0,
      digesterBiogasConsumption: 0,
      digesterNaturalGasConsumption: 0,
      digesterElectricityConsumption: 0,
      digesterDieselConsumption: 0,
      upgradingNaturalGasConsumption: 0,
      upgradingBiogasConsumption: 0,
      upgradingElectricityConsumption: 0,
      upgradingDieselConsumption: 0,
      biomethaneTailGasFlow: 0,
      tailGasMethaneContent: 1.5,
    },
    fuelProduced: {
      biomethaneInjected: 0,
      electricityProducedOnsite: 0,
      distanceToCNG: 50,
      percentCNGtoLNG: 0,
    },
    results: null,
    currentStep: 1
  };
  
  export const sampleData: CalculatorState = {
    facilityInfo: {
      companyName: "Green Energy Solutions",
      facilityName: "Midwest Biogas Facility",
      reportingMonth: "June",
      digesterType: "Enclosed Vessel",
      digesterLocation: "Iowa, USA",
      avgAnnualTemperature: 15,
    },
    electricityInfo: {
      electricityMix: "CAMX",
      efElec: 241.2,
    },
    livestockData: {
      livestockType: "Dairy",
      numberOfAnimals: 2500,
      baselineManureSystem: "Open Lagoon",
      retentionTimeNotes: "30-day retention time in lagoon",
      populationCalendarDays: [
        { population: 2500, days: 30 }
      ],
      reportingDays: 30,
      avgStorageTemperature: 22,
      fractionVS: 0.85,
      carryoverFromPreviousMonth: 0,
    },
    biogasData: {
      rawBiogasFlow: 2500000,
      rawBiogasMethaneContent: 62,
      flaredBiogasFlow: 50000,
      flaredBiogasMethaneContent: 62,
      biogasToUpgrading: 2450000,
      upgradingFeedstockMethane: 62,
    },
    energyData: {
      baselineDieselConsumption: 500,
      baselineNaturalGasConsumption: 0,
      baselineElectricityConsumption: 5000,
      digesterBiogasConsumption: 100000,
      digesterNaturalGasConsumption: 0,
      digesterElectricityConsumption: 25000,
      digesterDieselConsumption: 200,
      upgradingNaturalGasConsumption: 0,
      upgradingBiogasConsumption: 50000,
      upgradingElectricityConsumption: 15000,
      upgradingDieselConsumption: 100,
      biomethaneTailGasFlow: 75000,
      tailGasMethaneContent: 1.5,
    },
    fuelProduced: {
      biomethaneInjected: 2300,
      electricityProducedOnsite: 7500,
      distanceToCNG: 50,
      percentCNGtoLNG: 15,
    },
    results: null,
    currentStep: 1
  };
  

  export const calculateTotalCarbonIntensity = (
    facilityInfo: FacilityInfo,
    electricityInfo: ElectricityInfo,
    livestockData: LivestockData,
    biogasData: BiogasData,
    energyData: EnergyData,
    fuelProduced: FuelProduced
  ): CalculationResults => {
    // Constants
    const METHANE_GWP = 25; // Global Warming Potential of methane (CO2e)
    const MJ_PER_MMBTU = 1055.06; // Conversion factor: 1 MMBtu = 1055.06 MJ
    const METHANE_DENSITY = 0.0191; // kg/scf at standard conditions
    const EF_DIESEL = 10.21; // kg CO2e/gallon
    const EF_NG = 53.11; // kg CO2e/MMBtu
    const FUGITIVE_LOSS_RATE = 0.015; // 1.5% fugitive methane loss rate
  
    // Calculate total biomethane energy in MJ
    const totalEnergyMJ = fuelProduced.biomethaneInjected * MJ_PER_MMBTU;
  
    // 1. Calculate Baseline Methane Emissions
    let mcfValue = 0;
    switch (livestockData.baselineManureSystem) {
      case "Open Lagoon":
        mcfValue = 0.75;
        break;
      case "Storage Pit/Basin":
        mcfValue = 0.35;
        break;
      case "Daily Spread/Dry Lot":
        mcfValue = 0.1;
        break;
      default:
        mcfValue = 0.5;
    }
  
    let vsExcretionRate = 0;
    let boValue = 0;
    
    if (livestockData.livestockType === "Dairy") {
      vsExcretionRate = 8.4; // kg VS/animal/day for dairy cows
      boValue = 0.24; // m³ CH4/kg VS
    } else if (livestockData.livestockType === "Swine") {
      vsExcretionRate = 0.5; // kg VS/animal/day for swine
      boValue = 0.48; // m³ CH4/kg VS
    }
  
    // Calculate baseline methane emissions (kg)
    const baselineMethaneEmissions = 
      livestockData.numberOfAnimals * 
      vsExcretionRate * 
      livestockData.reportingDays * 
      livestockData.fractionVS * 
      boValue * 
      mcfValue * 
      0.67; // Convert m³ to kg
  
    // 2. Calculate Project Methane Emissions
    // Digester collection efficiency based on digester type
    const collectionEfficiency = 
      facilityInfo.digesterType === "Enclosed Vessel" ? 0.98 : 0.95;
  
    // Calculate methane in tail gas (kg)
    const tailGasMethane = 
      energyData.biomethaneTailGasFlow * 
      (energyData.tailGasMethaneContent / 100) * 
      METHANE_DENSITY;
  
    // Calculate uncaptured methane (kg)
    const uncapturedMethane = baselineMethaneEmissions * (1 - collectionEfficiency);
  
    // Calculate project methane emissions (kg)
    const projectMethaneEmissions = uncapturedMethane + tailGasMethane;
  
    // 3. Calculate Net Methane Avoided (kg)
    const netMethaneAvoided = baselineMethaneEmissions - projectMethaneEmissions;
  
    // 4. Calculate Avoided Methane Credit (g CO2e/MJ)
    const avoidedMethaneCredit = (netMethaneAvoided * METHANE_GWP * 1000) / totalEnergyMJ;
  
    // 5. Calculate Energy-Related Emissions
  
    // Electricity emissions (g CO2e/MJ)
    const electricityEmissions = 
      ((energyData.digesterElectricityConsumption + 
       energyData.upgradingElectricityConsumption - 
       energyData.baselineElectricityConsumption - 
       fuelProduced.electricityProducedOnsite) * 
       electricityInfo.efElec) / totalEnergyMJ;
  
    // Natural gas emissions (g CO2e/MJ)
    const naturalGasEmissions = 
      ((energyData.digesterNaturalGasConsumption + 
        energyData.upgradingNaturalGasConsumption - 
        energyData.baselineNaturalGasConsumption) * 
       EF_NG * 1000) / totalEnergyMJ;
  
    // Diesel emissions (g CO2e/MJ)
    const dieselEmissions = 
      ((energyData.digesterDieselConsumption + 
        energyData.upgradingDieselConsumption - 
        energyData.baselineDieselConsumption) * 
       EF_DIESEL * 1000) / totalEnergyMJ;
  
    // Calculate total methane produced (kg)
    const totalMethaneProduced = 
      biogasData.biogasToUpgrading * 
      (biogasData.upgradingFeedstockMethane / 100) * 
      METHANE_DENSITY;
  
    // Fugitive emissions (g CO2e/MJ)
    const fugitiveEmissions = 
      (totalMethaneProduced * FUGITIVE_LOSS_RATE * METHANE_GWP * 1000) / totalEnergyMJ;
  
    // 6. Calculate Transport and Tailpipe Emissions
  
    // Transport emissions (g CO2e/MJ) - Simple model based on distance
    const transportEmissions = (fuelProduced.distanceToCNG * 0.1) / totalEnergyMJ;
  
    // Additional emissions if converting to LNG
    const lngConversionEmissions = 
      (fuelProduced.percentCNGtoLNG / 100) * 10; // 10 g CO2e/MJ for LNG conversion
  
    // Tailpipe emissions (g CO2e/MJ)
    const tailpipeEmissions = 1.0 + lngConversionEmissions; // Base tailpipe emissions + LNG if applicable
  
    // 7. Calculate Total Carbon Intensity (g CO2e/MJ)
    const totalCarbonIntensity = 
      electricityEmissions + 
      naturalGasEmissions + 
      dieselEmissions + 
      fugitiveEmissions + 
      transportEmissions + 
      tailpipeEmissions - 
      avoidedMethaneCredit;
  
    return {
      baselineMethaneEmissions,
      projectMethaneEmissions,
      netMethaneAvoided,
      avoidedMethaneCredit,
      electricityEmissions,
      naturalGasEmissions,
      dieselEmissions,
      fugitiveEmissions,
      transportEmissions,
      tailpipeEmissions,
      totalCarbonIntensity,
    };
  };
  