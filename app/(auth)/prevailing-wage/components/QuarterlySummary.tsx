import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { QuarterlySummaryItem } from "@/app/(auth)/prevailing-wage/types";
  
  interface QuarterlySummaryProps {
    operational: QuarterlySummaryItem[];
    construction: QuarterlySummaryItem[];
  }
  
  const getStatusBadge = (action: string) => {
    if (action.toLowerCase().includes("received")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Received
        </span>
      );
    } else if (action.toLowerCase().includes("reminder")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Reminder Sent
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Pending
        </span>
      );
    }
  };
  
  const QuarterlySummary = ({ operational, construction }: QuarterlySummaryProps) => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Quarterly Summary</h2>
        
        <Tabs defaultValue="operational" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="operational">Operational Projects</TabsTrigger>
            <TabsTrigger value="construction">Construction Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="operational" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Operational Projects</CardTitle>
                <CardDescription>
                  Summary of contractors working on operational projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contractor</TableHead>
                        <TableHead>Project Site</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pay Date</TableHead>
                        <TableHead>Last Action Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operational.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No operational projects data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        operational.map((item) => (
                          <TableRow key={`${item.contractor}-${item.payDate}`}>
                            <TableCell className="font-medium">{item.contractor}</TableCell>
                            <TableCell>{item.projectSite}</TableCell>
                            <TableCell>{item.quarter}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{getStatusBadge(item.actionTaken)}</TableCell>
                            <TableCell>{item.payDate}</TableCell>
                            <TableCell>{item.lastActionDate}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="construction" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Construction Projects</CardTitle>
                <CardDescription>
                  Summary of contractors working on construction projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contractor</TableHead>
                        <TableHead>Project Site</TableHead>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pay Date</TableHead>
                        <TableHead>Last Action Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {construction.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No construction projects data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        construction.map((item) => (
                          <TableRow key={`${item.contractor}-${item.payDate}`}>
                            <TableCell className="font-medium">{item.contractor}</TableCell>
                            <TableCell>{item.projectSite}</TableCell>
                            <TableCell>{item.quarter}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{getStatusBadge(item.actionTaken)}</TableCell>
                            <TableCell>{item.payDate}</TableCell>
                            <TableCell>{item.lastActionDate}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  export default QuarterlySummary;