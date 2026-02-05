import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const { eventId, imageUrl, sourceUrl } = await req.json();
    
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let extractedData;

    const currentYear = new Date().getFullYear();
    
    if (LOVABLE_API_KEY && (imageUrl || sourceUrl)) {
      // Use AI for extraction
      let prompt = "";
      let messages: any[] = [];

      if (imageUrl) {
        prompt = `Extract event details from this poster image. Return ONLY valid JSON matching this schema:
{
  "title": "event title",
  "start_at": "ISO datetime string",
  "end_at": "ISO datetime string or null",
  "timezone": "Europe/Berlin",
  "city": "city name",
  "venue": "venue name or null",
  "address": "full address or null",
  "description": "event description or null",
  "ticket_url": "ticket URL or null",
  "tags": ["tag1", "tag2"] or null,
  "confidence": {
    "overall": 0.0-1.0,
    "title": 0.0-1.0,
    "start_at": 0.0-1.0,
    "city": 0.0-1.0,
    "venue": 0.0-1.0,
    "ticket_url": 0.0-1.0,
    "description": 0.0-1.0
  },
  "evidence": { "fieldName": "exact text from poster that supports this field" }
}

IMPORTANT DATE RULES:
- The current year is ${currentYear}. If no year is visible on the poster, assume ${currentYear}.
- If the date appears to be in the past for ${currentYear}, check if it makes sense for ${currentYear + 1} (recurring event).
- If you can't determine a date at all, use a date 7 days from now with low confidence (0.3).
- Always use Europe/Berlin timezone unless another timezone is clearly indicated.
- Set start_at confidence to 0.5 if you had to assume the year.`;

        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ];
      } else if (sourceUrl) {
        // For URL extraction, fetch the page first
        try {
          const pageResponse = await fetch(sourceUrl);
          const html = await pageResponse.text();
          const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 4000);
          
          prompt = `Extract event details from this webpage content. Return ONLY valid JSON matching this schema:
{
  "title": "event title",
  "start_at": "ISO datetime string",
  "end_at": "ISO datetime string or null",
  "timezone": "Europe/Berlin",
  "city": "city name",
  "venue": "venue name or null",
  "address": "full address or null",
  "description": "event description or null",
  "ticket_url": "ticket URL or null",
  "tags": ["tag1", "tag2"] or null,
  "confidence": {
    "overall": 0.0-1.0,
    "title": 0.0-1.0,
    "start_at": 0.0-1.0,
    "city": 0.0-1.0
  },
  "evidence": { "fieldName": "exact text that supports this field" }
}

IMPORTANT: The current year is ${currentYear}. If no year is found, assume ${currentYear}.

Page content:
${textContent}`;

          messages = [{ role: "user", content: prompt }];
        } catch (e) {
          console.error("Failed to fetch URL:", e);
          return new Response(
            JSON.stringify({ error: "Failed to fetch event page" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI Gateway error:", response.status, errText);
        // Fall back to mock data instead of throwing
      } else {
        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        }
      }
    }

    // Use mock data if AI extraction failed or no API key
    if (!extractedData) {
      console.log("Using mock extraction data");
      extractedData = {
        title: "Sample Event",
        start_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_at: null,
        timezone: "Europe/Berlin",
        city: "Berlin",
        venue: null,
        address: null,
        description: "Event details extracted from poster. Please verify and edit.",
        ticket_url: null,
        tags: null,
        confidence: {
          overall: 0.3,
          title: 0.3,
          start_at: 0.3,
          city: 0.3,
        },
        evidence: {
          title: "Placeholder - please update",
          city: "Default city - please verify",
        },
      };
    }

    // Validate and fix dates
    let startAt = extractedData.start_at;
    let endAt = extractedData.end_at;
    
    // Ensure dates are valid ISO strings
    try {
      if (startAt) {
        const startDate = new Date(startAt);
        if (isNaN(startDate.getTime())) {
          // Invalid date, use fallback
          startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          extractedData.confidence = { ...extractedData.confidence, start_at: 0.2 };
          extractedData.evidence = { ...extractedData.evidence, start_at: "Could not parse date - please verify" };
        } else {
          // Check if year is missing (date is far in the past)
          const yearDiff = currentYear - startDate.getFullYear();
          if (yearDiff > 1) {
            // Likely missing year, adjust to current or next year
            startDate.setFullYear(currentYear);
            // If the date is now in the past, try next year
            if (startDate < new Date()) {
              startDate.setFullYear(currentYear + 1);
            }
            startAt = startDate.toISOString();
            extractedData.confidence = { ...extractedData.confidence, start_at: 0.5 };
            extractedData.evidence = { 
              ...extractedData.evidence, 
              start_at: `${extractedData.evidence?.start_at || ''} (year assumed as ${startDate.getFullYear()})` 
            };
          }
        }
      }
      
      if (endAt) {
        const endDate = new Date(endAt);
        if (isNaN(endDate.getTime())) {
          endAt = null;
        }
      }
    } catch (e) {
      console.error("Date parsing error:", e);
      startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Update the event with extracted data
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: extractedData.title || "Untitled Event",
        start_at: startAt,
        end_at: endAt,
        timezone: extractedData.timezone || "Europe/Berlin",
        city: extractedData.city || "",
        venue: extractedData.venue,
        address: extractedData.address,
        description: extractedData.description,
        ticket_url: extractedData.ticket_url,
        tags: extractedData.tags,
        confidence_overall: extractedData.confidence?.overall,
        confidence_json: extractedData.confidence,
        evidence_json: extractedData.evidence,
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Extraction failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
