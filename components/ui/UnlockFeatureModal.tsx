import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getFeatureUpgradeMessage } from '@/config/featureRestrictions';

interface UnlockFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function UnlockFeatureModal({ isOpen, onClose, featureName }: UnlockFeatureModalProps) {
  const upgradeMessage = getFeatureUpgradeMessage(featureName);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" />
            Unlock Features
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <p className="text-gray-600">
            {upgradeMessage}
          </p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => window.location.href = 'mailto:start@rimba.ai'}
          >
            Upgrade Plan
          </Button>
          <a 
            href="mailto:start@rimba.ai" 
            className="text-sm text-blue-600 hover:underline"
          >
            Contact us for inquiries
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}