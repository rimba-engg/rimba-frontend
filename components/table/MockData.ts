import { ColumnWithType, APIResponse } from "./QueryTable";
export const MockResponse: APIResponse = {
    newColumns: [
      {
        headerName: "Flag",
        field: "flag",
        formula: "return (Math.abs(row.received - row.supplied) / row.received > 0.55) ? 'true' : 'false';"
      },
      {
        headerName: "Difference",
        field: "difference",
        formula: "return Math.abs(row.received - row.supplied) / row.received > 0.55 ;"
      }
    ],
    viewConfig: {
      sorting: [
        { field: "id", order: "asc" }
      ],
      filtering: [
        { field: "flag", criteria: "true" },
        { field: "difference", criteria: true }
      ]
    }
  }

export const generateRandomData = (numRows: number) => {
    const data = [];
    for (let i = 1; i <= numRows; i++) {
      const received = Math.floor(Math.random() * 1000) + 1;
      const supplied = Math.floor(Math.random() * received);
      const department = Math.random() < 0.5 ? "Sales" : "Marketing";
      const available = Math.random() < 0.5;
      data.push({ id: i, received, supplied, department, available });
    }
    return data;
  };


export const columns: ColumnWithType[] = [
    { headerName: "ID", field: "id", type: "number", sample: 1 },
    { headerName: "Received", field: "received", type: "number", sample: 500 },
    { headerName: "Supplied", field: "supplied", type: "number", sample: 300 },
    { headerName: "Department", field: "department", type: "string", sample: "Sales" },
    { headerName: "Available", field: "available", type: "boolean", sample: true },
  ];