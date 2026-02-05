import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/EventCardSkeleton";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/lib/types";

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

  const features = [
    {
      icon: Sparkles,
      title: "AI Extraction",
      description: "Our AI reads your poster and extracts all event details automatically",
    },
    {
      icon: Calendar,
      title: "Instant Pages",
      description: "Get a beautiful, shareable event page in seconds",
    },
    {
      icon: Users,
      title: "Local Focus",
      description: "Built for tiny local events that bring communities together",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background - soft gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 pb-24 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Event Discovery
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn a poster into a{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                real event link
              </span>{" "}
              in seconds
            </h1>

            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Upload your event poster, let AI extract the details, and publish a beautiful
              event page. Perfect for local meetups, workshops, and community events.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                onClick={handleUploadClick}
                className="h-13 px-8 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              >
                Upload Poster
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 text-base transition-all duration-300 hover:bg-muted"
                >
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mx-auto mt-24 grid max-w-4xl gap-6 sm:grid-cols-3"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 transition-all duration-300 group-hover:from-primary/20 group-hover:to-accent/20">
                  <feature.icon className="h-7 w-7 text-primary" />
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
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
              <p className="mt-2 text-muted-foreground">
                Discover what's happening in your community
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-16 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">No upcoming events</h3>
                <p className="mb-6 text-muted-foreground">
                  Be the first to create an event!
                </p>
                <Button onClick={handleUploadClick} className="shadow-lg shadow-primary/20">
                  Upload a Poster
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidget />
    </Layout>
  );
}
