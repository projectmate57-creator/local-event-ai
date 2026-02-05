import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarHeart, Plus, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

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

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
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

              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link to="/upload">
                        <Button size="sm" className="shadow-sm transition-all duration-200 hover:shadow-md">
                          <Plus className="mr-1.5 h-4 w-4" />
                          Upload
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-1">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(user.email || "U")}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                            {user.email}
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <Link to="/signin">
                      <Button size="sm" variant="outline">
                        <User className="mr-1.5 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </>
              )}
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

                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <LayoutDashboard className="mr-1.5 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Upload Event
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive"
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-1.5 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="mr-1.5 h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <main>{children}</main>
    </div>
  );
}
