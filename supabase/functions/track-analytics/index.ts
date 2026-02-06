import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiting (resets on cold start, but provides basic protection)
const recentTracking = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 300000; // 5 minutes

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { event_id, type } = await req.json();

    // Validate input
    if (!event_id || typeof event_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid event_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!type || !["view", "ticket_click"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}-${event_id}-${type}`;
    const now = Date.now();
    const lastTracked = recentTracking.get(key) || 0;

    // Block duplicate tracking within the rate limit window
    if (now - lastTracked < RATE_LIMIT_WINDOW_MS) {
      console.log(`Rate limited: ${key}`);
      return new Response(
        JSON.stringify({ success: true, message: "Already tracked recently" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to insert (bypasses RLS that blocks direct inserts)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (event.status !== "published") {
      return new Response(
        JSON.stringify({ error: "Event not published" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert analytics record
    const { error: insertError } = await supabase
      .from("event_analytics")
      .insert({ event_id, type });

    if (insertError) {
      console.error("Failed to insert analytics:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to track" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update rate limit tracking
    recentTracking.set(key, now);

    // Cleanup old entries periodically (every ~100 requests)
    if (Math.random() < 0.01) {
      const cutoff = now - RATE_LIMIT_WINDOW_MS;
      for (const [k, timestamp] of recentTracking.entries()) {
        if (timestamp < cutoff) {
          recentTracking.delete(k);
        }
      }
    }

    console.log(`Analytics tracked: ${type} for event ${event_id}`);
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Track analytics error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
