import { ColumnWithType as BaseColumnWithType } from '@/components/table/QueryTable';
import { CellStyle } from 'ag-grid-community';

export interface ExtendedColumnWithType extends BaseColumnWithType {
  children?: ExtendedColumnWithType[];
  cellStyle?: (params: any) => CellStyle;
  minWidth?: number;
  maxWidth?: number;
  suppressMovable?: boolean;
  headerClass?: string;
  groupId?: string;
}

export interface Metric {
  actual: number;
  budget: number;
  delta: number;
}

export interface DailyMetrics {
  'Inlet MMBtu': Metric;
  'Downtime MMBtu': Metric;
  'Tox MMBtu': Metric;
  'Injected MMBtu': Metric;
  'Downtime Minutes': Metric;
  'Metering Error'?: Metric;
}

export interface FactorsOfRevenueData {
  gasDay: string;
  '%Balance': number;
  metrics: DailyMetrics;
}

export interface FactorsOfRevenueResponse {
  message: string;
  data: FactorsOfRevenueData[];
  totals: FactorsOfRevenueData;
  status: 'success' | 'error';
} 