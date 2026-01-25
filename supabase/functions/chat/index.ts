import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CUSTOMIZE THIS: Add your business knowledge here to "train" the chatbot
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
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
