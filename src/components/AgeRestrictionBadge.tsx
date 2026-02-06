import { cn } from "@/lib/utils";
import { AgeRestriction } from "@/lib/types";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface AgeRestrictionBadgeProps {
  ageRestriction: AgeRestriction;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ageConfig: Record<AgeRestriction, { label: string; color: string; icon: boolean }> = {
  all_ages: { label: "All Ages", color: "bg-secondary text-secondary-foreground", icon: false },
  "16+": { label: "16+", color: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30", icon: true },
  "18+": { label: "18+", color: "bg-destructive/20 text-destructive border-destructive/30", icon: true },
  "21+": { label: "21+", color: "bg-destructive/30 text-destructive border-destructive/40", icon: true },
};

export function AgeRestrictionBadge({ ageRestriction, size = "sm", className }: AgeRestrictionBadgeProps) {
  // Don't show badge for all ages events
  if (ageRestriction === "all_ages") return null;

  const config = ageConfig[ageRestriction];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.icon && <ShieldAlert className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
