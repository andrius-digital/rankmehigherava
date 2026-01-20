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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured. Please add it to Supabase Secrets.");
    }

    // Use Gemini for image generation
    {
      console.log("Using Google Gemini Imagen API for image generation");

      // Use Imagen 3 for image generation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [{ prompt: prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              safetyFilterLevel: "block_few",
              personGeneration: "allow_adult",
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini Imagen API Error:", errText);
        
        // If Imagen fails, try Gemini 2.0 Flash with image output
        console.log("Falling back to Gemini 2.0 Flash experimental...");
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseModalities: ["image", "text"],
              },
            }),
          }
        );

        if (!fallbackResponse.ok) {
          const fallbackErr = await fallbackResponse.text();
          console.error("Gemini 2.0 Flash fallback error:", fallbackErr);
          throw new Error(`Image generation failed: ${fallbackErr}`);
        }

        const fallbackData = await fallbackResponse.json();
        
        // Extract image from Gemini 2.0 response
        const parts = fallbackData.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
        
        if (imagePart?.inlineData) {
          const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          // Format response to match expected structure
          return new Response(
            JSON.stringify({
              choices: [{
                message: {
                  images: [{
                    image_url: { url: base64Image }
                  }]
                }
              }]
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error("No image generated from Gemini");
      }

      const data = await response.json();
      
      // Imagen returns base64 in predictions[0].bytesBase64Encoded
      const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;
      
      if (!imageBase64) {
        throw new Error("No image returned from Imagen");
      }

      // Format response to match expected structure (same as Lovable API)
      const base64Image = `data:image/png;base64,${imageBase64}`;
      return new Response(
        JSON.stringify({
          choices: [{
            message: {
              images: [{
                image_url: { url: base64Image }
              }]
            }
          }]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
