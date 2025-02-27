import { Card } from "@/components/ui/card";

export const MassBalanceStats = () => {
  const stats = [
    { title: "EFB :: INS", value: "0", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "EFB :: ISCC", value: "196", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "POME :: INS", value: "1665", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "POME :: ISCC", value: "2795", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "EFB :: INS", value: "0", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "EFB :: ISCC", value: "196", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "POME :: INS", value: "1665", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
    { title: "POME :: ISCC", value: "2795", trend: "up", secondaryValue: "0", secondaryTrend: "down" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">{stat.title}</h3>
          <div className="flex justify-between items-end">
            <div>
              <span className={`text-2xl font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{stat.value}</span>
              <span className={`ml-2 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <div>
              <span className={`text-2xl font-bold ${stat.secondaryTrend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{stat.secondaryValue}</span>
              <span className={`ml-2 text-sm ${stat.secondaryTrend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.secondaryTrend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};