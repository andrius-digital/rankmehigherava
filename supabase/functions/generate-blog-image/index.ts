import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { prompt, runOffline } = await req.json();

        if (!prompt) {
            throw new Error("Prompt is required");
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");

        // FALLBACK or OFFLINE MODE
        if (!GEMINI_API_KEY || runOffline) {
            console.log("Generating offline placeholder (No Gemini Key):", prompt);
            const encodedPrompt = encodeURIComponent(prompt.substring(0, 50) + "...");
            const mockUrl = `https://placehold.co/1200x630/1a1a1a/white.png?text=${encodedPrompt}`;
            return new Response(
                JSON.stringify({ imageUrl: mockUrl, source: "mock" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // REAL GENERATION (Google Imagen 3 / "Nano Banana")
        console.log("Generating Google Imagen 3 image for:", prompt);

        // Note: 'imagen-3.0-generate-001' is the model ID for high quality generation
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: `Photorealistic, professional, high-end commercial photography: ${prompt}` }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1" // or "16:9" if supported by the specific endpoint version
                }
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            // If 404, the model might not be accessible with this key/region. Fallback to placeholder.
            console.warn("Imagen API failed, falling back to placeholder:", err);
            const encodedPrompt = encodeURIComponent(prompt.substring(0, 50) + "...");
            const mockUrl = `https://placehold.co/1200x630/1a1a1a/white.png?text=GenFailed:${encodedPrompt}`;
            return new Response(
                JSON.stringify({ imageUrl: mockUrl, source: "mock-fallback" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const data = await response.json();
        // Imagen response structure: { predictions: [ { bytesBase64Encoded: "..." } ] }
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;

        if (!b64) throw new Error("No image data in Imagen response");

        // Upload to Supabase Storage
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const fileName = `generated/${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("blog-images")
            .upload(fileName, decodeBase64(b64), {
                contentType: "image/png",
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from("blog-images")
            .getPublicUrl(fileName);

        return new Response(
            JSON.stringify({ imageUrl: publicUrl, source: "openai" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Image generation failed:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

// Helper to decode Base64 for Deno
function decodeBase64(base64: string) {
    const binString = atob(base64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
