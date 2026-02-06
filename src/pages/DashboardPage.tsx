import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  MousePointerClick,
  TrendingUp,
  FileEdit,
  Globe,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/lib/types";
import { formatRelativeTime } from "@/lib/date";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's events - must be before any conditional returns
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["my-events", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Fetch analytics summary
  const { data: analytics } = useQuery({
    queryKey: ["analytics-summary", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get event IDs for this user
      const { data: userEvents } = await supabase
        .from("events")
        .select("id, title")
        .eq("owner_id", user!.id);

      if (!userEvents || userEvents.length === 0) {
        return { views: 0, clicks: 0, topEvents: [] };
      }

      const eventIds = userEvents.map((e) => e.id);

      // Get analytics for these events
      const { data: analyticsData } = await supabase
        .from("event_analytics")
        .select("event_id, type")
        .in("event_id", eventIds)
        .gte("created_at", sevenDaysAgo.toISOString());

      if (!analyticsData) {
        return { views: 0, clicks: 0, topEvents: [] };
      }

      const views = analyticsData.filter((a) => a.type === "view").length;
      const clicks = analyticsData.filter((a) => a.type === "ticket_click").length;

      // Calculate top events by views
      const viewsByEvent: Record<string, number> = {};
      analyticsData
        .filter((a) => a.type === "view")
        .forEach((a) => {
          viewsByEvent[a.event_id] = (viewsByEvent[a.event_id] || 0) + 1;
        });

      const topEvents = Object.entries(viewsByEvent)
        .map(([id, viewCount]) => ({
          id,
          title: userEvents.find((e) => e.id === id)?.title || "Unknown",
          views: viewCount,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return { views, clicks, topEvents };
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event deleted" });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect if not logged in - after all hooks
  if (!user) {
    navigate("/signin");
    return null;
  }

  const drafts = events?.filter((e) => e.status === "draft") || [];
  const published = events?.filter((e) => e.status === "published") || [];

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and view analytics</p>
          </div>
          <Link to="/upload">
            <Button className="gradient-bg">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views (7d)</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.views ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <MousePointerClick className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Clicks (7d)</p>
                <p className="text-2xl font-bold text-foreground">{analytics?.clicks ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{events?.length ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Events */}
        {analytics?.topEvents && analytics.topEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-foreground">Top Events by Views</h2>
            <div className="space-y-3">
              {analytics.topEvents.map((event, i) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                    <span className="text-foreground">{event.title}</span>
                  </div>
                  <Badge variant="secondary">{event.views} views</Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Events Tabs */}
        <Tabs defaultValue="drafts" className="w-full">
          <TabsList>
            <TabsTrigger value="drafts" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Drafts ({drafts.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <Globe className="h-4 w-4" />
              Published ({published.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="mt-6">
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : drafts.length > 0 ? (
              <div className="space-y-4">
                {drafts.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onDelete={() => deleteMutation.mutate(event.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="drafts" />
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : published.length > 0 ? (
              <div className="space-y-4">
                {published.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onDelete={() => deleteMutation.mutate(event.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="published" />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}

function EventRow({ event, onDelete }: { event: Event; onDelete: () => void }) {
  const posterUrl = event.poster_public_url || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
    >
      <img
        src={posterUrl}
        alt={event.title}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {event.city} • Created {formatRelativeTime(event.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {event.status === "draft" ? (
          <Link to={`/drafts/${event.id}`}>
            <Button variant="outline" size="sm">
              <FileEdit className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </Link>
        ) : (
          <Link to={`/events/${event.slug || event.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              View
            </Button>
          </Link>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete event?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{event.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

function EmptyState({ type }: { type: "drafts" | "published" }) {
  return (
    <div className="py-12 text-center">
      {type === "drafts" ? (
        <FileEdit className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
      ) : (
        <Globe className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
      )}
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        No {type === "drafts" ? "drafts" : "published events"}
      </h3>
      <p className="mb-4 text-muted-foreground">
        {type === "drafts"
          ? "Upload a poster to start creating events"
          : "Publish your drafts to see them here"}
      </p>
      {type === "drafts" && (
        <Link to="/upload">
          <Button className="gradient-bg">
            <Plus className="mr-2 h-4 w-4" />
            Upload Poster
          </Button>
        </Link>
      )}
    </div>
  );
}
