import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Event, PublicEvent } from "@/lib/types";
import { formatEventDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: Event | PublicEvent;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const posterUrl = event.poster_public_url || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/events/${event.slug || event.id}`}>
        <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card transition-all duration-500 hover:border-foreground/20 hover:shadow-2xl">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={posterUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Hover arrow */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-card opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              <ArrowRight className="h-5 w-5 text-foreground" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight text-card-foreground transition-colors group-hover:text-primary">
              {event.title}
            </h3>

            <div className="mb-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="truncate">{formatEventDate(event.start_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="truncate">
                  {event.venue ? `${event.venue}, ${event.city}` : event.city}
                </span>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
