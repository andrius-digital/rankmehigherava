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
        const { websiteUrl, clientId } = await req.json();

        if (!websiteUrl) {
            throw new Error("Website URL is required");
        }

        console.log(`Analyzing website: ${websiteUrl}`);

        // 1. Fetch Website Content
        // Note: Simple fetch might fail on some sophisticated sites. 
        // In production, use a scraping API (like Firecrawl or similar).
        // For this demo, we try direct fetch.
        const siteResponse = await fetch(websiteUrl);
        if (!siteResponse.ok) {
            throw new Error(`Failed to fetch website: ${siteResponse.statusText}`);
        }
        const htmlText = await siteResponse.text();

        // Truncate HTML to avoid token limits (focus on body/main)
        // A simple truncation usually works for grabbing main keywords/services
        const truncatedHtml = htmlText.substring(0, 30000);

        // 2. Use Gemini to Extract Context
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const prompt = `
      Analyze this website HTML and extract the "Brand DNA" for a client database.
      Target Website: ${websiteUrl}
      
      JSON Structure required (Strictly follow this):
      {
        "company_name": "Exact Name",
        "primary_services": ["service 1", "service 2", "service 3"],
        "target_audience": "Description of who they serve (e.g. 'Homeowners in Northbrook looking for luxury updates')",
        "brand_voice": "3 adjectives describing tone (e.g. Professional, Friendly, Technical)",
        "location_data": { 
            "city": "Primary City", 
            "state": "State Code", 
            "service_areas": ["Area 1", "Area 2"] 
        },
        "key_benefits": ["Unique Selling Point 1", "USP 2"]
      }

      HTML Content:
      ${truncatedHtml}
    `;

        // Helper for Gemini Call with Model Fallback
        const callGemini = async (model: string) => {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
            });
            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`${model} Error: ${resp.status} ${txt}`);
            }
            return resp.json();
        };

        let aiData;
        try {
            console.log("Trying Gemini 2.0 Flash Exp...");
            aiData = await callGemini('gemini-2.0-flash-exp');
        } catch (e) {
            console.warn("Gemini 2.0 failed, falling back to 1.5-flash...", e);
            try {
                aiData = await callGemini('gemini-1.5-flash');
            } catch (e2) {
                console.error("All Gemini models failed");
                throw new Error(`Analysis failed across models. Last error: ${e2}`);
            }
        }

        const generatedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        // Clean and Parse JSON
        const cleanJson = generatedText.replace(/```json\n?|\n?```/g, '').trim();
        const brandContext = JSON.parse(cleanJson);

        // 3. Return the Context (Frontend will save it or DB can be updated here)
        return new Response(
            JSON.stringify(brandContext),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error analyzing website:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
