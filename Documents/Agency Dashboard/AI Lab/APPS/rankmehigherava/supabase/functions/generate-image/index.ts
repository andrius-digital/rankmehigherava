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
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CHECK FOR GEMINI API KEY FIRST (User's new plan)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (GEMINI_API_KEY) {
      console.log("Using Direct Google Gemini API");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API Error:", errText);
        throw new Error(`Gemini API Failed: ${errText}`);
      }

      const data = await response.json();
      // Parse Gemini Response to get the text
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No text returned from Gemini");
      }

      // Return consistent format
      return new Response(
        JSON.stringify({ output: generatedText }), // generic wrapper
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FALLBACK TO LOVABLE (Nano Banana)
    if (LOVABLE_API_KEY) {
      console.log("Using Lovable / Nano Banana API");
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) throw new Error("Lovable API Failed");

      const data = await response.json();
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Missing Configuration: Please add GEMINI_API_KEY or LOVABLE_API_KEY to Supabase Secrets.");

  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
