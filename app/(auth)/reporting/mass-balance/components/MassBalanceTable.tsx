import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const formatNumber = (value: number) => value.toFixed(3);

  const monthNameToNumber = (monthName: string): number => {
    const month_names: { [key: number]: string } = {
      1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
      7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
    };

    const monthNumber = Object.entries(month_names).find(
      ([_, name]) => name === monthName
    )?.[0];

    return monthNumber ? parseInt(monthNumber) : 1;
  };

  const handleIncomingClick = (month: string,year:number) => {
    const monthNumber = monthNameToNumber(month);
    router.push(`/transactions?month=${monthNumber}&year=${year}&transaction_type=INCOMING`);
  };

  const handleOutgoingClick = (month: string,year:number) => {
    const monthNumber = monthNameToNumber(month);
    router.push(`/transactions?month=${monthNumber}&year=${year}&transaction_type=PARTIAL_OUTGOING`);
  };

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
              <TableCell 
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => handleIncomingClick(row.month, row.year)}
              >
                {formatNumber(row.IncomingStock)}
              </TableCell>
              <TableCell 
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => handleOutgoingClick(row.month, row.year)}
              >
                {formatNumber(row.OutgoingStock)}
              </TableCell>
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