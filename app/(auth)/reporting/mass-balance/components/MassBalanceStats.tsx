import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { ProductSummary } from "../page";



export const MassBalanceStats = ({ stats }: { stats: ProductSummary[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">{stat.name}</h3>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-2xl font-bold text-green-500">{stat.INCOMING}</span>
              <span className={`ml-2 text-sm text-green-500`}>
                ↓
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold text-red-500">{stat.PARTIAL_OUTGOING}</span>
              <span className={`ml-2 text-sm text-red-500`}>
              ↑
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};