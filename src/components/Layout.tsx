import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarHeart, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events", matchPrefix: true },
    { path: "/how-it-works", label: "How it works" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string, matchPrefix?: boolean) => {
    if (matchPrefix) return location.pathname.startsWith(path);
    return location.pathname === path;
  };

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

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive(link.path, link.matchPrefix) ? "secondary" : "ghost"}
                    size="sm"
                    className="transition-all duration-200"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}

              <div className="mx-2 h-6 w-px bg-border" />

              <ThemeToggle />

              <Link to="/upload">
                <Button size="sm" className="shadow-sm transition-all duration-200 hover:shadow-md">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Upload
                </Button>
              </Link>
            </nav>
          )}

          {/* Mobile Navigation Toggle */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/50 bg-background"
            >
              <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(link.path, link.matchPrefix) ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start transition-all duration-200"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <div className="my-2 h-px w-full bg-border" />

                <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full shadow-sm">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Upload Event
                  </Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <main>{children}</main>
    </div>
  );
}

