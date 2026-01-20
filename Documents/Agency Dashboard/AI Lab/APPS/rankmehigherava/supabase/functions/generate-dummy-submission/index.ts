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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Check if this is a funnel request
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch {
      // No body or invalid JSON, use defaults
    }
    const submissionType = (requestBody as any)?.type || 'website';

    // Funnel-specific generation
    if (submissionType === 'funnel') {
      const funnelTypes = [
        "Lead Generation Funnel for Home Services",
        "Appointment Booking Funnel for Consultants",
        "Product Launch Funnel for E-commerce",
        "Webinar Registration Funnel",
        "Free Trial Signup Funnel for SaaS",
        "Real Estate Lead Capture Funnel",
        "Fitness Challenge Signup Funnel",
        "Course Enrollment Funnel",
        "Free Consultation Funnel for Lawyers",
        "Quote Request Funnel for Contractors"
      ];
      const randomFunnel = funnelTypes[Math.floor(Math.random() * funnelTypes.length)];

      const funnelPrompt = `Generate a complete, realistic dummy business for a funnel onboarding form.
      
The funnel type is: ${randomFunnel}

Return a JSON object with ALL of these fields filled with realistic, creative content:

{
  "companyName": "Creative business name",
  "businessEmail": "email@domain.com",
  "businessPhone": "(XXX) XXX-XXXX format",
  "funnelGoal": "Clear, specific goal for this funnel (2-3 sentences)",
  "targetAudience": "Detailed target audience description (demographics, pain points, desires)",
  "mainOffer": "Compelling main offer with specific details",
  "websiteColors": "Brand color scheme with hex codes (e.g., Primary: #3B82F6 Blue, Secondary: #F3F4F6 Light Gray)",
  "additionalNotes": "Any special requirements or notes for the funnel"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations. Make all content realistic and specific to the ${randomFunnel} type.`;

      console.log("Generating dummy funnel for:", randomFunnel);

      const funnelResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: funnelPrompt }] }],
            generationConfig: {
              temperature: 0.9,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!funnelResponse.ok) {
        const errText = await funnelResponse.text();
        console.error("Gemini API Error:", errText);
        throw new Error(`Gemini API Failed: ${errText}`);
      }

      const funnelData = await funnelResponse.json();
      const funnelText = funnelData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!funnelText) {
        throw new Error("No text returned from Gemini");
      }

      let cleanFunnelJson = funnelText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const funnelSubmissionData = JSON.parse(cleanFunnelJson);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: funnelSubmissionData,
          funnelType: randomFunnel 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a random business type for variety (website submissions)
    const businessTypes = [
      "Window Tinting & Auto Detailing",
      "Residential Cleaning Services", 
      "Plumbing & HVAC Services",
      "Landscaping & Lawn Care",
      "Roofing & Gutters",
      "Electrical Services",
      "Kitchen & Bath Remodeling",
      "Pest Control Services",
      "Moving & Storage Company",
      "Painting & Drywall Services"
    ];
    const randomBusiness = businessTypes[Math.floor(Math.random() * businessTypes.length)];

    const prompt = `Generate a complete, realistic dummy business submission for a website onboarding form. 
    
The business type is: ${randomBusiness}

Return a JSON object with ALL of these fields filled with realistic, creative content:

{
  "companyName": "Creative business name for ${randomBusiness}",
  "ownsDomain": "yes",
  "domainName": "www.example-domain.com (make it realistic)",
  "businessPhone": "(XXX) XXX-XXXX format",
  "businessEmail": "email@domain.com",
  "jobRequestEmail": "jobs@domain.com",
  "mainCity": "A real US city",
  "serviceAreas": "List 5-10 nearby cities/suburbs separated by commas",
  "showAddress": "yes",
  "streetAddress": "A realistic street address",
  "city": "Same as mainCity",
  "stateProvince": "State abbreviation",
  "postalCode": "5 digit zip",
  "showHours": "yes",
  "serviceCategory": "${randomBusiness}",
  "services": [
    {"name": "Service 1 name", "price": "$XX-$XXX", "description": "2-3 sentence description"},
    {"name": "Service 2 name", "price": "$XX-$XXX", "description": "2-3 sentence description"},
    {"name": "Service 3 name", "price": "$XX-$XXX", "description": "2-3 sentence description"},
    {"name": "Service 4 name", "price": "$XX-$XXX", "description": "2-3 sentence description"},
    {"name": "Service 5 name", "price": "$XX-$XXX", "description": "2-3 sentence description"}
  ],
  "includeServicePage": "include",
  "showPricing": "yes",
  "servicePageType": "separate",
  "freeEstimates": "yes",
  "customerAction": "form",
  "clientType": "both",
  "serviceJobDuration": "Realistic job duration description",
  "serviceAreaPages": "A number between 3-10 (just the number)",
  "customerChallenges": "3-4 sentences describing common problems and challenges customers face that this business solves",
  "serviceProcess": "Detailed 4-5 step service process description (use numbered steps)",
  "serviceOptions": "2-3 sentences about service options/tiers",
  "guarantees": "Specific guarantee or warranty policy",
  "insuranceHoaSupport": "One of: full_handling, partial_help, no_insurance, no_hoa, not_applicable, other",
  "insuranceHoaDetails": "2-3 sentences explaining how the business helps with insurance claims or HOA paperwork if applicable",
  "businessUnique": "3-4 unique selling points with specific details",
  "qualityTrust": "Why customers can trust this business (certifications, experience, etc.)",
  "accreditations": "2-3 realistic accreditations/certifications",
  "founderMessage": "A personal 3-4 sentence message from the founder about why they started this business",
  "teamMembers": "Brief description of team size and expertise",
  "communityGiving": "How the business gives back to community",
  "coreValues": "3-4 core values, each on a new line",
  "websiteColors": "Suggested color scheme with specific colors",
  "fontName": "A professional font suggestion",
  "googleBusinessProfileLink": "https://g.page/example-business (make realistic for this business)",
  "googleReviews": "Yes - display on website",
  "reviewPlatformLinks": "Specific review links like: Yelp: https://yelp.com/biz/businessname, HomeAdvisor: https://homeadvisor.com/..., Angi: https://angi.com/...",
  "yelpLink": "https://yelp.com/biz/businessname-city (make realistic)",
  "instagramLink": "https://instagram.com/businesshandle (make realistic)",
  "facebookLink": "https://facebook.com/businessname (make realistic)",
  "tiktokLink": "https://tiktok.com/@businesshandle (make realistic)",
  "workPhotosDescription": "Detailed description of 5-6 portfolio/work photos that would showcase this business (for a designer to source or create)",
  "specialOffersExplanation": "Current promotional offer details",
  "financingExplanation": "Financing options if applicable",
  "competitorWebsites": "List 2-3 competitor website URLs",
  "additionalNotes": "Any additional notes for the web designer",
  "logoPrompt": "Describe an ideal logo for this business (for AI image generation)",
  "founderPhotoPrompt": "Describe a professional founder photo (for AI image generation)",
  "teamPhotoPrompt": "Describe professional team photos for this business (for AI image generation)",
  "workPhotosPrompt": "Describe 5-6 work/portfolio photos for this business (for AI image generation)"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations. Make all content realistic, professional, and specific to the ${randomBusiness} industry.`;

    console.log("Generating dummy submission for:", randomBusiness);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API Failed: ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No text returned from Gemini");
    }

    // Parse the JSON from the response
    // Clean up any markdown formatting that might be present
    let cleanJson = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const submissionData = JSON.parse(cleanJson);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: submissionData,
        businessType: randomBusiness 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating dummy submission:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
