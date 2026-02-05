import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarHeart, Plus, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleUploadClick = () => {
    if (!user) {
      navigate("/signin");
    } else {
      navigate("/upload");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <CalendarHeart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">TinyTinyEvents</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link to="/events">
              <Button
                variant={location.pathname.startsWith("/events") ? "secondary" : "ghost"}
                size="sm"
              >
                Events
              </Button>
            </Link>
            
            {user && (
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
                  size="sm"
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}

            <div className="mx-2 h-6 w-px bg-border" />

            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleUploadClick} size="sm" className="gradient-bg">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="h-9 w-9"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/signin">
                      <Button variant="ghost" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Button onClick={handleUploadClick} size="sm" className="gradient-bg">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      </motion.header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
