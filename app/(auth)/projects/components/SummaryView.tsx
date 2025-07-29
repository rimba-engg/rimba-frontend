import React, { useEffect } from "react";
import DateRangePicker from "@cloudscape-design/components/date-range-picker";
import { api } from "@/lib/api";
import QueryTable from "@/components/table/QueryTable";


export default function SummaryView() {
  const [value, setValue] = React.useState(undefined);
  const [dateRange, setDateRange] = React.useState({
    // Set default date range to last day
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [projectTableData, setProjectTableData] = React.useState<any[]>([]);
  const [projectTableCols, setProjectTableCols] = React.useState<any[]>([]);
  const [selectedSite, setSelectedSite] = React.useState<string>('');

  // Remove the useEffect for default dates as it's handled by DateTimeSelector now
  useEffect(() => {
    // Initialize selected site from localStorage
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (selected_site && selected_site.name) {
      setSelectedSite(selected_site.name);
    }
  }, []);

  const updateDateRange = (value: any) => {
    // update date range  
    if (!value) return;
    
    console.log('updating date range for value', value);
    let newDateRange = null;
    if (value.type === 'relative') {
      newDateRange = {
        startDate: new Date(new Date().setDate(new Date().getDate() - value.amount)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      };
    } else if (value.type === 'absolute') {
      newDateRange = {
        startDate: value.startDate,
        endDate: value.endDate,
      };
    } else {
      console.error('Invalid date range type');
    }

    console.log('new date range', newDateRange);
    if (newDateRange) {
      setDateRange(newDateRange);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      fetchProjectStats(selectedSite, dateRange);
    }
  }, [selectedSite, dateRange]);

  const fetchProjectStats = async (selectedSite: string, dateRange: any) => {
    if (!selectedSite || !dateRange.startDate || !dateRange.endDate) return;
    console.log('fetching project stats for', selectedSite, dateRange);
    try {
      const payload = {
        sites: [selectedSite],
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      };
      const resp = await api.post<{ data: Record<string, any> }>('/reporting/v2/project-stats/', payload);
      // Flatten to table rows
      const rows: any[] = [];
      Object.entries(resp.data).forEach(([site, dates]) => {
        Object.entries(dates as Record<string, any>).forEach(([date, stats]) => {
          rows.push({ site, date, ...stats });
        });
      });
      setProjectTableData(rows);
      setProjectTableCols([
        { field: 'site', headerName: 'Site', type: 'string' },
        { field: 'date', headerName: 'Date', type: 'string' },
        { field: 'injected_pipeline', headerName: 'Injected Pipeline', type: 'number' },
        { field: 'balance_percentage', headerName: 'Balance %', type: 'number' },
        { field: 'inlet_sum', headerName: 'Inlet Sum', type: 'number' },
        { field: 'flare_sum', headerName: 'Flare Sum', type: 'number' },
        { field: 'tox_sum', headerName: 'Tox Sum', type: 'number' },
      ]);
    } catch (err) {
      console.error('Error fetching project stats:', err);
    }
  };

  return (
    <div>
      <DateRangePicker
      onChange={({ detail }) => {
        setValue(detail.value);
        updateDateRange(detail.value);
      }}
      value={value}
      relativeOptions={[
        {
          key: "previous-1-day",
          amount: 1,
          unit: "day",
          type: "relative"
        },
        {
          key: "previous-7-days",
          amount: 7,
          unit: "day",
          type: "relative"
        },
        {
          key: "previous-4-weeks",
          amount: 28,
          unit: "day",
          type: "relative"
        },
      ]}
      isValidRange={range => {
        if (range.type === "absolute") {
          const [
            startDateWithoutTime
          ] = range.startDate.split("T");
          const [
            endDateWithoutTime
          ] = range.endDate.split("T");
          if (
            !startDateWithoutTime ||
            !endDateWithoutTime
          ) {
            return {
              valid: false,
              errorMessage:
                "The selected date range is incomplete. Select a start and end date for the date range."
            };
          }
          if (
            new Date(range.startDate) -
              new Date(range.endDate) >
            0
          ) {
            return {
              valid: false,
              errorMessage:
                "The selected date range is invalid. The start date must be before the end date."
            };
          }
        }
        return { valid: true };
      }}
        dateOnly
        placeholder="Filter by date"
        i18nStrings={{
          todayAriaLabel: "Today",
          cancelButtonLabel: "Cancel",
          applyButtonLabel: "Apply",
          relativeModeTitle: "Relative",
          absoluteModeTitle: "Absolute",
          customRelativeRangeOptionLabel: "Custom range",
          formatRelativeRange: (value: any) => {
            const { amount, unit } = value;
            return `Last ${amount} ${unit}${amount > 1 ? "s" : ""} ago`;
          }
        }}
      />

      <QueryTable
        initialRowData={projectTableData}
        initialColumnDefs={projectTableCols}
        autoSizeStrategy={{ type: "fitCellContents" }}
      />
    </div>
  );
}