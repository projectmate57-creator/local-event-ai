import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const BASE_URL = "https://local-event-ai.lovable.app";

const STATIC_PAGES = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/events", changefreq: "daily", priority: "0.9" },
  { loc: "/upload", changefreq: "monthly", priority: "0.7" },
  { loc: "/how-it-works", changefreq: "monthly", priority: "0.6" },
  { loc: "/faq", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.4" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: events, error } = await supabase
      .from("events_public")
      .select("slug, id, updated_at")
      .order("start_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const staticEntries = STATIC_PAGES.map(
      (p) => `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ).join("\n");

    const eventEntries = (events || [])
      .map((e) => {
        const path = e.slug || e.id;
        const lastmod = e.updated_at
          ? `\n    <lastmod>${new Date(e.updated_at).toISOString().split("T")[0]}</lastmod>`
          : "";
        return `  <url>
    <loc>${BASE_URL}/events/${path}</loc>${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${eventEntries}
</urlset>`;

    return new Response(xml, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("<error>Failed to generate sitemap</error>", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
