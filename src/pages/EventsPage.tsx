import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/EventCardSkeleton";
import { FiltersBar } from "@/components/FiltersBar";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PublicEvent, EventFilters } from "@/lib/types";
import { getDateRangeFilter } from "@/lib/date";

const EVENTS_PER_PAGE = 12;

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    dateRange: "all",
    sortBy: "soonest",
  });
  const [page, setPage] = useState(0);

  const fetchEvents = async (pageOffset: number, replace: boolean) => {
    setLoading(true);

    try {
      let query = supabase
        .from("events_public")
        .select("*");

      // Always hide past events
      query = query.gte("start_at", new Date().toISOString());

      // Search filter
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,city.ilike.%${filters.search}%,venue.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // City filter
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== "all") {
        const range = getDateRangeFilter(filters.dateRange);
        if (range) {
          query = query.gte("start_at", range.start).lt("start_at", range.end);
        }
      }

      // Sorting
      if (filters.sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("start_at", { ascending: true });
      }

      // Pagination
      const offset = pageOffset * EVENTS_PER_PAGE;
      query = query.range(offset, offset + EVENTS_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) throw error;

      if (replace) {
        setEvents(data as PublicEvent[]);
      } else {
        setEvents((prev) => [...prev, ...(data as PublicEvent[])]);
      }

      setHasMore((data?.length ?? 0) === EVENTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change — reset to page 0
  useEffect(() => {
    setPage(0);
    fetchEvents(0, true);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, false);
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Browse Events</h1>
          <p className="mt-2 text-muted-foreground">
            Find upcoming events in your community
          </p>
        </motion.div>

        <FiltersBar filters={filters} onFiltersChange={setFilters} />

        {loading && events.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>

            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 flex justify-center"
              >
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? "Loading..." : "Load More Events"}
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <MapPin className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">No events found</h2>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        )}
      </section>

      <ChatWidget />
    </Layout>
  );
}
