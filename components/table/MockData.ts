const MockResponse = {
    newColumns: [
      {
        headerName: "Flag",
        field: "flag",
        formula: "return (Math.abs(row.received - row.supplied) / row.received > 0.55) ? 'Flagged' : 'OK';"
      },
      {
        headerName: "Difference",
        field: "difference",
        formula: "return (Math.abs(row.received - row.supplied) / row.received) * 100;"
      }
    ],
    viewConfig: {
      sorting: [
        { field: "id", order: "asc" }
      ],
      filtering: [
        { field: "flag", criteria: "Flagged" }
      ]
    }
  }