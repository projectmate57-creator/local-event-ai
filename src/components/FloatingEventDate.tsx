import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCompactDateRange, getEventDuration } from "@/lib/date";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { PublicEvent } from "@/lib/types";

interface FloatingEventDateProps {
  event: PublicEvent;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function FloatingEventDate({ event, triggerRef }: FloatingEventDateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = triggerRef?.current?.offsetTop 
        ? triggerRef.current.offsetTop + triggerRef.current.offsetHeight
        : 300;
      
      setIsVisible(scrollY > triggerPoint);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerRef]);

  const duration = getEventDuration(event.start_at, event.end_at);
  const dateRange = formatCompactDateRange(event.start_at, event.end_at);

  if (isMobile) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
          >
            <div className="container mx-auto flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{dateRange}</span>
                {duration && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {duration.label}
                  </Badge>
                )}
              </div>
              <a
                href={generateGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-8">
                  <Calendar className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-6 top-24 z-50 w-64 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            When
          </div>
          <div className="mb-2 text-lg font-semibold text-foreground">
            {dateRange}
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {duration && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {duration.label}
              </Badge>
            )}
            {event.timezone && (
              <span className="text-xs text-muted-foreground">{event.timezone}</span>
            )}
          </div>
          <a
            href={generateGoogleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button size="sm" variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
