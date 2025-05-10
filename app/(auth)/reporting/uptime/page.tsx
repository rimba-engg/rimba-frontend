
'use client';

import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { api } from '@/lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DateTime } from 'luxon';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import QueryTable from '@/components/table/QueryTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

interface UptimeResponse {
    chart_config: any;
}

export default function SiteUptimePage() {
    const [chartConfig, setChartConfig] = useState<any>(null);
  
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState<string>(DateTime.now().setZone('America/New_York').minus({ weeks: 1 }).toISO()?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = useState<string>(DateTime.now().setZone('America/New_York').toISO()?.slice(0, 10) ?? '');

    const [relative, setRelative] = useState('Select time range...');

    
    useEffect(() => {
        fetchAnalytics();
    }, [startDate, endDate]);


    const fetchAnalytics = () => {
        setLoading(true);
       

      api.get<UptimeResponse>('/reporting/v2/rng/analytics/uptime/?start_date=' + startDate + '&end_date=' + endDate)
          .then(data => {
              setChartConfig(data.chart_config);
          })
          .catch(error => {
              console.error('Error fetching manure flow data:', error);
              toast.error('Error fetching manure flow data');
          })
          .finally(() => setLoading(false));


        
    };

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
      <div className='space-y-4'>
        <div className='text-2xl font-bold'>Site Uptime</div>

        <div className="flex flex-col gap-4">
          <div className="flex py-4  w-full gap-6">
            <div className="flex flex-row gap-4">
              <FloatingLabelInput
                label="Start Day (EST)"
                type="date" 
                className="w-full"
                max={endDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FloatingLabelInput
                label="End Day (EST)"
                type="date"
                className="w-full"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>OR</div>

            <div>
              <select 
                className="px-4 py-2 border rounded"
                onChange={(e) => {
                  const [unit, amount] = e.target.value.split('-');
                  setRelative(`Last ${amount} ${unit}`);
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

                  setStartDate(start?.toISO()?.slice(0, 10) ?? '');
                  setEndDate(end?.toISO()?.slice(0, 10) ?? '');
                }}
              >
                <option value="">{relative}</option>
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
          </div>

          <div className="w-full h-[60vh]">
            {loading ? (
              <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
                <Loader2 className="animate-spin" size={24} />
                <div className="text-lg font-medium">Loading Site Uptime data...</div>
              </div>
            ) : (
              <Line options={options} data={chartConfig} />
            )}
            <ToastContainer />
          </div>
        </div>
      </div>
    );
}

