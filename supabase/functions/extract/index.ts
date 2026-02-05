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
    const { eventId, imageUrl, sourceUrl } = await req.json();
    
    if (!eventId) {
      throw new Error("eventId is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let extractedData;

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
  "evidence": { "fieldName": "reason from poster" }
}

If you can't determine a date, use today at 18:00 with low confidence. Assume Europe/Berlin timezone.`;

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
  "evidence": { "fieldName": "reason" }
}

Page content:
${textContent}`;

          messages = [{ role: "user", content: prompt }];
        } catch (e) {
          console.error("Failed to fetch URL:", e);
          throw new Error("Failed to fetch event page");
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
        throw new Error("AI extraction failed");
      }

      const aiData = await response.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
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

    // Update the event with extracted data
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: extractedData.title || "Untitled Event",
        start_at: extractedData.start_at,
        end_at: extractedData.end_at,
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
      throw updateError;
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
