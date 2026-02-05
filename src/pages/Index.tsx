import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/EventCardSkeleton";
import { ChatWidget } from "@/components/ChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/lib/types";
import { AnimatedIcon3D } from "@/components/3d/AnimatedIcon3D";

export default function Index() {
  const navigate = useNavigate();

  const { data: featuredEvents, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_at", now)
        .order("start_at", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Event[];
    },
  });

  const handleUploadClick = () => {
    navigate("/upload");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background - subtle geometric pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
          <div className="absolute right-0 top-20 h-[500px] w-[500px] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 pb-24 pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered Event Discovery
              </motion.div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Turn a poster into a{" "}
                <span className="text-primary">real event link</span>{" "}
                in seconds
              </h1>

              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Upload your event poster, let AI extract the details, and publish a beautiful
                event page. Perfect for local meetups, workshops, and community events.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
              >
                <Button
                  size="lg"
                  onClick={handleUploadClick}
                  className="h-12 px-8 text-base bg-foreground text-background hover:bg-foreground/90"
                >
                  Upload Poster
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link to="/events">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base border-foreground/20">
                    Browse Events
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: 3D Icons */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[400px] w-full">
                {/* Calendar icon - large, center-left */}
                <div className="absolute left-0 top-8 h-48 w-48">
                  <AnimatedIcon3D type="calendar" className="h-full w-full" />
                </div>
                {/* Location icon - medium, center-right */}
                <div className="absolute right-8 top-16 h-40 w-40">
                  <AnimatedIcon3D type="location" className="h-full w-full" />
                </div>
                {/* Sparkle icon - small, bottom */}
                <div className="absolute bottom-8 left-1/3 h-32 w-32">
                  <AnimatedIcon3D type="sparkle" className="h-full w-full" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mx-auto mt-24 grid max-w-4xl gap-6 sm:grid-cols-3"
          >
            {[
              {
                icon: "sparkle" as const,
                title: "AI Extraction",
                description: "Our AI reads your poster and extracts all event details automatically",
              },
              {
                icon: "calendar" as const,
                title: "Instant Pages",
                description: "Get a beautiful, shareable event page in seconds",
              },
              {
                icon: "location" as const,
                title: "Local Focus",
                description: "Built for tiny local events that bring communities together",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 text-center card-shadow transition-all hover:card-shadow-hover"
              >
                <div className="mx-auto mb-4 h-16 w-16">
                  <AnimatedIcon3D type={feature.icon} className="h-full w-full" />
                </div>
                <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
              <p className="mt-2 text-muted-foreground">
                Discover what's happening in your community
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} index={i} />
              ))
            ) : featuredEvents && featuredEvents.length > 0 ? (
              featuredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">No upcoming events</h3>
                <p className="mb-4 text-muted-foreground">
                  Be the first to create an event!
                </p>
                <Button onClick={handleUploadClick} className="bg-foreground text-background hover:bg-foreground/90">
                  Upload a Poster
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </Layout>
  );
}
