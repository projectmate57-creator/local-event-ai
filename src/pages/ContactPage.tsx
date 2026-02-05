import { motion } from "framer-motion";
import { Mail, Linkedin, Twitter, Github, MapPin, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/tinytinyevents",
      icon: Linkedin,
      color: "hover:text-[#0A66C2]",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/tinytinyevents",
      icon: Twitter,
      color: "hover:text-[#1DA1F2]",
    },
    {
      name: "GitHub",
      href: "https://github.com/tinytinyevents",
      icon: Github,
      color: "hover:text-foreground",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Get in Touch
            </motion.div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions, feedback, or want to collaborate? We'd love to hear from you!
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
            >
              <h2 className="mb-6 text-xl font-semibold">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    required
                    className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Email */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Email Us</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  For general inquiries and support
                </p>
                <a
                  href="mailto:hello@tinytinyevents.com"
                  className="font-medium text-primary transition-colors hover:underline"
                >
                  hello@tinytinyevents.com
                </a>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Based In</h3>
                <p className="text-muted-foreground">
                  Berlin, Germany 🇩🇪
                </p>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-semibold">Connect With Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:shadow-md ${social.color}`}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Follow us for updates on new features and local events!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
