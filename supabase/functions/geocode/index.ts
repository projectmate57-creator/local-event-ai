import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Geocode using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeAddress(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "TinyTinyEvents/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Delay to respect Nominatim's 1 req/sec policy
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "backfill"; // "backfill" or "single"
    const eventId = body.eventId;

    let eventsToGeocode: any[] = [];

    if (mode === "single" && eventId) {
      const { data } = await supabase
        .from("events")
        .select("id, city, venue, address")
        .eq("id", eventId)
        .maybeSingle();
      if (data) eventsToGeocode = [data];
    } else {
      // Backfill: find published events missing coordinates
      const { data } = await supabase
        .from("events")
        .select("id, city, venue, address")
        .eq("status", "published")
        .eq("moderation_status", "approved")
        .is("latitude", null)
        .limit(50);
      eventsToGeocode = data || [];
    }

    console.log(`Geocoding ${eventsToGeocode.length} events`);
    const results: { id: string; status: string; query?: string }[] = [];

    for (const event of eventsToGeocode) {
      // Build query: address > venue+city > city
      let query = "";
      if (event.address && event.address.trim()) {
        query = event.address.includes(event.city)
          ? event.address
          : `${event.address}, ${event.city}`;
      } else if (event.venue && event.venue.trim() && event.venue.toLowerCase() !== "secret location") {
        query = `${event.venue}, ${event.city}`;
      } else {
        query = event.city;
      }

      const coords = await geocodeAddress(query);

      if (coords) {
        await supabase
          .from("events")
          .update({ latitude: coords.lat, longitude: coords.lon })
          .eq("id", event.id);
        results.push({ id: event.id, status: "geocoded", query });
        console.log(`✓ ${event.id}: ${query} → ${coords.lat},${coords.lon}`);
      } else {
        // Fallback to just city name
        if (query !== event.city) {
          const cityCoords = await geocodeAddress(event.city);
          await delay(1100);
          if (cityCoords) {
            await supabase
              .from("events")
              .update({ latitude: cityCoords.lat, longitude: cityCoords.lon })
              .eq("id", event.id);
            results.push({ id: event.id, status: "city-fallback", query: event.city });
            console.log(`~ ${event.id}: city fallback ${event.city} → ${cityCoords.lat},${cityCoords.lon}`);
          } else {
            results.push({ id: event.id, status: "failed", query });
            console.log(`✗ ${event.id}: no result for ${query}`);
          }
        } else {
          results.push({ id: event.id, status: "failed", query });
          console.log(`✗ ${event.id}: no result for ${query}`);
        }
      }

      // Respect rate limit
      await delay(1100);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geocode error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Geocoding failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
