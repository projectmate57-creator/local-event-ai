import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function ConfidenceBadge({
  confidence,
  size = "md",
  showIcon = true,
}: ConfidenceBadgeProps) {
  const percent = Math.round(confidence * 100);

  const getConfidenceLevel = () => {
    if (percent >= 80) return "high";
    if (percent >= 50) return "medium";
    return "low";
  };

  const level = getConfidenceLevel();

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const colorClasses = {
    high: "bg-confidence-high/10 text-confidence-high border-confidence-high/30",
    medium: "bg-confidence-medium/10 text-confidence-medium border-confidence-medium/30",
    low: "bg-confidence-low/10 text-confidence-low border-confidence-low/30",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        sizeClasses[size],
        colorClasses[level]
      )}
    >
      {showIcon && <Sparkles className="h-3.5 w-3.5" />}
      <span>AI Confidence: {percent}%</span>
    </motion.div>
  );
}
