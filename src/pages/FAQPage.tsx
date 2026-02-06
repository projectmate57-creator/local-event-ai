import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "What is TinyTinyEvents?",
    answer:
      "TinyTinyEvents is a community platform that helps people discover local events. Users can photograph publicly displayed event posters and share them on our platform. Our AI automatically extracts event details to create beautiful, shareable event pages.",
  },
  {
    question: "How do I add an event?",
    answer:
      "Simply take a photo of an event poster you see in public (on a bulletin board, shop window, street pole, etc.) and upload it to our platform. Our AI will extract the event details automatically. You can then review and publish the event.",
  },
  {
    question: "Is TinyTinyEvents free to use?",
    answer:
      "Yes! Browsing and discovering events is completely free. Creating an account and uploading event posters is also free.",
  },
  {
    question: "Do you sell tickets?",
    answer:
      "No, TinyTinyEvents does not sell tickets. We help people discover events and may link to official ticket pages when available. Any ticket purchases are made directly with the event organizer or their ticketing platform.",
  },
  {
    question: "How accurate is the AI extraction?",
    answer:
      "Our AI is quite good at reading posters, but it's not perfect. Each extracted detail shows a confidence score so you know how reliable it is. We always recommend reviewing the extracted information before publishing.",
  },
  {
    question: "Can I edit event details after uploading?",
    answer:
      "Yes! After the AI extracts information from your poster, you can review and edit all details before publishing. You can also edit your published events from your dashboard.",
  },
  {
    question: "What are age-restricted events?",
    answer:
      "Some events are marked as 18+ or 21+ because they take place at venues like nightclubs, bars, or involve adult content. Our AI automatically detects these restrictions from poster content, venue type, and explicit age requirements. You'll see a badge on these events, and you'll need to confirm your age before viewing details.",
  },
  {
    question: "How does age verification work?",
    answer:
      "When you try to view an 18+ or 21+ event, you'll be asked to confirm that you meet the age requirement. This is stored in your browser session only (it clears when you close the browser). We don't collect or store any personal identification - this is simply an acknowledgment that you meet the age requirement, similar to age gates on other websites.",
  },
  {
    question: "What happens if my event is flagged for review?",
    answer:
      "If our AI detects potentially problematic content, your event will be held for manual review before it can be published. You'll see a message explaining this on your draft page. Our moderation team will review the content and either approve it for publishing or provide feedback if changes are needed.",
  },
  {
    question: "I'm an event organizer. Can I remove my event?",
    answer:
      "Absolutely. If you'd like your event removed from our platform, please contact us through our contact form and we'll remove it promptly. We respect organizers' wishes regarding how their events are promoted.",
  },
  {
    question: "What types of events can I post?",
    answer:
      "Any public event! Concerts, festivals, art exhibitions, community gatherings, sports events, workshops, markets, and more. The only requirement is that the event is publicly advertised (e.g., on a poster in a public space). Events promoting illegal activity will be rejected.",
  },
  {
    question: "How do I report a fake or scam event?",
    answer:
      "If you spot a suspicious event, please report it immediately through our contact form. Select 'Report an Event' as the category. We take reports seriously and will investigate promptly.",
  },
  {
    question: "Can I share events on social media?",
    answer:
      "Yes! Each event page has share buttons for popular platforms. You can also copy the direct link to share anywhere you like.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can request account deletion through our contact form. Select 'Account / Data Deletion Request' as the category. Your data will be removed within 30 days as per our privacy policy.",
  },
  {
    question: "What cities do you cover?",
    answer:
      "TinyTinyEvents is community-driven, so we cover wherever our users are! Currently we have events primarily in Berlin, but we're growing. Upload posters from your city to help build the local community.",
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
            </motion.div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about TinyTinyEvents
            </p>
          </div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border border-border bg-card px-4 data-[state=open]:bg-accent/50"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 rounded-2xl border border-border bg-card p-8 text-center"
          >
            <h2 className="mb-2 text-xl font-semibold">Still have questions?</h2>
            <p className="mb-4 text-muted-foreground">
              Can't find what you're looking for? We're here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </Layout>
  );
}
