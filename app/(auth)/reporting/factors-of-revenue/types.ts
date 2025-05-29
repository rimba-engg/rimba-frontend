import { ColumnWithType as BaseColumnWithType } from '@/components/table/QueryTable';
import { CellStyle } from 'ag-grid-community';

export interface ExtendedColumnWithType extends BaseColumnWithType {
  children?: ExtendedColumnWithType[];
  cellStyle?: (params: any) => CellStyle;
  minWidth?: number;
  maxWidth?: number;
  suppressMovable?: boolean;
  headerClass?: string;
}

export interface Metric {
  actual: number;
  budget: number;
  delta: number;
}

export interface DailyMetrics {
  'Inlet MMBtu': Metric;
  'Downtime MMBtu': Metric;
  'Methane Slip MMBtu': Metric;
  'Metering Error'?: Metric;
  'Injected MMBtu': Metric;
  'Downtime Minutes': {
    actual: number;
    budget: number;
  };
}

export interface FactorsOfRevenueData {
  gasDay: string;
  '%Balance': number;
  metrics: DailyMetrics;
}

export interface FactorsOfRevenueResponse {
  message: string;
  data: FactorsOfRevenueData[] | null;
  status: 'success' | 'error';
} 