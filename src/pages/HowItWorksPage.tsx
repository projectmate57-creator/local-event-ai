import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  Database,
  Sparkles,
  CheckCircle,
  Globe,
  Search,
  Users,
  Shield,
  BadgeCheck,
  Heart,
  ArrowRight,
  Calendar,
  Palette,
  Dumbbell,
  GraduationCap,
  Lightbulb,
  ImageIcon,
  MapPin,
  Coffee,
  Building,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HowItWorksPage() {
  const problems = [
    {
      icon: ImageIcon,
      title: "Posters are offline",
      description:
        "Amazing events stuck on café walls, campus boards, and lamp posts across Berlin.",
    },
    {
      icon: Globe,
      title: "No link to share",
      description:
        "You can't text a friend a physical poster. Events stay invisible online.",
    },
    {
      icon: Calendar,
      title: "People forget or miss it",
      description:
        "Without a calendar reminder or bookmark, that cool event fades from memory.",
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: "Upload poster",
      description: "Snap a photo or upload an image of any event poster.",
    },
    {
      icon: Database,
      title: "Saved safely",
      description: "Your poster is securely stored in our cloud.",
    },
    {
      icon: Sparkles,
      title: "AI extracts details",
      description: "Our AI reads the poster and pulls out date, time, venue, and more.",
    },
    {
      icon: CheckCircle,
      title: "You verify + edit",
      description: "Review the extracted info and make any corrections needed.",
    },
    {
      icon: Globe,
      title: "Publish event page",
      description: "Get a clean, shareable link for your event.",
    },
    {
      icon: Search,
      title: "Community finds it",
      description: "People can search, browse, and add to their calendars.",
    },
  ];

  const trustCards = [
    {
      icon: BadgeCheck,
      title: "Verified by humans",
      description:
        "Every event goes through human review before publishing. We never auto-publish.",
    },
    {
      icon: Shield,
      title: "Confidence score + evidence",
      description:
        "See exactly what the AI detected and how confident it is. Transparency first.",
    },
    {
      icon: Heart,
      title: "Community-first, not spam",
      description:
        "We focus on real local events, not promotions. Quality over quantity.",
    },
  ];

  const useCases = [
    {
      icon: Users,
      title: "Neighborhood meetups",
      description: "Block parties, community gardens, local cleanups.",
    },
    {
      icon: Lightbulb,
      title: "Hackathons & tech events",
      description: "Coding nights, startup weekends, tech talks.",
    },
    {
      icon: Palette,
      title: "Art shows & workshops",
      description: "Gallery openings, craft workshops, creative sessions.",
    },
    {
      icon: GraduationCap,
      title: "Campus clubs",
      description: "Student groups, uni events, academic meetups.",
    },
    {
      icon: Dumbbell,
      title: "Community sports",
      description: "Park runs, yoga sessions, pickup games.",
    },
    {
      icon: Coffee,
      title: "Café & venue events",
      description: "Open mics, book clubs, trivia nights.",
    },
  ];

  const faqs = [
    {
      question: "Is it free?",
      answer:
        "Yes! TinyTinyEvents is completely free to use. Upload posters, create events, and share them with your community at no cost.",
    },
    {
      question: "Do I need an account?",
      answer:
        "No account required to browse events. You can upload and create events without signing up.",
    },
    {
      question: "What events are supported?",
      answer:
        "Any local, community event! Meetups, workshops, art shows, sports, talks, markets — if it's happening in your neighborhood, it belongs here.",
    },
    {
      question: "Can I edit details after upload?",
      answer:
        "Absolutely. After AI extraction, you can edit any field before publishing. And you can update your event anytime after it's live.",
    },
    {
      question: "Is the AI always correct?",
      answer:
        "Not always — that's why you verify! We show confidence badges so you know what to double-check. You're always in control before publishing.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-24 sm:py-32">
        {/* Floating poster animation */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute right-[10%] top-[15%] h-48 w-36 rotate-6 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 shadow-xl backdrop-blur-sm sm:h-64 sm:w-48"
            initial={{ opacity: 0, y: 50, rotate: 12 }}
            animate={{ opacity: 1, y: 0, rotate: 6 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <motion.div
                className="h-3 w-3/4 rounded-full bg-primary/30"
                animate={{ scaleX: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="h-2 w-2/3 rounded-full bg-primary/20"
                animate={{ scaleX: [1, 0.9, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
              <div className="my-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <motion.div
                className="h-2 w-1/2 rounded-full bg-primary/20"
                animate={{ scaleX: [1, 0.85, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </motion.div>
          
          {/* Scan line animation */}
          <motion.div
            className="absolute right-[10%] top-[15%] h-48 w-36 rotate-6 overflow-hidden rounded-lg sm:h-64 sm:w-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ top: 0 }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <MapPin className="h-4 w-4" />
              Made for Berlin & beyond
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Tiny events deserve to be{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                found.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-lg text-muted-foreground sm:text-xl"
            >
              Turn any street poster into a real event link in seconds.
              <br />
              <span className="font-medium text-foreground">Community to community.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link to="/upload">
                <Button
                  size="lg"
                  className="group h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  Upload a poster
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Browse events
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              The Problem
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Events are everywhere. But invisible.
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Walk through Kreuzberg, Neukölln, or Prenzlauer Berg. Posters on every corner —
              but try finding them online.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="mb-2 font-semibold">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
              The Solution
            </Badge>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              One upload. One link. Community connected.
            </h2>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
              <p className="text-lg text-muted-foreground">
                <span className="font-medium text-foreground">Upload a poster → </span>
                We extract the details →{" "}
                <span className="font-medium text-foreground">You verify & publish → </span>
                Everyone gets a clean link + calendar buttons.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step-by-step Timeline */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              From poster to published in 6 steps
            </h2>
          </motion.div>

          {/* Desktop Timeline */}
          <div className="mx-auto hidden max-w-5xl lg:block">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-0 right-0 top-16 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              
              <div className="grid grid-cols-6 gap-4">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex flex-col items-center text-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/20"
                    >
                      <step.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span className="mb-2 text-xs font-semibold text-primary">
                      Step {i + 1}
                    </span>
                    <h3 className="mb-1 text-sm font-semibold">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="mx-auto max-w-md lg:hidden">
            <div className="relative space-y-6">
              {/* Vertical line */}
              <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40" />
              
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/20">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-4"
          >
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <Shield className="h-3 w-3" />
              Never auto-publish without verification
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <BadgeCheck className="h-3 w-3" />
              Confidence badges show what needs checking
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              Trust & Community
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Built on trust</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              We focus on small local events that are usually not online. Quality over quantity.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {trustCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-primary/10 bg-gradient-to-br from-primary/5 to-transparent transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <card.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              Use Cases
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Perfect for</h2>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="group h-full border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <useCase.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Common questions</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-xl border border-border/50 bg-card/50 px-6 backdrop-blur-sm"
                >
                  <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Community first</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Help your community discover tiny events.
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Every poster deserves a link. Every event deserves to be found.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/upload">
                <Button
                  size="lg"
                  className="group h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  Upload a poster
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Browse events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
}
