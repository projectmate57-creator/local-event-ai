import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarHeart,
  Upload,
  Eye,
  Sparkles,
  CheckCircle,
  Link2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Search,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PitchSection, SectionTitle } from "@/components/pitch/PitchSection";
import { PosterAnimation } from "@/components/pitch/PosterAnimation";
import { ScopeGrid } from "@/components/pitch/ScopeGrid";
import { ProblemCard } from "@/components/pitch/ProblemCard";

const problems = [
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Posters disappear fast",
    description: "Physical posters get torn, covered, or removed within days. The event info dies with them.",
  },
  {
    icon: <Link2 className="h-5 w-5" />,
    title: "No link, no discovery",
    description: "Without a URL, there's no way to share, search, or add to calendar.",
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: "Fragmented information",
    description: "People miss events because details are scattered across walls, not screens.",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Berlin's hidden gems",
    description: "Street, cafe, and campus posters rarely have an online presence. They deserve one.",
  },
];

const workflowSteps = [
  { icon: <Upload className="h-5 w-5" />, label: "Image stored" },
  { icon: <Sparkles className="h-5 w-5" />, label: "AI extracts fields" },
  { icon: <Eye className="h-5 w-5" />, label: "User verifies" },
  { icon: <CheckCircle className="h-5 w-5" />, label: "Publish event" },
];

const communityBenefits = [
  "Makes small local events discoverable",
  "Helps creators reach the right people without big platforms",
  "Helps residents find what's happening nearby",
  "Creates a living map of local culture and meetups",
];

export default function PitchPage() {
  return (
    <Layout>
      {/* Hero / Introduction */}
      <PitchSection className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
          >
            <CalendarHeart className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">TinyTinyEvents</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Share the tiny moments{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              nearby
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground md:text-xl"
          >
            Tiny local events deserve to be found. We turn street posters into shareable event pages.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload a poster
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="gap-2">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <PosterAnimation />
      </PitchSection>

      {/* Idea */}
      <PitchSection alternate>
        <SectionTitle subtitle="The core concept in one sentence">
          💡 The Idea
        </SectionTitle>

        <Card className="mx-auto max-w-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6 text-center md:p-8">
            <p className="text-lg font-medium text-foreground md:text-xl">
              Upload a poster → Extract details → Verify → Publish a shareable event page
            </p>
            <p className="mt-4 text-muted-foreground">
              We don't auto-publish without verification. You're always in control.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12">
          <PosterAnimation />
        </div>
      </PitchSection>

      {/* Problem Statement */}
      <PitchSection>
        <SectionTitle subtitle="Why this matters">
          ⚠️ The Problem
        </SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, i) => (
            <ProblemCard key={problem.title} {...problem} index={i} />
          ))}
        </div>
      </PitchSection>

      {/* Solution */}
      <PitchSection alternate>
        <SectionTitle subtitle="How we solve it">
          ✨ The Solution
        </SectionTitle>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-foreground">Our Workflow</h3>
            <div className="space-y-4">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <span className="font-medium text-foreground">{step.label}</span>
                  {i < workflowSteps.length - 1 && (
                    <div className="ml-auto hidden h-0.5 w-8 bg-primary/20 md:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Tech Stack</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Storage</Badge>
                  Images stored in Lovable Cloud
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">AI</Badge>
                  Gemini Flash via Lovable AI Gateway
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Trust</Badge>
                  Confidence scoring + evidence reasoning
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Output</Badge>
                  Clean event page + Add-to-calendar
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            We never auto-publish. Users verify and approve every event before it goes live.
          </p>
        </motion.div>
      </PitchSection>

      {/* Community */}
      <PitchSection>
        <SectionTitle subtitle="From community, to community">
          ❤️ How It Helps
        </SectionTitle>

        <div className="grid gap-8 md:grid-cols-2">
          <ul className="space-y-4">
            {communityBenefits.map((benefit, i) => (
              <motion.li
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-foreground">{benefit}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
                <blockquote className="text-xl font-medium italic text-foreground">
                  "Seen on the street.
                  <br />
                  Shared with everyone."
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PitchSection>

      {/* Feature Scope */}
      <PitchSection alternate>
        <SectionTitle subtitle="What's built and what's next">
          🛠️ Feature Scope
        </SectionTitle>

        <ScopeGrid />
      </PitchSection>

      {/* CTA */}
      <PitchSection className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Ready to try it?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your first poster and see the magic happen.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload a poster
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="gap-2">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Separator className="my-12" />

          <p className="text-sm text-muted-foreground">
            Built with ❤️ for local communities •{" "}
            <a
              href="https://tinytinyevents.com"
              className="text-primary hover:underline"
            >
              tinytinyevents.com
            </a>
          </p>
        </motion.div>
      </PitchSection>
    </Layout>
  );
}
