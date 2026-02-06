import { AgeRestriction, AGE_RESTRICTIONS, CONTENT_FLAG_LABELS } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgeRestrictionSelectorProps {
  value: AgeRestriction;
  onChange: (value: AgeRestriction) => void;
  contentFlags?: string[] | null;
  moderationWarning?: string | null;
}

export function AgeRestrictionSelector({
  value,
  onChange,
  contentFlags,
  moderationWarning,
}: AgeRestrictionSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="age_restriction">Age Restriction</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                AI-detected age restriction based on venue type and content.
                You can adjust this if incorrect.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select value={value} onValueChange={(v) => onChange(v as AgeRestriction)}>
        <SelectTrigger id="age_restriction" className="w-full">
          <SelectValue placeholder="Select age restriction" />
        </SelectTrigger>
        <SelectContent>
          {AGE_RESTRICTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Content Flags */}
      {contentFlags && contentFlags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {contentFlags.map((flag) => (
            <Badge key={flag} variant="secondary" className="text-xs">
              {CONTENT_FLAG_LABELS[flag] || flag}
            </Badge>
          ))}
        </div>
      )}

      {/* Moderation Warning */}
      {moderationWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Content Warning</p>
            <p className="text-muted-foreground">{moderationWarning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
