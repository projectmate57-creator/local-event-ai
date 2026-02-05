import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProblemCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export function ProblemCard({ icon, title, description, index }: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={cn(
        "h-full border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent",
        "transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-destructive/10"
      )}>
        <CardContent className="flex flex-col items-start gap-3 p-5">
          <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
