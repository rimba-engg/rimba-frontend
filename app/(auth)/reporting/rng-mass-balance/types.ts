export interface GasBalanceColumn {
  name: string;
  aggregation: string;
  unit?: string;
}

export interface GasBalanceView {
  id: string;
  site: string;
  view_name: string;
  description?: string;
  columns: Array<GasBalanceColumn>;
}