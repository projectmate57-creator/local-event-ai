import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI screening is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrl, imageBase64 } = await req.json();

    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageUrl or imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageContent = imageUrl
      ? { type: "image_url" as const, image_url: { url: imageUrl } }
      : { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${imageBase64}` } };

    // Step 1: AI Content Screening
    console.log("Starting AI content screening...");
    const screeningResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for content screening. Return ONLY valid JSON:
{
  "is_poster": true/false,
  "poster_score": 1-10,
  "safety": "safe" | "unsafe" | "unclear",
  "reason": "brief explanation"
}

RULES:
- is_poster: Is this an event poster, flyer, announcement, or promotional material for an event? Score 1-10.
  - Score 7-10: Clearly an event poster/flyer
  - Score 4-6: Could be a poster but unclear (e.g. photo of a venue, partial poster)
  - Score 1-3: Not a poster (selfie, random photo, meme, screenshot, etc.)
- safety: 
  - "safe": Normal event content
  - "unsafe": Contains illegal activity promotion, extreme violence, hate speech, explicit sexual content, drug sales
  - "unclear": Borderline content that needs human review (e.g. adult entertainment venue, cannabis event in unclear jurisdiction)
- reason: One sentence explaining your assessment`
              },
              imageContent
            ]
          }
        ],
      }),
    });

    if (!screeningResponse.ok) {
      if (screeningResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (screeningResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await screeningResponse.text();
      console.error("AI screening error:", screeningResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Content screening failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const screeningData = await screeningResponse.json();
    const screeningContent = screeningData.choices?.[0]?.message?.content || "";
    console.log("Screening result:", screeningContent);

    let screening: { is_poster: boolean; poster_score: number; safety: string; reason: string };
    try {
      const jsonMatch = screeningContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      screening = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse screening result:", e);
      // Default to requiring review if we can't parse
      screening = { is_poster: true, poster_score: 5, safety: "unclear", reason: "Could not determine content type" };
    }

    // Step 2: Decision based on screening
    if (screening.poster_score < 4) {
      return new Response(
        JSON.stringify({
          status: "rejected",
          reason: "This doesn't appear to be an event poster. Please upload a photo of an event poster or flyer.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (screening.safety === "unsafe") {
      return new Response(
        JSON.stringify({
          status: "rejected",
          reason: "This content can't be posted as it appears to violate our content guidelines.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine moderation status
    const moderationStatus = (screening.safety === "unclear" || (screening.poster_score >= 4 && screening.poster_score <= 6))
      ? "pending"
      : "approved";

    // Step 3: Create event with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upload image to storage if it's base64
    let posterPublicUrl = imageUrl || "";
    let posterPath: string | null = null;

    if (imageBase64) {
      const fileName = `anonymous/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
      const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
      
      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(fileName, imageBuffer, { contentType: "image/jpeg" });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to store image" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: urlData } = supabase.storage.from("posters").getPublicUrl(fileName);
      posterPublicUrl = urlData.publicUrl;
      posterPath = fileName;
    }

    // Create event row (owner_id = null for anonymous)
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        owner_id: null,
        status: "draft",
        title: "Untitled Event",
        start_at: new Date().toISOString(),
        city: "",
        poster_path: posterPath,
        poster_public_url: posterPublicUrl,
        moderation_status: moderationStatus,
        moderation_notes: moderationStatus === "pending" ? `AI screening: ${screening.reason}` : null,
      })
      .select("id, edit_token")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Created anonymous event ${event.id} with moderation_status=${moderationStatus}`);

    // Notify admins if event is pending moderation (fire and forget)
    if (moderationStatus === "pending") {
      try {
        const notifyUrl = `${SUPABASE_URL}/functions/v1/notify-admin-moderation`;
        fetch(notifyUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: event.id,
            eventTitle: "Untitled Event",
            moderationReason: screening.reason,
          }),
        }).catch(err => console.error("Admin notification failed (non-fatal):", err));
      } catch (e) {
        console.error("Admin notification error (non-fatal):", e);
      }
    }

    // Step 4: Trigger AI extraction (fire and forget)
    try {
      const currentYear = new Date().getFullYear();
      const extractPrompt = `Extract event details from this poster image. Return ONLY valid JSON matching this schema:
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
  "confidence": { "overall": 0.0-1.0, "title": 0.0-1.0, "start_at": 0.0-1.0, "city": 0.0-1.0, "venue": 0.0-1.0, "ticket_url": 0.0-1.0, "description": 0.0-1.0 },
  "evidence": { "fieldName": "exact text from poster that supports this field" },
  "age_restriction": "all_ages" | "16+" | "18+" | "21+",
  "content_flags": ["nightclub", "alcohol", "adult", "cannabis", "gambling", "tobacco"] or [],
  "moderation_warning": "string if illegal/harmful content detected, otherwise null"
}

IMPORTANT: The current year is ${currentYear}. If no year is visible, assume ${currentYear}. Always use Europe/Berlin timezone unless clearly indicated otherwise.`;

      const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: extractPrompt },
              imageContent
            ]
          }],
        }),
      });

      if (extractResponse.ok) {
        const extractData = await extractResponse.json();
        const content = extractData.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[0]);
          
          // Validate and fix dates
          let startAt = extracted.start_at;
          try {
            const d = new Date(startAt);
            if (isNaN(d.getTime())) startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          } catch { startAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); }

          let endAt = extracted.end_at;
          try {
            if (endAt && isNaN(new Date(endAt).getTime())) endAt = null;
          } catch { endAt = null; }

          const extractModerationStatus = extracted.moderation_warning ? "pending" : moderationStatus;

          await supabase
            .from("events")
            .update({
              title: extracted.title || "Untitled Event",
              start_at: startAt,
              end_at: endAt,
              timezone: extracted.timezone || "Europe/Berlin",
              city: extracted.city || "",
              venue: extracted.venue,
              address: extracted.address,
              description: extracted.description,
              ticket_url: extracted.ticket_url,
              tags: extracted.tags,
              confidence_overall: extracted.confidence?.overall,
              confidence_json: extracted.confidence,
              evidence_json: extracted.evidence,
              age_restriction: extracted.age_restriction || "all_ages",
              content_flags: extracted.content_flags || [],
              moderation_status: extractModerationStatus,
              moderation_notes: extracted.moderation_warning || (moderationStatus === "pending" ? `AI screening: ${screening.reason}` : null),
            })
            .eq("id", event.id);

          console.log(`Extraction complete for event ${event.id}`);
        }
      }
    } catch (extractErr) {
      console.error("Extraction error (non-fatal):", extractErr);
    }

    return new Response(
      JSON.stringify({
        status: moderationStatus === "pending" ? "pending_review" : "accepted",
        eventId: event.id,
        editToken: event.edit_token,
        message: moderationStatus === "pending"
          ? "Your poster has been submitted and is pending review."
          : "Your poster has been accepted!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("submit-poster error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
