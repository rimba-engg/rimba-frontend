export interface Allocation {
    contract_id: string;
    contract_number: string;
    for_month: string;
    allocated_amount: number;
    warehouse: string;
    warehouse_name: string;
    ghg: number;
    group_id: string;
    outgoing_sd: string; // "Not generated" or generated text
    outgoing_sd_url?: string;
  }
  
  export interface Warehouse {
    id: string;
    name: string;
  }
  
  export interface ContractDetails {
    contract_id: string;
    contract_number: string;
    for_month: string;
    for_year: string;
    buyer: string;
    quantity: number;
    product: string;
    bill_of_lading: string;
    doc_link: string;
    port_of_loading: string;
    port_of_discharge: string;
    is_allocated: string; // "true" or "false"
    is_ins: string; // "true" or "false"
    allocations?: Allocation[][]; // if allocated, nested group arrays
    warehouses?: Warehouse[];   // for allocation selection in non‑allocated contract
    MONTHS?: string[];
    YEARS?: string[];
  }
  