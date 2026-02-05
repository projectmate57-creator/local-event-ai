import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface EvidenceDrawerProps {
  evidence: Record<string, string> | null;
}

export function EvidenceDrawer({ evidence }: EvidenceDrawerProps) {
  if (!evidence || Object.keys(evidence).length === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Why this?
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            AI Extraction Evidence
          </SheetTitle>
          <SheetDescription>
            Here's what the AI found in your poster to extract each field.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {Object.entries(evidence).map(([field, reason], index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-border bg-muted/50 p-4"
            >
              <h4 className="mb-1 font-medium capitalize text-foreground">
                {field.replace(/_/g, " ")}
              </h4>
              <p className="text-sm text-muted-foreground">{reason}</p>
            </motion.div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
