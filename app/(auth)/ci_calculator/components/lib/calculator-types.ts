
// Types for the Biomethane CI Calculator

// Applicant & Facility Information
export interface FacilityInfo {
  companyName: string;
  facilityName: string;
  reportingMonth: string;
  digesterType: "Covered Lagoon" | "Enclosed Vessel";
  digesterLocation: string;
  avgAnnualTemperature: number;
}

// Electricity Mix Selection
export interface ElectricityInfo {
  electricityMix: string;
  efElec: number; // Emission factor in g CO2e/kWh
}

// Livestock & Feedstock Data
export interface LivestockData {
  livestockType: "Dairy" | "Swine";
  numberOfAnimals: number;
  baselineManureSystem: "Open Lagoon" | "Storage Pit/Basin" | "Daily Spread/Dry Lot";
  retentionTimeNotes: string;
  populationCalendarDays: { population: number; days: number }[];
  reportingDays: number;
  avgStorageTemperature: number;
  fractionVS: number;
  carryoverFromPreviousMonth: number;
}

// Biogas & Upgrading Inputs
export interface BiogasData {
  rawBiogasFlow: number; // scf/month
  rawBiogasMethaneContent: number; // %
  flaredBiogasFlow: number; // scf/month
  flaredBiogasMethaneContent: number; // %
  biogasToUpgrading: number; // scf/month
  upgradingFeedstockMethane: number; // %
}

// Energy & Fuel Inputs
export interface EnergyData {
  // Baseline Energy Use
  baselineDieselConsumption: number; // Gallons
  baselineNaturalGasConsumption: number; // MMBtu
  baselineElectricityConsumption: number; // kWh
  
  // Digester Energy Use
  digesterBiogasConsumption: number; // scf
  digesterNaturalGasConsumption: number; // MMBtu
  digesterElectricityConsumption: number; // kWh
  digesterDieselConsumption: number; // Gallons
  
  // Upgrading & Compression Energy
  upgradingNaturalGasConsumption: number; // MMBtu
  upgradingBiogasConsumption: number; // scf
  upgradingElectricityConsumption: number; // kWh
  upgradingDieselConsumption: number; // Gallons
  
  // Biomethane Transport & Tail Gas
  biomethaneTailGasFlow: number; // scf
  tailGasMethaneContent: number; // %
}

// Final Fuel Produced
export interface FuelProduced {
  biomethaneInjected: number; // MMBtu
  electricityProducedOnsite: number; // kWh
  distanceToCNG: number; // miles
  percentCNGtoLNG: number; // %
}

// Calculation Results
export interface CalculationResults {
  baselineMethaneEmissions: number; // kg CH4
  projectMethaneEmissions: number; // kg CH4
  netMethaneAvoided: number; // kg CH4
  avoidedMethaneCredit: number; // g CO2e/MJ
  electricityEmissions: number; // g CO2e/MJ
  naturalGasEmissions: number; // g CO2e/MJ
  dieselEmissions: number; // g CO2e/MJ
  fugitiveEmissions: number; // g CO2e/MJ
  tailpipeEmissions: number; // g CO2e/MJ
  transportEmissions: number; // g CO2e/MJ
  totalCarbonIntensity: number; // g CO2e/MJ
}

// Complete Calculator Input State
export interface CalculatorState {
  facilityInfo: FacilityInfo;
  electricityInfo: ElectricityInfo;
  livestockData: LivestockData;
  biogasData: BiogasData;
  energyData: EnergyData;
  fuelProduced: FuelProduced;
  results: CalculationResults | null;
  currentStep: number;
}

// Default/Initial Values
export const defaultCalculatorState: CalculatorState = {
  facilityInfo: {
    companyName: "",
    facilityName: "",
    reportingMonth: "",
    digesterType: "Enclosed Vessel",
    digesterLocation: "",
    avgAnnualTemperature: 15,
  },
  electricityInfo: {
    electricityMix: "U.S. Avg",
    efElec: 431.2, // Default U.S. average g CO2e/kWh
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
    tailGasMethaneContent: 2,
  },
  fuelProduced: {
    biomethaneInjected: 0,
    electricityProducedOnsite: 0,
    distanceToCNG: 0,
    percentCNGtoLNG: 0,
  },
  results: null,
  currentStep: 1
};

export const electricityMixOptions = [
  { label: "California (CAMX)", value: "CAMX", emissionFactor: 241.2 },
  { label: "Northwest (NWPP)", value: "NWPP", emissionFactor: 363.8 },
  { label: "Midcontinent (RFCM)", value: "RFCM", emissionFactor: 552.5 },
  { label: "Brazil", value: "Brazil", emissionFactor: 78.6 },
  { label: "U.S. Average", value: "U.S. Avg", emissionFactor: 431.2 },
];

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];