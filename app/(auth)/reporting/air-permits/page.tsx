'use client'

import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { Download, Loader2 } from 'lucide-react'
import { api, BASE_URL, defaultHeaders } from '@/lib/api' 
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import QueryTable from '@/components/table/QueryTable';
import { ColumnWithType } from '@/components/table/QueryTable';
import { DateTime } from 'luxon';

const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
};

function numberFormatter(params: any) {
  if (params.value == null) {
      return '';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: params.colDef.field.includes('%') ? 1 : 0,
    maximumFractionDigits: params.colDef.field.includes('%') ? 1 : 0
  }).format(params.value);
}

interface AirPermitsResponse {
  summary_data: any[];
  aggregated_data: any[];
}

export default function AirPermitsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [rowData, setRowData] = useState<any[]>([])
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>([])
  const [viewAggregate, setViewAggregate] = useState<any[]>([])
  const [useAverage, setUseAverage] = useState<boolean>(true)

  // Fetch data when view or dates change
  useEffect(() => {
    fetchAirPermitsData();
  }, [startDate, endDate]);

  // set column defs based on rowData
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      setColumnDefs(
        Object.keys(rowData[0]).map((key) => ({
          field: key,
          headerName: key,
          sortable: true,
          valueFormatter: key === 'Day' ? undefined : numberFormatter,
          type: 'string',
        }))
      );
    }
  }, [rowData]);

  const fetchAirPermitsData = async () => {
    try {
      setLoading(true);

      const payload: Record<string, any> = {};
      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_datetime = startDate;
      }
      if (endDate) {
        payload.end_datetime = endDate;
      }

      const response = await api.post<AirPermitsResponse>(`/reporting/v2/air-permits/`, payload);
      setRowData(response.summary_data);
      setViewAggregate(response.aggregated_data);
    } catch (error) {
      console.error('Error fetching air permits data:', error); 
      toast.error('Failed to fetch air permits data. Please try again.')
    } finally {
      setLoading(false);
    }
  }
  
  const downloadReport = async () => {
    try {
      setLoading(true);

      const payload: Record<string, any> = {
        use_average: useAverage
      };

      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_datetime = startDate;
      }
      if (endDate) {
        payload.end_datetime = endDate;
      }

      const response = await fetch(`${BASE_URL}/reporting/v2/air-permits/download/`, {
        method: 'POST',
        headers: {...defaultHeaders},
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Export failed');

      // Create download link and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Air-Permits-Report-${useAverage ? 'Average' : 'Sum'}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download report. Please try again.')
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <Loader2 className="animate-spin" size={24} />
          <div className="text-lg font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto gap-4">
      <div className="text-2xl font-bold">Air Permits</div>
      <div className="flex flex-row my-3 items-center space-x-4 w-1/4">
        <FloatingLabelInput
          label="Start Date (EST)"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full"
          max={endDate}
        />

        <FloatingLabelInput
          label="End Date (EST)"
          type="datetime-local"
          min={startDate}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full"
        />

        <div className="flex justify-center">
          <span>OR</span>
        </div>

        <FloatingLabelInput
          label="Gas Day (EST)"
          type="date" 
          className="w-full"
          onChange={(e) => {
            // Set to 10 AM EST on selected date in EST
            let selectedDate = DateTime.fromISO(e.target.value + 'T00:00:00', { zone: 'America/New_York' }).set({ hour: 10 });

            // Set to 10 AM EST next day
            let nextDay = selectedDate.plus({ days: 1 }).minus({ seconds: 1 });

            // for debugging
            console.log(e.target.value);
            console.log(selectedDate.toISO());
            console.log(nextDay.toISO());

            // set start and end dates
            setStartDate(selectedDate.toISO()?.slice(0, 16) ?? '');
            setEndDate(nextDay.toISO()?.slice(0, 16) ?? '');
          }}
        />

        <div className="flex justify-center">
          <span>OR</span>
        </div>

        <div>
          <select 
            className="px-4 py-2 border rounded"
            onChange={(e) => {
              const [unit, amount] = e.target.value.split('-');
              const now = DateTime.now().setZone('America/New_York');
              let start;
              let end = now;

              switch(unit) {
                case 'day':
                  start = now.minus({ days: parseInt(amount) });
                  break;
                case 'week':
                  start = now.minus({ weeks: parseInt(amount) });
                  break;
                case 'month':
                  start = now.minus({ months: parseInt(amount) });
                  break;
              }

              setStartDate(start?.toISO()?.slice(0, 16) ?? '');
              setEndDate(end?.toISO()?.slice(0, 16) ?? '');
            }}
          >
            <option value="">Select Date Range</option>
            <optgroup label="Days">
              {[1,2,3,4,5,6].map(n => (
                <option key={`day-${n}`} value={`day-${n}`}>Last {n} day{n > 1 ? 's' : ''}</option>
              ))}
            </optgroup>
            <optgroup label="Weeks">
              {[1,2,3,4].map(n => (
                <option key={`week-${n}`} value={`week-${n}`}>Last {n} week{n > 1 ? 's' : ''}</option>
              ))}
            </optgroup>
            <optgroup label="Months">
              {[1,2,3].map(n => (
                <option key={`month-${n}`} value={`month-${n}`}>Last {n} month{n > 1 ? 's' : ''}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="px-4 py-2 flex items-center gap-2">
          <button
            onClick={downloadReport}
            className="text-primary-foreground bg-primary px-4 py-2 rounded"
          >
            <div className="flex flex-row items-center gap-2">
              <Download size={20} />
              <span>Download</span>
            </div>
          </button>
          <h3 className="font-semibold text-base">{useAverage ? 'Average' : 'Sum'}</h3>
          <button 
            onClick={() => setUseAverage(!useAverage)} 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAverage ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAverage ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        
      </div>

      <div className="ag-theme-alpine w-full h-[800px]">
        <QueryTable
          initialRowData={rowData}
          initialColumnDefs={columnDefs}
          pinnedTopRowData={[viewAggregate]}
          getRowStyle={getRowStyle} // Apply row styles
        />
      </div>
      <ToastContainer />
    </div>
  )
}
