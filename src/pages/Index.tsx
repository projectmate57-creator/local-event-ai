import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Calendar, MapPin, Users, Zap, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/EventCardSkeleton";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PublicEvent } from "@/lib/types";

export default function Index() {
  const navigate = useNavigate();

  const { data: featuredEvents, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("events_public")
        .select("*")
        .gte("start_at", now)
        .order("start_at", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as PublicEvent[];
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
      icon: Zap,
      title: "Instant Pages",
      description: "Get a beautiful, shareable event page in seconds",
    },
    {
      icon: Globe,
      title: "Local Focus",
      description: "Built for tiny local events that bring communities together",
    },
  ];

  const stats = [
    { value: "500+", label: "Events Created" },
    { value: "10K+", label: "Posters Scanned" },
    { value: "50+", label: "Cities" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <AnimatedBackground />

        <div className="container mx-auto px-4 pb-32 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 text-sm font-medium tracking-wide text-muted-foreground"
            >
              Share the tiny moments nearby
            </motion.p>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-5 py-2 text-sm font-medium backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
              </span>
              AI-Powered Event Discovery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Turn a poster into a{" "}
              <span className="relative">
                <span className="relative z-10">real event link</span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-foreground/10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>{" "}
              in seconds
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              Upload your event poster, let AI extract the details, and publish a beautiful
              event page. Perfect for local meetups, workshops, and community events.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                onClick={handleUploadClick}
                className="group h-14 px-8 text-base font-medium shadow-2xl shadow-foreground/20 transition-all duration-300 hover:shadow-foreground/30"
              >
                Upload Poster
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Link to="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-medium transition-all duration-300 hover:bg-foreground hover:text-background"
                >
                  Browse Events
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-20 flex justify-center gap-12 border-t border-foreground/10 pt-12 sm:gap-20"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-t border-foreground/10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="text-muted-foreground">Three simple steps to create your event page</p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-foreground/10 bg-card p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                  {i + 1}
                </div>
                
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="border-t border-foreground/10 bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Upcoming Events</h2>
              <p className="mt-3 text-muted-foreground">
                Discover what's happening in your community
              </p>
            </div>
            <Link to="/events">
              <Button 
                variant="outline" 
                className="group transition-all duration-300 hover:bg-foreground hover:text-background"
              >
                View all events
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                className="col-span-full py-20 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-foreground/20">
                  <MapPin className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No upcoming events</h3>
                <p className="mb-8 text-muted-foreground">
                  Be the first to create an event!
                </p>
                <Button onClick={handleUploadClick} size="lg" className="shadow-xl">
                  Upload a Poster
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-foreground/10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Made for communities</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Ready to share your next event?
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Join hundreds of organizers who use TinyTinyEvents to reach their local community.
            </p>
            <Button
              size="lg"
              onClick={handleUploadClick}
              className="h-14 px-10 text-base font-medium shadow-2xl"
            >
              Get Started — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ChatWidget />
    </Layout>
  );
}
