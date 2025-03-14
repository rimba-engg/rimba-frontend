'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Bell, FileCheck, FileMinus, Mail, Search,
  Eye, MoreHorizontal, Check, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { api } from "@/lib/api";

export type Document = {
    id: string;
    document_name: string;
    status: "present" | "missing" | "incomplete";
    found_document_name: string;
    confidence: "high" | "medium" | "low";
    reasoning: string;
    lastUpdated?: string;
    dueDate?: string;
    lastReminder?: string;
  };
  

  // API response type
  export type APIResponse = {
    message: string;
    status: string;
    data: {
      document_results: {
        document_name: string;
        status: "present" | "missing" | "incomplete";
        found_document_name: string;
        confidence: "high" | "medium" | "low";
        reasoning: string;
      }[];
    };
  };
  
// Document Row Component (inline)
const DocumentRow = ({ document }: { document: Document }) => {
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <span className="inline-flex items-center justify-center w-20 py-1 px-2 rounded-full bg-green-100 text-green-800 text-xs font-medium">High</span>;
      case "medium":
        return <span className="inline-flex items-center justify-center w-20 py-1 px-2 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Medium</span>;
      case "low":
        return <span className="inline-flex items-center justify-center w-20 py-1 px-2 rounded-full bg-red-100 text-red-800 text-xs font-medium">Low</span>;
      default:
        return <span className="inline-flex items-center justify-center w-20 py-1 px-2 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">Unknown</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Document present</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "incomplete":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Document incomplete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "missing":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FileMinus className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Document missing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-3 grid grid-cols-11 gap-2 items-center">
        <div className="col-span-5 flex items-center gap-3">
          <div 
            className={`w-2 h-10 rounded-full ${
              document.status === "present" 
                ? "bg-green-500" 
                : document.status === "incomplete" 
                ? "bg-yellow-500" 
                : "bg-red-500"
            }`}
          />
          <div className="flex flex-col">
            <span className="font-medium">{document.document_name}</span>
            <span className="text-xs text-gray-500">Updated {document.lastUpdated || 'Never'}</span>
          </div>
        </div>
        
        <div className="col-span-3 flex flex-col">
          <span className="text-xs text-gray-500">Checklist Item:</span>
          <span className="text-sm truncate">{document.found_document_name}</span>
        </div>
        
        <div className="col-span-2 flex justify-center">
          {getConfidenceBadge(document.confidence)}
        </div>
        
        <div className="col-span-1 flex justify-center">
          {getStatusIcon(document.status)}
        </div>
      </div>
      <Separator />
    </>
  );
};

// ReminderPanel Component (inline)
const ReminderPanelInline = ({ missingDocuments, onSendEmails }: { missingDocuments: Document[], onSendEmails: () => void }) => {
  const { toast } = useToast();
  
  const sendIndividualReminder = (document: Document) => {
    toast({
      title: "Reminder sent",
      description: `Sent reminder for "${document.document_name}"`,
    });
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Bell className="text-orange-500" />
        Reminders
      </h2>
      
      {missingDocuments.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            The following documents are missing and require attention.
          </p>
          
          <div className="space-y-4 mb-6">
            {missingDocuments.map((doc) => (
              <div key={doc.id} className="p-3 bg-orange-50 rounded-md border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{doc.document_name}</h3>
                    <p className="text-xs text-gray-500">Required by {doc.dueDate}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => sendIndividualReminder(doc)}
                  >
                    <Mail className="h-3 w-3 mr-1" /> 
                    Remind
                  </Button>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 
                    Last reminder: {doc.lastReminder || "Never"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              {missingDocuments.length} document{missingDocuments.length !== 1 ? 's' : ''} missing
            </p>
            <Button onClick={onSendEmails} className="gap-2">
              <Mail className="h-4 w-4" />
              Send All Reminders
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-medium mb-2">All documents are present!</h3>
          <p className="text-sm text-gray-500">
            There are no missing documents that require reminders.
          </p>
        </div>
      )}
    </Card>
  );
};

// Main DocumentList component
const SharedDocumentList = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const filteredDocuments = documents.filter(doc => 
    doc.document_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const missingDocuments = documents.filter(doc => doc.status === "missing");
  
  const sendReminderEmails = () => {
    toast({
      title: "Reminder emails sent",
      description: `Sent ${missingDocuments.length} reminder emails for missing documents`,
    });
  };

  // Function to process API response
  const processApiResponse = (response: APIResponse) => {
    if (response.status === "success" && response.data.document_results) {
      const processedDocuments = response.data.document_results.map((doc, index) => ({
        id: `doc${index + 1}`,
        document_name: doc.document_name,
        status: doc.status,
        found_document_name: doc.found_document_name,
        confidence: doc.confidence,
        reasoning: doc.reasoning,
        lastUpdated: "Recently",
        dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        lastReminder: "Never"
      }));
      
      setDocuments(processedDocuments);
      toast({
        title: "Documents loaded",
        description: `Loaded ${processedDocuments.length} documents from the API`,
      });
    } else {
      toast({
        title: "Error loading documents",
        description: "There was an error loading the documents. Please try again.",
        variant: "destructive"
      });
      setDocuments([]);
    }
  };

  useEffect(() => {
    const fetchDocumentVerification = async () => {
      setLoading(true);
      try {
        // Show a loading toast to indicate API request is in progress
        toast({
          title: "Loading documents",
          description: "Fetching document verification data...",
        });
        
        const response = await api.post<APIResponse>('/v2/document-verification/', {});
        processApiResponse(response);
      } catch (error) {
        console.error('Failed to fetch document verification data:', error);
        toast({
          title: "API Error",
          description: "Failed to fetch document verification data. Please try again later.",
          variant: "destructive"
        });
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentVerification();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading document verification data...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch the latest information</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            className="gap-2" 
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowReminders(!showReminders)}
            >
              <Bell size={16} />
              Reminders
              {missingDocuments.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {missingDocuments.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={sendReminderEmails}
            >
              <Mail size={16} />
              Send Emails
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${showReminders ? 'w-2/3' : 'w-full'}`}>
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileCheck className="text-blue-500" />
                SharePoint Documents
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search documents..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Tabs defaultValue="all" className="mb-6">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  <TabsTrigger value="present">Present</TabsTrigger>
                  <TabsTrigger value="missing">Missing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <div className="rounded-md border">
                    <div className="bg-muted/50 p-3 grid grid-cols-11 gap-2 font-medium">
                      <div className="col-span-5">Document Name</div>
                      <div className="col-span-3">Checklist Item</div>
                      <div className="col-span-2 text-center">Confidence</div>
                      <div className="col-span-1 text-center">Status</div>
                    </div>
                    <Separator />
                    {loading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-500">Loading documents...</p>
                      </div>
                    ) : filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <DocumentRow key={doc.id} document={doc} />
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No documents found matching your search.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="present" className="mt-0">
                  <div className="rounded-md border">
                    <div className="bg-muted/50 p-3 grid grid-cols-11 gap-2 font-medium">
                      <div className="col-span-5">Document Name</div>
                      <div className="col-span-3">Checklist Item</div>
                      <div className="col-span-2 text-center">Confidence</div>
                      <div className="col-span-1 text-center">Status</div>
                    </div>
                    <Separator />
                    {loading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-500">Loading documents...</p>
                      </div>
                    ) : filteredDocuments.filter(doc => doc.status === "present").length > 0 ? (
                      filteredDocuments
                        .filter(doc => doc.status === "present")
                        .map((doc) => (
                          <DocumentRow key={doc.id} document={doc} />
                        ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No present documents found.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="missing" className="mt-0">
                  <div className="rounded-md border">
                    <div className="bg-muted/50 p-3 grid grid-cols-11 gap-2 font-medium">
                      <div className="col-span-5">Document Name</div>
                      <div className="col-span-3">Found Document</div>
                      <div className="col-span-2 text-center">Confidence</div>
                      <div className="col-span-1 text-center">Status</div>
                    </div>
                    <Separator />
                    {loading ? (
                      <div className="p-6 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-500">Loading documents...</p>
                      </div>
                    ) : filteredDocuments.filter(doc => doc.status === "missing").length > 0 ? (
                      filteredDocuments
                        .filter(doc => doc.status === "missing")
                        .map((doc) => (
                          <DocumentRow key={doc.id} document={doc} />
                        ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No missing documents found.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {showReminders && (
            <div className="w-full md:w-1/3">
              <ReminderPanelInline 
                missingDocuments={missingDocuments} 
                onSendEmails={sendReminderEmails} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedDocumentList;
