import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface MassBalanceData {
  month: string;
  year: number;
  OpeningStock: number;
  IncomingStock: number;
  OutgoingStock: number;
  ClosingStock: number;
  PhysicalStock?: number;
  Losses?: number;
}

interface MassBalanceTableProps {
  data: MassBalanceData[];
}

export const MassBalanceTable = ({ data }: MassBalanceTableProps) => {
  const formatNumber = (value: number) => value.toFixed(3);

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead>Incoming</TableHead>
            <TableHead>Outgoing</TableHead>
            <TableHead>Closing</TableHead>
            <TableHead>Physical</TableHead>
            <TableHead>Losses</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={`${row.month}-${row.year}`} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">{`${row.month} ${row.year}`}</TableCell>
              <TableCell>{formatNumber(row.OpeningStock)}</TableCell>
              <TableCell className="text-blue-600">{formatNumber(row.IncomingStock)}</TableCell>
              <TableCell className="text-blue-600">{formatNumber(row.OutgoingStock)}</TableCell>
              <TableCell>{formatNumber(row.ClosingStock)}</TableCell>
              <TableCell>{row.PhysicalStock !== undefined ? formatNumber(row.PhysicalStock) : 'N/A'}</TableCell>
              <TableCell>{row.Losses !== undefined ? formatNumber(row.Losses) : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};