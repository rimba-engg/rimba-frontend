'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Plus } from "lucide-react";
import DateSelector from "@/components/selectors/DateSelector";
import { toast } from "sonner";

const PayrollDocuments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    toast.info(`Documents filtered for ${date.toLocaleDateString()}`);
  };

  const handleUpload = () => {
    toast.success("Document uploaded successfully");
  };

  // Sample document categories
  const documentCategories = [
    { month: "April 2023", documents: [
      { id: "1", name: "ABC_Construction_Payroll_Apr1.pdf", type: "payroll", date: "2023-04-05" },
      { id: "2", name: "ABC_Construction_Proof_Apr1.pdf", type: "proof", date: "2023-04-05" },
    ]},
    { month: "March 2023", documents: [
      { id: "3", name: "ABC_Construction_Payroll_Mar25.pdf", type: "payroll", date: "2023-03-28" },
      { id: "4", name: "ABC_Construction_Proof_Mar25.pdf", type: "proof", date: "2023-03-28" },
      { id: "5", name: "XYZ_Maintenance_Payroll_Mar18.pdf", type: "payroll", date: "2023-03-22" },
    ]}
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Payroll Documents</h1>
        <DateSelector onDateChange={handleDateChange} />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Document Library</CardTitle>
            <div className="flex gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Email
              </Button>
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payroll" className="w-full">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="payroll">Payroll Reports (WH-347)</TabsTrigger>
              <TabsTrigger value="proof">Proof of Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payroll" className="mt-6">
              <div className="space-y-6">
                {documentCategories.map((category) => (
                  <div key={category.month} className="space-y-4">
                    <h3 className="text-lg font-semibold">{category.month}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.documents
                        .filter((doc) => doc.type === "payroll")
                        .map((document) => (
                          <Card key={document.id} className="overflow-hidden">
                            <div className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer">
                              <div className="bg-primary/10 p-3 rounded">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{document.name}</p>
                                <p className="text-sm text-muted-foreground">Uploaded: {document.date}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="proof" className="mt-6">
              <div className="space-y-6">
                {documentCategories.map((category) => (
                  <div key={category.month} className="space-y-4">
                    <h3 className="text-lg font-semibold">{category.month}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.documents
                        .filter((doc) => doc.type === "proof")
                        .map((document) => (
                          <Card key={document.id} className="overflow-hidden">
                            <div className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer">
                              <div className="bg-primary/10 p-3 rounded">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{document.name}</p>
                                <p className="text-sm text-muted-foreground">Uploaded: {document.date}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollDocuments;