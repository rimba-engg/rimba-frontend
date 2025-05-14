export interface Contractor {
    id: string;
    name: string;
    wageClassification: string;
    constructionType: string;
    baseRate: number;
    fringeRate: number;
    iraRequestDate: string;
    wdApprovalDate: string;
    isNewRate: boolean;
    expirationDate: string;
    daysValid: number;
  }
  
  export interface Project {
    id: string;
    name: string;
    state: string;
    county: string;
    contractors: Contractor[];
  }
  
  export interface QuarterlySummaryItem {
    contractor: string;
    projectSite: string;
    quarter: string;
    description: string;
    actionTaken: string;
    payDate: string;
    lastActionDate: string;
  }
  
  export interface LaborHourLogEntry {
    week: string;
    contractor: string;
    trade: string;
    journeymanHours: number;
    apprenticeHours: number;
    journeyworkerCount: number;
    apprenticeCount: number;
    totalHours: number;
    apprenticePercentage: number;
    meetsRatio: boolean;
    hoursShort: number;
    penaltyRate: number;
    penaltyAmount: number;
  }
  
  export interface ApprenticeDocument {
    id: string;
    contractorId: string;
    documentType: 'certification' | 'program';
    fileName: string;
    uploadDate: string;
    status: 'pending' | 'approved' | 'rejected';
  }
  
  export interface PayrollDocument {
    id: string;
    contractorId: string;
    projectId: string;
    documentType: 'payroll' | 'proof';
    fileName: string;
    uploadDate: string;
    payrollPeriod: string;
  }
  
  export interface WageEntry {
    id: string;
    contractorId: string;
    projectId: string;
    employeeName: string;
    classification: string;
    hoursWorked: number;
    rate: number;
    grossWages: number;
    requiredRate: number;
    compliant: boolean;
    underpaymentAmount?: number;
    week: string;
    workerStatus: 'Journey Worker' | 'Registered Apprentice';
    weekEndingDate: string;
  }
  