import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gbpUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!gbpUrl || typeof gbpUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Google Business Profile URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracting info from GBP URL:", gbpUrl);

    const systemPrompt = `You are Ava, a helpful AI assistant. Your task is to analyze a Google Business Profile URL and extract location information.

Given a Google Business Profile URL (like "https://maps.google.com/maps?cid=..." or "https://www.google.com/maps/place/..."), analyze it and infer:
1. The business name (if visible in the URL)
2. The city and state where the business is located
3. Suggest 4-6 nearby cities/suburbs that would be good service areas

For location inference:
- Look at the URL for location hints (city names, coordinates, place names)
- If you can identify a major metro area, suggest common suburbs
- Use your knowledge of US geography to suggest realistic service areas

Respond ONLY in valid JSON format:
{
  "businessName": "Business Name or null if unknown",
  "city": "City name",
  "state": "State abbreviation (e.g., IL, TX, CA)",
  "suggestedServiceAreas": ["Area 1", "Area 2", "Area 3", "Area 4"]
}

If you cannot determine location from the URL, make reasonable assumptions based on any clues available, or provide a generic response.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this Google Business Profile URL and extract location info: ${gbpUrl}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    // Parse the JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default response
      parsed = {
        businessName: null,
        city: null,
        state: null,
        suggestedServiceAreas: [],
      };
    }

    console.log("GBP info extracted:", parsed);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("extract-gbp-info error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
