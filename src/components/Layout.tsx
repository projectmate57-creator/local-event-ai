import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <CalendarHeart className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TinyTinyEvents</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="transition-all duration-200">
                Home
              </Button>
            </Link>
            <Link to="/events">
              <Button
                variant={location.pathname.startsWith("/events") ? "secondary" : "ghost"}
                size="sm"
                className="transition-all duration-200"
              >
                Events
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant={location.pathname === "/how-it-works" ? "secondary" : "ghost"}
                size="sm"
                className="transition-all duration-200"
              >
                How it works
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                variant={location.pathname === "/contact" ? "secondary" : "ghost"}
                size="sm"
                className="transition-all duration-200"
              >
                Contact
              </Button>
            </Link>

            <div className="mx-2 h-6 w-px bg-border" />

            <ThemeToggle />

            <Link to="/upload">
              <Button size="sm" className="shadow-sm transition-all duration-200 hover:shadow-md">
                <Plus className="mr-1.5 h-4 w-4" />
                Upload
              </Button>
            </Link>
          </nav>
        </div>
      </motion.header>

      <main>{children}</main>
    </div>
  );
}

