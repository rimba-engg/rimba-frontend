import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Contractor } from "@/app/(auth)/prevailing-wage/types";

const formSchema = z.object({
  name: z.string().min(1, "Contractor name is required"),
  wageClassification: z.string().min(1, "Wage classification is required"),
  constructionType: z.string().min(1, "Construction type is required"),
  baseRate: z.coerce.number().min(0, "Base rate must be a positive number"),
  fringeRate: z.coerce.number().min(0, "Fringe rate must be a positive number"),
  iraRequestDate: z.string().min(1, "IRA request date is required"),
  wdApprovalDate: z.string().min(1, "WD approval date is required"),
  isNewRate: z.boolean().default(false),
  expirationDate: z.string().min(1, "Expiration date is required"),
  daysValid: z.coerce.number().int().min(1, "Days valid must be at least 1"),
});

interface AddContractorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Contractor) => void;
}

const AddContractorForm = ({ open, onOpenChange, onSubmit }: AddContractorFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      wageClassification: "",
      constructionType: "",
      baseRate: 0,
      fringeRate: 0,
      iraRequestDate: "",
      wdApprovalDate: "",
      isNewRate: false,
      expirationDate: "",
      daysValid: 90,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Create the contractor object with required fields
    // This ensures all required fields from the Contractor interface are present
    const newContractor: Contractor = {
      id: Date.now().toString(),
      name: values.name,
      wageClassification: values.wageClassification,
      constructionType: values.constructionType,
      baseRate: values.baseRate,
      fringeRate: values.fringeRate,
      iraRequestDate: values.iraRequestDate,
      wdApprovalDate: values.wdApprovalDate,
      isNewRate: values.isNewRate,
      expirationDate: values.expirationDate,
      daysValid: values.daysValid,
    };
    
    onSubmit(newContractor);
    toast.success("Contractor added successfully");
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Contractor</DialogTitle>
          <DialogDescription>
            Enter contractor details for the selected project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contractor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wageClassification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wage Classification</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter wage classification" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="constructionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Construction Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter construction type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="baseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Rate Requested ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fringeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fringe Rate Requested ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iraRequestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of IRA Request</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wdApprovalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of WD Approval Letter</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isNewRate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>This is a new rate</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Expiration</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="daysValid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Valid</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contractor</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractorForm;