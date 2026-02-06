import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AgeRestriction } from "@/lib/types";

const AGE_VERIFIED_KEY = "age_verified";

interface AgeGateModalProps {
  ageRestriction: AgeRestriction;
  eventTitle: string;
  onVerified: () => void;
}

export function useAgeVerification() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem(AGE_VERIFIED_KEY);
    setIsVerified(verified === "true");
  }, []);

  const verify = () => {
    sessionStorage.setItem(AGE_VERIFIED_KEY, "true");
    setIsVerified(true);
  };

  return { isVerified, verify };
}

export function AgeGateModal({ ageRestriction, eventTitle, onVerified }: AgeGateModalProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const ageNumber = ageRestriction.replace("+", "");

  const handleConfirm = () => {
    sessionStorage.setItem(AGE_VERIFIED_KEY, "true");
    setIsOpen(false);
    onVerified();
  };

  const handleCancel = () => {
    setIsOpen(false);
    navigate("/events");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
          >
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </motion.div>
          <DialogTitle className="text-xl">Age Restricted Event</DialogTitle>
          <DialogDescription className="space-y-2 pt-2">
            <p className="font-medium text-foreground">{eventTitle}</p>
            <p>
              This event is for ages <strong>{ageNumber} and over</strong>.
            </p>
            <p>Please confirm you meet the age requirement to continue.</p>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={handleConfirm} className="w-full" size="lg">
            I am {ageNumber}+ years old
          </Button>
          <Button variant="outline" onClick={handleCancel} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing, you confirm that you are at least {ageNumber} years of age.
          This is stored in your browser session only.
        </p>
      </DialogContent>
    </Dialog>
  );
}
