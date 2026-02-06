import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DuplicateEvent {
  id: string;
  title: string;
  city: string;
  start_at: string;
  venue: string | null;
}

interface DuplicateWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateEvent[];
  onConfirm: () => void;
  isPublishing?: boolean;
}

export function DuplicateWarningDialog({
  open,
  onOpenChange,
  duplicates,
  onConfirm,
  isPublishing = false,
}: DuplicateWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-accent">
            <AlertTriangle className="h-5 w-5" />
            Potential Duplicate Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            We found {duplicates.length} similar event{duplicates.length > 1 ? "s" : ""} already published. 
            Please review before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-60 space-y-3 overflow-y-auto">
          {duplicates.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <p className="font-medium text-foreground">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.venue ? `${event.venue}, ` : ""}{event.city}
              </p>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPublishing}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isPublishing ? "Publishing..." : "Publish Anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
