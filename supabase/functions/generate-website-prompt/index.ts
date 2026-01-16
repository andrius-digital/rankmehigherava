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
    const { formData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!formData) {
      return new Response(
        JSON.stringify({ error: "Form data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating website prompt for:", formData.companyName);

    const systemPrompt = `You are Ava, an expert at creating detailed Lovable prompts for building professional business websites. Your job is to take form submission data and create a comprehensive, well-structured prompt that can be used to build a complete website.

Create a detailed Lovable prompt that includes:

1. **Project Overview** - Business name, type, location, and core value proposition
2. **Design Direction** - Color scheme, fonts, overall aesthetic based on the brand info
3. **Pages to Create** - List all pages with their purpose and key sections
4. **Homepage Structure** - Hero section, services overview, trust signals, CTAs
5. **Content Guidelines** - Tone, key messages, service descriptions
6. **Features** - Contact forms, call-to-action buttons, Google reviews integration
7. **Social Media Integration** - Which platforms to link
8. **SEO Considerations** - Local SEO, service area pages, meta descriptions
9. **Technical Requirements** - Responsive design, performance, accessibility

Format the prompt clearly with headers and bullet points. Make it comprehensive enough that someone could use it to build the entire website without additional information.

The prompt should be direct and actionable - written as instructions to Lovable, not as a description.`;

    const userPrompt = `Create a detailed Lovable website prompt based on this form submission:

${JSON.stringify(formData, null, 2)}

Generate a comprehensive, ready-to-use Lovable prompt for building this business website.`;

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
          { role: "user", content: userPrompt },
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
    const prompt = data.choices?.[0]?.message?.content?.trim();

    console.log("Website prompt generated successfully");

    return new Response(
      JSON.stringify({ prompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-website-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
