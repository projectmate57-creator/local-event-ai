import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL validation to prevent SSRF attacks
function validateUrl(urlString: string): URL {
  let url: URL;
  
  try {
    url = new URL(urlString);
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  
  // Only allow http/https
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }
  
  // Block private IP ranges and dangerous hosts
  const hostname = url.hostname.toLowerCase();
  
  const blockedPatterns = [
    /^localhost$/i,
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    /^0\.0\.0\.0$/,
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,  // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,  // 172.16.0.0/12
    /^192\.168\.\d{1,3}\.\d{1,3}$/,  // 192.168.0.0/16
    /^169\.254\.\d{1,3}\.\d{1,3}$/,  // Link-local / AWS metadata
    /^\[?::1\]?$/,  // IPv6 localhost
    /^\[?fe80:/i,  // IPv6 link-local
    /metadata\.google\.internal/i,  // GCP metadata
  ];
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(hostname)) {
      throw new Error('Access to this hostname is not allowed');
    }
  }
  
  // Block internal domains
  if (hostname.endsWith('.internal') || hostname.endsWith('.local')) {
    throw new Error('Internal domains are not allowed');
  }
  
  return url;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("Extract called without authentication");
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user-scoped client to verify auth and ownership
    const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      console.log("Extract called with invalid authentication:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { eventId, imageUrl, sourceUrl } = await req.json();
    
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns the event (using user-scoped client respects RLS)
    const { data: event, error: eventError } = await userSupabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .maybeSingle();
      
    if (eventError) {
      console.error("Error fetching event:", eventError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify event ownership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!event) {
      console.log(`Event ${eventId} not found or user ${user.id} does not have access`);
      return new Response(
        JSON.stringify({ error: 'Event not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (event.owner_id !== user.id) {
      console.log(`User ${user.id} attempted to extract for event owned by ${event.owner_id}`);
      return new Response(
        JSON.stringify({ error: 'You do not have permission to modify this event' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} extracting data for event ${eventId}`);

    // Use service role for database update operations after ownership is verified
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
  "evidence": { "fieldName": "exact text from poster that supports this field" },
  "age_restriction": "all_ages" | "16+" | "18+" | "21+",
  "content_flags": ["nightclub", "alcohol", "adult", "cannabis", "gambling", "tobacco"] or [],
  "moderation_warning": "string if illegal/harmful content detected, otherwise null"
}

AGE RESTRICTION RULES:
- Look for explicit age requirements on the poster ("18+", "21+", "Adults Only", "Ab 18", "FSK 18")
- Nightclubs, bars, and late-night venues typically require 18+
- Events featuring alcohol prominently should be marked 18+ (or 21+ in US context)
- Adult entertainment, strip clubs, cannabis events should be 18+ or 21+
- Family events, community gatherings, daytime markets are typically "all_ages"
- If unsure, default to "all_ages" but add relevant content_flags

CONTENT FLAGS:
- "nightclub": Late-night dance venue, club
- "alcohol": Prominent alcohol branding, bar events, wine tastings
- "adult": Adult entertainment, explicit content
- "cannabis": Cannabis-related events
- "gambling": Casino, poker events
- "tobacco": Hookah bars, cigar events

MODERATION WARNING:
- Set moderation_warning if you detect potentially illegal activity (drug sales, illegal gambling, violence promotion)
- Set moderation_warning if content appears to violate platform guidelines (extreme content, hate speech)
- Otherwise set to null

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
        // Validate URL before fetching (SSRF protection)
        let validatedUrl: URL;
        try {
          validatedUrl = validateUrl(sourceUrl);
        } catch (e) {
          console.error("Invalid sourceUrl:", sourceUrl, e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : 'Invalid URL' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For URL extraction, fetch the page with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const pageResponse = await fetch(validatedUrl.toString(), {
            signal: controller.signal,
            headers: { 'User-Agent': 'TinyTinyEvents/1.0' },
          });
          
          clearTimeout(timeoutId);

          if (!pageResponse.ok) {
            throw new Error(`Failed to fetch URL: ${pageResponse.status}`);
          }

          // Check response size
          const contentLength = pageResponse.headers.get('content-length');
          if (contentLength && parseInt(contentLength) > 5242880) { // 5MB limit
            throw new Error('Response too large');
          }

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
  "evidence": { "fieldName": "exact text that supports this field" },
  "age_restriction": "all_ages" | "16+" | "18+" | "21+",
  "content_flags": ["nightclub", "alcohol", "adult", "cannabis", "gambling", "tobacco"] or [],
  "moderation_warning": "string if illegal/harmful content detected, otherwise null"
}

AGE RESTRICTION: Look for explicit age limits. Nightclubs/bars = 18+. Adult content = 18+/21+. Default to "all_ages".
CONTENT FLAGS: Add relevant flags for nightclub, alcohol, adult, cannabis, gambling, tobacco content.
MODERATION WARNING: Set if illegal activity or policy violations detected, otherwise null.

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
        age_restriction: "all_ages",
        content_flags: [],
        moderation_warning: null,
      };
    }

    // Validate dates but DON'T auto-change them - let user verify
    let startAt = extractedData.start_at;
    let endAt = extractedData.end_at;
    
    // Ensure dates are valid ISO strings
    try {
      if (startAt) {
        const startDate = new Date(startAt);
        if (isNaN(startDate.getTime())) {
          // Invalid date, use fallback
          startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          extractedData.confidence = { ...extractedData.confidence, start_at: 0.2, overall: 0.3 };
          extractedData.evidence = { ...extractedData.evidence, start_at: "Could not parse date - please verify" };
        } else {
          // Check if date is in the past - WARN but don't auto-change
          const isPastEvent = startDate < new Date();
          const yearOnPoster = startDate.getFullYear();
          
          if (isPastEvent) {
            // Lower confidence and add warning, but keep original extracted date
            extractedData.confidence = { 
              ...extractedData.confidence, 
              start_at: 0.4,
              overall: Math.min(extractedData.confidence?.overall || 1, 0.6)
            };
            extractedData.evidence = { 
              ...extractedData.evidence, 
              start_at: `${extractedData.evidence?.start_at || ''} ⚠️ DATE APPEARS TO BE IN THE PAST (${yearOnPoster}) - please verify the year` 
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
      extractedData.confidence = { ...extractedData.confidence, start_at: 0.2, overall: 0.3 };
      extractedData.evidence = { ...extractedData.evidence, start_at: "Date parsing failed - please set manually" };
    }

    // Determine moderation status based on warning
    const moderationStatus = extractedData.moderation_warning ? "pending" : "approved";

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
        age_restriction: extractedData.age_restriction || "all_ages",
        content_flags: extractedData.content_flags || [],
        moderation_status: moderationStatus,
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully extracted data for event ${eventId}`);

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
