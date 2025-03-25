'use client';

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
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';

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
      title: {
        display: true,
        text: 'Kurz to Sioux Center Balance',
      },
    },
  };

interface AnalyticsResponse {
    chart_config: any;
}

export default function AnalyticsPage() {
    const [chartConfig, setChartConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = () => {
        setLoading(true);
        api.post<AnalyticsResponse>('/reporting/v2/rng/analytics/', {})
            .then(data => setChartConfig(data.chart_config))
            .catch(error => {
                console.error('Error fetching analytics data:', error);
                toast.error('Error fetching analytics data');
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
        <div className="w-full h-[500px] p-4">
            <Line options={options} data={chartConfig} />
            <ToastContainer />
        </div>
    );
}
