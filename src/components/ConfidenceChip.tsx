import { cn } from "@/lib/utils";

interface ConfidenceChipProps {
  confidence: number;
  className?: string;
}

export function ConfidenceChip({ confidence, className }: ConfidenceChipProps) {
  const percent = Math.round(confidence * 100);

  const getConfidenceColor = () => {
    if (percent >= 80) return "bg-confidence-high text-white";
    if (percent >= 50) return "bg-confidence-medium text-foreground";
    return "bg-confidence-low text-white";
  };

  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        getConfidenceColor(),
        className
      )}
    >
      {percent}%
    </span>
  );
}
