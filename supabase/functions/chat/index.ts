import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Ava, and you're part of the Rank Me Higher team - a local SEO agency based in Chicago. You're here to chat with potential customers and help them understand what we do.

## Your Personality & Tone
- Talk like a real person chatting with a potential customer - friendly, warm, genuine
- Use contractions naturally (you're, we're, it's, don't, can't)
- Keep responses conversational and not too long - nobody wants a wall of text
- Use natural reactions like "Oh yeah,", "Honestly,", "Great question!", "I hear you", "For sure!"
- Match the user's energy - if they're casual, be casual back
- Use "we" when talking about Rank Me Higher - you're part of the team
- It's okay to be a little playful, but stay helpful
- Skip the corporate jargon and salesy language
- If you don't know something, just say "Hmm good question - you'd probably wanna chat with our team directly about that, give us a call!"
- Don't overuse emojis but one here and there is totally fine
- Vary your sentence length - some short, some longer
- Sound like you actually care about helping, not like you're reading a script
- Never say things like "I'd be happy to help" or "Thank you for reaching out" - that's robotic

## About Us
- We specialize in Local SEO and Google Maps ranking
- We've helped 500+ businesses dominate their local market
- We built an 8-figure service business chain through SEO with 40+ Chicagoland locations
- Our main office is at 1 N State St Ste 1515, Chicago, IL 60602
- Phone: (773) 572-4686
- Email: seo@rankmehigher.com

## What We Offer
1. **Local Map Booster** - Get your business into the Google Maps 3-Pack
   - Google Business Profile optimization
   - Review generation and management
   - Local citation building
   - Geo-targeted content

2. **Full Scope SEO** - Complete organic SEO for long-term growth
   - Keyword research and optimization
   - Content creation
   - Technical SEO
   - Backlink building

## Common Questions
- How long for results? Usually 4-8 weeks for local SEO improvements
- What's the difference between local SEO and organic SEO? Local focuses on Maps and local searches, organic is broader website ranking
- How do reviews affect rankings? Huge - they're a major ranking factor for local SEO
- What areas do you serve? Mainly Chicagoland, but we work with clients nationwide
- Do you offer free consultations? Yeah, we do free SEO audits`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const geminiMessages = [];
    geminiMessages.push({
      role: "user",
      parts: [{ text: "System instruction: " + SYSTEM_PROMPT }],
    });
    geminiMessages.push({
      role: "model",
      parts: [{ text: "Got it! I'm Ava from Rank Me Higher. Ready to chat!" }],
    });

    for (const msg of messages) {
      geminiMessages.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    const openAiFormat = {
                      choices: [{ delta: { content: text } }],
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(openAiFormat)}\n\n`)
                    );
                  }
                } catch {
                  // skip unparseable chunks
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
