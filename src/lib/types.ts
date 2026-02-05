import { z } from "zod";

// Event extraction schema from AI
export const eventExtractionSchema = z.object({
  title: z.string(),
  start_at: z.string(), // ISO datetime string
  end_at: z.string().nullable(),
  timezone: z.string().default("Europe/Berlin"),
  city: z.string(),
  venue: z.string().nullable(),
  address: z.string().nullable(),
  description: z.string().nullable(),
  ticket_url: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  confidence: z.object({
    overall: z.number().min(0).max(1),
    title: z.number().min(0).max(1),
    start_at: z.number().min(0).max(1),
    city: z.number().min(0).max(1),
    venue: z.number().min(0).max(1).optional(),
    ticket_url: z.number().min(0).max(1).optional(),
    description: z.number().min(0).max(1).optional(),
  }),
  evidence: z.record(z.string()).optional(),
});

export type EventExtraction = z.infer<typeof eventExtractionSchema>;

// Database event type
export interface Event {
  id: string;
  owner_id: string;
  status: "draft" | "published";
  slug: string | null;
  title: string;
  start_at: string;
  end_at: string | null;
  timezone: string;
  city: string;
  venue: string | null;
  address: string | null;
  description: string | null;
  ticket_url: string | null;
  tags: string[] | null;
  poster_path: string | null;
  poster_public_url: string | null;
  source_url: string | null;
  confidence_overall: number | null;
  confidence_json: Record<string, number> | null;
  evidence_json: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface EventAnalytics {
  id: string;
  event_id: string;
  type: "view" | "ticket_click";
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_clicks: number;
  top_events: {
    id: string;
    title: string;
    views: number;
  }[];
}

// Chat message type
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Search filters
export interface EventFilters {
  search?: string;
  city?: string;
  dateRange?: "today" | "week" | "month" | "all";
  tags?: string[];
  sortBy?: "soonest" | "newest";
}
