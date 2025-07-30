import { useEffect, useState } from "react";
import DateRangePicker from "@cloudscape-design/components/date-range-picker";
import { api } from "@/lib/api";
import QueryTable, { ColumnWithType } from "@/components/table/QueryTable";
import Spinner from "@cloudscape-design/components/spinner";
import Box from "@cloudscape-design/components/box";
import Alert from "@cloudscape-design/components/alert";
import { TimezoneSelect } from "@/components/ui/timezone-select";

interface ProjectStatsResponse {
  headers: string[];
  rows: string[][];
}

const rangeValidator = (range: any) => {
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
    if (new Date(range.startDate).getTime() > new Date(range.endDate).getTime()) {
      return {
        valid: false,
        errorMessage:
          "The selected date range is invalid. The start date must be before the end date."
      };
    }
  }
  return { valid: true };
};

const relativeOptions = [
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
];


export default function SummaryView() {
  const [loading, setLoading] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [value, setValue] = useState<any>(undefined);
  const [dateRange, setDateRange] = useState({
    // Set default date range to last day
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>([])
  const [rowData, setRowData] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState<string>('');

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
      fetchProjectStats(dateRange);
    }
  }, [dateRange]);

  const fetchProjectStats = async (dateRange: any) => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    console.log('fetching project stats for', dateRange);
    setLoading(true);
    try {
      const payload = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        timezone: timezone,
      };
      const resp = await api.post<ProjectStatsResponse>('/reporting/v2/project-stats/', payload);
      // Flatten to table rows
      setRowData(resp.rows);
      setColumnDefs(resp.headers.map((header) => ({ field: header, headerName: header, type: 'string' })));
    } catch (err) {
      console.error('Error fetching project stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-row gap-2">
        <DateRangePicker
          dateOnly
          placeholder="Filter by date"
          locale="en-US"
          onChange={({ detail }) => {
            setValue(detail.value);
            updateDateRange(detail.value);
          }}
          value={value ?? undefined}
          isValidRange={rangeValidator as any}
          relativeOptions={relativeOptions as any}
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
        <TimezoneSelect
          value={timezone}
          onValueChange={setTimezone}
          className="w-48"
        />
      </div>
      

      {loading && (<Box textAlign="center" className="flex flex-col items-center justify-center"><Spinner size="large" /> Digging gas molecules for you...</Box>)}
      {!loading && columnDefs.length === 0 && <Alert statusIconAriaLabel="Info" header="No data yet" >Try selecting a date range.</Alert>}

      {!loading && columnDefs.length > 0 && (
        <QueryTable
          initialRowData={rowData}
          initialColumnDefs={columnDefs}
        />
      )}
    </div>
  );
}