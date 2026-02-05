import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const nowFeatures = [
  "Upload poster image",
  "Draft extraction + confidence badges",
  "Verify/edit and publish",
  "Public event listing + event page",
  "Add-to-calendar and shareable link",
  "Basic analytics (views, ticket clicks)",
];

const nextFeatures = [
  "Instagram tagging → auto event link",
  "Telegram bot → send posters to create drafts",
  "Deeper analytics: reach by channel",
  "Top referrers tracking",
  "Event collections and curated lists",
  "Neighborhood-based discovery",
];

export function ScopeGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Now / MVP */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="h-full border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">NOW</Badge>
              MVP Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {nowFeatures.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next / Future */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="h-full border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">NEXT</Badge>
              Future Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {nextFeatures.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
