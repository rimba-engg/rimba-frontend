'use client';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
}

export function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        {change && (
          <span className={`text-sm ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}