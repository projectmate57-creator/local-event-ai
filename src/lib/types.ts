import { z } from "zod";

// Age restriction types
export type AgeRestriction = "all_ages" | "16+" | "18+" | "21+";
export type ModerationStatus = "pending" | "approved" | "rejected";

export const AGE_RESTRICTIONS: { value: AgeRestriction; label: string }[] = [
  { value: "all_ages", label: "All Ages" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
];

export const CONTENT_FLAG_LABELS: Record<string, string> = {
  nightclub: "Nightclub",
  alcohol: "Alcohol",
  adult: "Adult Content",
  cannabis: "Cannabis",
  gambling: "Gambling",
  tobacco: "Tobacco",
};

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
  // Age and content moderation fields
  age_restriction: z.enum(["all_ages", "16+", "18+", "21+"]).default("all_ages"),
  content_flags: z.array(z.string()).nullable(),
  moderation_warning: z.string().nullable(),
});

export type EventExtraction = z.infer<typeof eventExtractionSchema>;

// Database event type (full, for owners only)
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
  // Age and moderation fields
  age_restriction: AgeRestriction;
  content_flags: string[] | null;
  moderation_status: ModerationStatus;
  moderation_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Public event type (excludes sensitive fields: owner_id, source_url, confidence, evidence, poster_path, moderation details)
export interface PublicEvent {
  id: string;
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
  poster_public_url: string | null;
  age_restriction: AgeRestriction;
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
