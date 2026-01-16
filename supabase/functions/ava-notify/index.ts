import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvaEmailData {
    type: "lead_collection" | "live_rep_request" | "conversation_summary";
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    userMessage?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    pageUrl?: string;
    timestamp?: string;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const data: AvaEmailData = await req.json();
        console.log("AVA email notification request:", data.type);

        let emailHtml = "";
        let subject = "";

        // Build email based on type
        switch (data.type) {
            case "lead_collection":
                subject = `🎯 AVA Lead: ${data.userName || "New Lead"}`;
                emailHtml = buildLeadEmail(data);
                break;

            case "live_rep_request":
                subject = `🚨 URGENT: Live Rep Requested - ${data.userName || "Visitor"}`;
                emailHtml = buildLiveRepEmail(data);
                break;

            case "conversation_summary":
                subject = `💬 AVA Conversation Summary`;
                emailHtml = buildConversationEmail(data);
                break;

            default:
                throw new Error("Invalid email type");
        }

        // Send email using Resend API
        const recipients = ["rubbail@rankmehigher.com", "andrius@cdlagency.com"];

        console.log("Sending AVA email to:", recipients);

        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "AVA AI <ava@rankmehigher.com>",
                to: recipients,
                subject: subject,
                html: emailHtml,
            }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
            console.error("Email sending failed:", emailResult);
            throw new Error(JSON.stringify(emailResult));
        }

        console.log("AVA email sent successfully:", emailResult);

        return new Response(
            JSON.stringify({ success: true, emailId: emailResult.id }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error in ava-notify function:", errorMessage);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
};

function buildLeadEmail(data: AvaEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AVA Lead Notification</title>
      </head>
      <body style="font-family: 'Orbitron', Arial, sans-serif; line-height: 1.6; color: #fff; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);">🤖 AVA Lead Collected</h1>
          <p style="color: #e0f2fe; margin-top: 10px; opacity: 0.9; font-size: 14px;">Your AI assistant has captured a new lead</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3); margin-bottom: 20px;">
          <h2 style="color: #06b6d4; font-size: 20px; margin-top: 0; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">👤 Contact Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; font-weight: bold; width: 35%; color: #94a3b8;">Name:</td>
              <td style="padding: 12px 0; color: #e0f2fe;">${data.userName || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #94a3b8;">Email:</td>
              <td style="padding: 12px 0;"><a href="mailto:${data.userEmail}" style="color: #06b6d4; text-decoration: none;">${data.userEmail || "Not provided"}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #94a3b8;">Phone:</td>
              <td style="padding: 12px 0;"><a href="tel:${data.userPhone}" style="color: #06b6d4; text-decoration: none;">${data.userPhone || "Not provided"}</a></td>
            </tr>
          </table>
        </div>
        
        ${data.userMessage ? `
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 20px;">
          <h2 style="color: #8b5cf6; font-size: 20px; margin-top: 0; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">💬 Their Message</h2>
          <p style="color: #e0f2fe; margin: 0; line-height: 1.8;">${data.userMessage}</p>
        </div>
        ` : ""}
        
        <div style="background: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid rgba(6, 182, 212, 0.2);">
          <p style="color: #94a3b8; margin: 0; font-size: 13px;">Page: <strong style="color: #06b6d4;">${data.pageUrl || "Unknown"}</strong></p>
          <p style="color: #64748b; margin-top: 10px; font-size: 11px;">Captured at ${data.timestamp || new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #64748b; font-size: 11px; margin-top: 20px; text-align: center;">
          This email was sent by AVA - Rank Me Higher's AI Command Center
        </p>
      </body>
    </html>
  `;
}

function buildLiveRepEmail(data: AvaEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URGENT: Live Rep Request</title>
      </head>
      <body style="font-family: 'Orbitron', Arial, sans-serif; line-height: 1.6; color: #fff; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center; animation: pulse 2s infinite;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);">🚨 URGENT: Live Rep Requested</h1>
          <p style="color: #fee2e2; margin-top: 10px; opacity: 0.9; font-size: 16px; font-weight: bold;">Someone needs to talk to a real person NOW!</p>
        </div>
        
        <div style="background: rgba(239, 68, 68, 0.1); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; border: 2px solid #ef4444; margin-bottom: 20px;">
          <h2 style="color: #ef4444; font-size: 20px; margin-top: 0;">⚡ Action Required</h2>
          <p style="color: #fecaca; font-size: 16px; margin: 10px 0;">A visitor has requested to speak with a live representative. Please respond as soon as possible!</p>
        </div>
        
        ${data.conversationHistory && data.conversationHistory.length > 0 ? `
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3); margin-bottom: 20px;">
          <h2 style="color: #06b6d4; font-size: 18px; margin-top: 0; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">💬 Conversation History</h2>
          ${data.conversationHistory.map(msg => `
            <div style="margin: 15px 0; padding: 12px; border-radius: 8px; background: ${msg.role === 'user' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)'}; border-left: 3px solid ${msg.role === 'user' ? '#06b6d4' : '#8b5cf6'};">
              <strong style="color: ${msg.role === 'user' ? '#06b6d4' : '#8b5cf6'}; font-size: 12px; text-transform: uppercase;">${msg.role === 'user' ? '👤 Visitor' : '🤖 AVA'}:</strong>
              <p style="color: #e0f2fe; margin: 5px 0 0 0; line-height: 1.6;">${msg.content}</p>
            </div>
          `).join('')}
        </div>
        ` : ""}
        
        <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid rgba(239, 68, 68, 0.3);">
          <p style="color: #fca5a5; margin: 0; font-size: 13px;">Page: <strong style="color: #ef4444;">${data.pageUrl || "Unknown"}</strong></p>
          <p style="color: #991b1b; margin-top: 10px; font-size: 11px;">Time: ${data.timestamp || new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #64748b; font-size: 11px; margin-top: 20px; text-align: center;">
          This urgent notification was sent by AVA - Rank Me Higher's AI Command Center
        </p>
      </body>
    </html>
  `;
}

function buildConversationEmail(data: AvaEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AVA Conversation Summary</title>
      </head>
      <body style="font-family: 'Orbitron', Arial, sans-serif; line-height: 1.6; color: #fff; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0b;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px; text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);">💬 AVA Conversation Summary</h1>
          <p style="color: #e0e7ff; margin-top: 10px; opacity: 0.9; font-size: 14px;">A visitor had a conversation with your AI assistant</p>
        </div>
        
        ${data.conversationHistory && data.conversationHistory.length > 0 ? `
        <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 20px;">
          <h2 style="color: #8b5cf6; font-size: 18px; margin-top: 0; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">Full Conversation</h2>
          ${data.conversationHistory.map(msg => `
            <div style="margin: 15px 0; padding: 12px; border-radius: 8px; background: ${msg.role === 'user' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)'}; border-left: 3px solid ${msg.role === 'user' ? '#06b6d4' : '#8b5cf6'};">
              <strong style="color: ${msg.role === 'user' ? '#06b6d4' : '#8b5cf6'}; font-size: 12px; text-transform: uppercase;">${msg.role === 'user' ? '👤 Visitor' : '🤖 AVA'}:</strong>
              <p style="color: #e0f2fe; margin: 5px 0 0 0; line-height: 1.6;">${msg.content}</p>
            </div>
          `).join('')}
        </div>
        ` : ""}
        
        <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.2);">
          <p style="color: #c4b5fd; margin: 0; font-size: 13px;">Page: <strong style="color: #8b5cf6;">${data.pageUrl || "Unknown"}</strong></p>
          <p style="color: #7c3aed; margin-top: 10px; font-size: 11px;">Time: ${data.timestamp || new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #64748b; font-size: 11px; margin-top: 20px; text-align: center;">
          This email was sent by AVA - Rank Me Higher's AI Command Center
        </p>
      </body>
    </html>
  `;
}

serve(handler);
