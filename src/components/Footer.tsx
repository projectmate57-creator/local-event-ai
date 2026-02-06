import { Link } from "react-router-dom";
import { CalendarHeart, Linkedin, Twitter, Github } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 bg-foreground/[0.02]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <CalendarHeart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">TinyTinyEvents</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Turn event posters into beautiful, shareable event pages with AI.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/events" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Browse Events
              </Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                How It Works
              </Link>
              <Link to="/upload" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Upload Poster
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Contact Us
              </Link>
            </nav>
          </div>
          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-background text-muted-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-background text-muted-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-background text-muted-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TinyTinyEvents. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
