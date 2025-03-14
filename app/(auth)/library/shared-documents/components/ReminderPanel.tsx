import { Bell, Calendar, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { Document } from "../page";
type ReminderPanelProps = {
  missingDocuments: Document[];
  onSendEmails: () => void;
};

const ReminderPanel = ({ missingDocuments, onSendEmails }: ReminderPanelProps) => {
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

export default ReminderPanel;
