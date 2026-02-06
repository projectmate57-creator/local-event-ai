import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Download,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/lib/types";
import { formatEventDateRange } from "@/lib/date";
import { generateGoogleCalendarUrl, downloadICS } from "@/lib/calendar";
import { ShareButtons } from "@/components/ShareButtons";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      // Try to find by slug first, then by ID
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published");

      const { data: bySlug } = await query.eq("slug", slug).single();
      if (bySlug) return bySlug as Event;

      // Try by ID
      const { data: byId, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("id", slug)
        .single();

      if (error) throw error;
      return byId as Event;
    },
    enabled: !!slug,
  });

  // Track page view via rate-limited edge function
  useEffect(() => {
    if (event?.id) {
      supabase.functions
        .invoke("track-analytics", {
          body: { event_id: event.id, type: "view" },
        })
        .then(({ error }) => {
          if (error) console.error("Failed to track view:", error);
        });
    }
  }, [event?.id]);

  const handleTicketClick = () => {
    if (event?.ticket_url) {
      // Track click via rate-limited edge function
      supabase.functions
        .invoke("track-analytics", {
          body: { event_id: event.id, type: "ticket_click" },
        })
        .then(() => {
          window.open(event.ticket_url!, "_blank");
        });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="mb-6 h-8 w-32" />
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Event not found</h1>
          <p className="mb-8 text-muted-foreground">
            This event may have been removed or doesn't exist.
          </p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const posterUrl = event.poster_public_url || "/placeholder.svg";

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/events">
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <img
              src={posterUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              style={{ maxHeight: "600px" }}
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                {event.title}
              </h1>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Event info */}
            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {formatEventDateRange(event.start_at, event.end_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.timezone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {event.venue || event.city}
                  </p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                  {event.venue && (
                    <p className="text-sm text-muted-foreground">{event.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="prose prose-neutral max-w-none dark:prose-invert">
                <h2 className="text-lg font-semibold text-foreground">About this event</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {event.description}
                </p>
              </div>
            )}

            {/* Share */}
            <div className="pt-2">
              <ShareButtons
                url={`/events/${event.slug || event.id}`}
                title={event.title}
                description={event.description || undefined}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              {event.ticket_url && (
                <Button onClick={handleTicketClick} size="lg" className="gradient-bg">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Get Tickets
                </Button>
              )}

              <a
                href={generateGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Google Calendar
                </Button>
              </a>

              <Button
                variant="outline"
                size="lg"
                onClick={() => downloadICS(event)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download .ics
              </Button>
            </div>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}
