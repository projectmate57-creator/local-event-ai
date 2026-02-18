import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { eventId, eventTitle, moderationReason } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin user IDs from user_roles
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError || !adminRoles?.length) {
      console.log("No admins found or error:", rolesError);
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ message: "No admin emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending moderation notification to ${adminEmails.length} admin(s)`);

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Event Moderation <onboarding@resend.dev>",
        to: adminEmails,
        subject: `🔍 Event Pending Review: ${eventTitle || "Untitled Event"}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">⚠️ Event Flagged for Review</h2>
            <p>A new event submission has been flagged by the AI screening system and requires your review before it can be published.</p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${eventTitle || "Untitled Event"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Event ID:</strong> ${eventId}</p>
              ${moderationReason ? `<p style="margin: 0;"><strong>AI Reason:</strong> ${moderationReason}</p>` : ""}
            </div>
            
            <p>Please log in to the admin dashboard to review and approve or reject this event.</p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">This is an automated notification from the event moderation system.</p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email", details: emailResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Moderation notification sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, notified: adminEmails.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-admin-moderation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
