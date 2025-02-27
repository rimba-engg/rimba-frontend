import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const MassBalanceTable = () => {
  const data = [
    {
      month: "Jan 2025",
      opening: "0.000",
      incoming: "1166.510",
      outgoing: "3000.311",
      closing: "-1833.801",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Feb 2025",
      opening: "-1833.801",
      incoming: "1628.890",
      outgoing: "6050.047",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Mar 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Apr 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "May 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Jun 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Jul 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Aug 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Sep 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Oct 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Nov 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
    {
      month: "Dec 2025",
      opening: "-6254.958",
      incoming: "0.000",
      outgoing: "0.000",
      closing: "-6254.958",
      physical: "0.000",
      losses: "0.0",
    },
  ];

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
            <TableRow key={row.month} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">{row.month}</TableCell>
              <TableCell>{row.opening}</TableCell>
              <TableCell className="text-blue-600">{row.incoming}</TableCell>
              <TableCell className="text-blue-600">{row.outgoing}</TableCell>
              <TableCell>{row.closing}</TableCell>
              <TableCell>{row.physical}</TableCell>
              <TableCell>{row.losses}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};