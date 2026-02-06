import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const FORMSPREE_URL = "https://formspree.io/f/xeeljbjk";

const CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "deletion", label: "Account / Data Deletion Request" },
  { value: "copyright", label: "Copyright / Content Removal" },
  { value: "report", label: "Report an Event" },
  { value: "feedback", label: "Feedback / Suggestions" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          category: CATEGORIES.find(c => c.value === formData.category)?.label || formData.category,
          message: formData.message,
        }),
      });

      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({ name: "", email: "", category: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Get in Touch
            </motion.div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Contact Us
            </h1>
            <p className="text-muted-foreground">
              Questions, feedback, or need to remove content? We're here to help.
            </p>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  maxLength={255}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
                  What's this about?
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  required
                  maxLength={2000}
                  className="resize-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </Layout>
  );
}
