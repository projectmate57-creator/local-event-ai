import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch published events
    const now = new Date().toISOString();
    const { data: events } = await supabase
      .from("events")
      .select("id, title, slug, city, start_at, venue, tags")
      .eq("status", "published")
      .gte("start_at", now)
      .order("start_at", { ascending: true })
      .limit(50);

    const eventList = events?.map(e => 
      `- ${e.title} in ${e.city}${e.venue ? ` at ${e.venue}` : ""} on ${new Date(e.start_at).toLocaleDateString()} (slug: ${e.slug || e.id})`
    ).join("\n") || "No upcoming events found.";

    let responseContent = "";

    if (LOVABLE_API_KEY) {
      const systemPrompt = `You are a friendly event discovery assistant for TinyTinyEvents. Help users find local events.

Available upcoming events:
${eventList}

When users ask about events, search through the list and recommend matching ones. Format your response with:
1. A friendly intro
2. 3-8 matching events as a list with title, date, city, and a link like [Event Title](/events/slug)
3. If no exact matches, suggest the closest alternatives

Keep responses concise and helpful.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        responseContent = data.choices?.[0]?.message?.content || "";
      }
    }

    if (!responseContent) {
      // Fallback: simple keyword matching
      const query = lastMessage.toLowerCase();
      const matching = events?.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.tags?.some((t: string) => t.toLowerCase().includes(query))
      ).slice(0, 5);

      if (matching && matching.length > 0) {
        responseContent = `Here are some events I found:\n\n${matching.map(e => 
          `**${e.title}**\n📍 ${e.city} • 📅 ${new Date(e.start_at).toLocaleDateString()}\n[View Event](/events/${e.slug || e.id})`
        ).join("\n\n")}`;
      } else {
        responseContent = "I couldn't find events matching your search. Try browsing all events or use different keywords!";
      }
    }

    return new Response(JSON.stringify({ content: responseContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ content: "Sorry, I had trouble searching. Please try again!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
