import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
// import "./styles.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
interface ChartDataPoint {
    label: string;
    value: number;
    category?: string;
  }
  
  interface ChartProps {
    // chart: {
      chart_type: string;
      title: string;
      description: string;
      data: ChartDataPoint[];
      x_axis_label?: string;
      y_axis_label?: string;
      data_source: string;
      insights: string[];
    // } | string; // Fallback for old string format
  }
// ... existing code ...

const ChartComponent = (props: ChartProps) => {
  console.log(props);

  // const { chart } = props;
  const { chart_type, title, description, data, x_axis_label, y_axis_label, data_source, insights } = props;

  const renderChart = () => {
    switch (chart_type) {
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left border-b">{x_axis_label || 'Label'}</th>
                  <th className="px-4 py-2 text-left border-b">{y_axis_label || 'Value'}</th>
                  {data.some(d => d.category) && (
                    <th className="px-4 py-2 text-left border-b">Category</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{point.label}</td>
                    <td className="px-4 py-2 border-b">{point.value}</td>
                    {data.some(d => d.category) && (
                      <td className="px-4 py-2 border-b">{point.category || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'bar':
        const barChartData = {
          labels: data.map(point => point.label),
          datasets: [
            {
              label: y_axis_label || 'Value',
              data: data.map(point => point.value),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        };

        const barOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: !!y_axis_label,
                text: y_axis_label || '',
              },
            },
            x: {
              title: {
                display: !!x_axis_label,
                text: x_axis_label || '',
              },
            },
          },
        };

        return <Bar data={barChartData} options={barOptions} />;

      case 'pie':
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        
        const pieChartData = {
          labels: data.map(point => point.label),
          datasets: [
            {
              label: y_axis_label || 'Value',
              data: data.map(point => point.value),
              backgroundColor: colors.slice(0, data.length),
              borderColor: colors.slice(0, data.length).map(color => color),
              borderWidth: 2,
            },
          ],
        };

        const pieOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: 'right' as const,
            },
            title: {
              display: false,
            },
          },
        };

        return <Pie data={pieChartData} options={pieOptions} />;

      case 'line':
        // Group data by category
        const categorizedData = data.reduce((acc, point) => {
          const category = point.category || 'Default';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(point);
          return acc;
        }, {} as Record<string, ChartDataPoint[]>);

        // Get all unique labels for consistent x-axis
        const allLabels = Array.from(new Set(data.map(point => point.label)));

        // Define colors for different categories
        const lineColors = [
          'rgba(59, 130, 246, 1)',    // Blue
          'rgba(239, 68, 68, 1)',     // Red
          'rgba(16, 185, 129, 1)',    // Green
          'rgba(245, 158, 11, 1)',    // Yellow
          'rgba(139, 92, 246, 1)',    // Purple
          'rgba(236, 72, 153, 1)',    // Pink
        ];

        const lineBackgroundColors = [
          'rgba(59, 130, 246, 0.1)',
          'rgba(239, 68, 68, 0.1)',
          'rgba(16, 185, 129, 0.1)',
          'rgba(245, 158, 11, 0.1)',
          'rgba(139, 92, 246, 0.1)',
          'rgba(236, 72, 153, 0.1)',
        ];

        const lineChartData = {
          labels: allLabels,
          datasets: Object.entries(categorizedData).map(([category, points], index) => {
            // Create data array matching all labels
            const dataForCategory = allLabels.map(label => {
              const point = points.find(p => p.label === label);
              return point ? point.value : null;
            });

            return {
              label: category,
              data: dataForCategory,
              borderColor: lineColors[index % lineColors.length],
              backgroundColor: lineBackgroundColors[index % lineBackgroundColors.length],
              borderWidth: 2,
              fill: true,
              tension: 0.1,
              spanGaps: true, // Connect points even if some data is missing
            };
          }),
        };

        const lineOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: !!y_axis_label,
                text: y_axis_label || '',
              },
            },
            x: {
              title: {
                display: !!x_axis_label,
                text: x_axis_label || '',
              },
            },
          },
        };

        return <Line data={lineChartData} options={lineOptions} />;

      case 'scatter':
        const scatterChartData = {
          datasets: [
            {
              label: y_axis_label || 'Value',
              data: data.map(point => ({
                x: point.label,
                y: point.value,
              })),
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        };

        const scatterOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: !!y_axis_label,
                text: y_axis_label || '',
              },
            },
            x: {
              title: {
                display: !!x_axis_label,
                text: x_axis_label || '',
              },
            },
          },
        };

        return <Scatter data={scatterChartData} options={scatterOptions} />;

      default:
        return (
          <div className="text-center p-8 bg-gray-50 rounded">
            <p className="text-gray-600">Chart type "{chart_type}" is not supported</p>
            <div className="mt-4 text-left">
              <h4 className="font-medium">Data:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {data.map((point, index) => (
                  <li key={index}>{point.label}: {point.value}</li>
                ))}
              </ul>
            </div>
          </div>
        );
    }
  };

// ... existing code ...
return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="mb-4" id="gen-ui-chart">
        {renderChart()}
      </div>
      
      {insights && insights.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Data source: {data_source}</p>
      </div>
    </div>
  );
};

export default ChartComponent;

