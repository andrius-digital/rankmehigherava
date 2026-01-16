import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface NotifyRequest {
  messages: Message[];
  pageUrl: string;
  sessionDuration: number;
  liveRepRequest?: boolean;
  triggerMessage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pageUrl, sessionDuration, liveRepRequest, triggerMessage }: NotifyRequest = await req.json();
    const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SLACK_WEBHOOK_URL) {
      throw new Error("SLACK_WEBHOOK_URL is not configured");
    }

    console.log("Processing Slack notification for conversation with", messages.length, "messages");
    console.log("Live rep request:", liveRepRequest);

    // Filter to get only user and assistant messages (exclude system)
    const conversationMessages = messages.filter(m => m.role === "user" || m.role === "assistant");
    
    // Handle live representative request - urgent notification
    if (liveRepRequest) {
      console.log("Sending urgent live rep notification");
      
      const userMessages = conversationMessages.filter(m => m.role === "user");
      const recentContext = userMessages.slice(-3).map(m => `• ${m.content}`).join("\n");
      
      const urgentMessage = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚨 URGENT: Live Representative Request",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*@andriusdigital Rank Me Higher Website lead is looking for a live representative*",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Page:*\n${pageUrl || "Unknown"}`,
              },
              {
                type: "mrkdwn",
                text: `*Time:*\n${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Trigger Message:*\n> ${triggerMessage || "N/A"}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Recent Context:*\n${recentContext || "No previous messages"}`,
            },
          },
        ],
      };

      const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urgentMessage),
      });

      if (!slackResponse.ok) {
        const errorText = await slackResponse.text();
        console.error("Slack error:", slackResponse.status, errorText);
        throw new Error(`Slack API error: ${slackResponse.status}`);
      }

      console.log("Urgent live rep notification sent successfully");

      return new Response(JSON.stringify({ success: true, type: "live_rep" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular conversation notification
    if (conversationMessages.length < 2) {
      console.log("Not enough messages to summarize, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a summary using AI
    let summary = "";
    const userMessages = conversationMessages.filter(m => m.role === "user");
    const userQuestions = userMessages.map(m => m.content).join("\n- ");

    if (LOVABLE_API_KEY) {
      try {
        const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a conversation summarizer. Create a brief 2-3 sentence summary of this customer conversation. Focus on: what the customer wanted to know, key topics discussed, and any action items or follow-ups needed. Be concise and professional.",
              },
              {
                role: "user",
                content: `Summarize this conversation:\n\n${conversationMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}`,
              },
            ],
          }),
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          summary = summaryData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("Error generating summary:", e);
      }
    }

    // Format duration
    const minutes = Math.floor(sessionDuration / 60000);
    const seconds = Math.floor((sessionDuration % 60000) / 1000);
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    // Build Slack message
    const slackMessage = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "💬 New Chatbot Conversation",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Page:*\n${pageUrl || "Unknown"}`,
            },
            {
              type: "mrkdwn",
              text: `*Duration:*\n${durationStr}`,
            },
            {
              type: "mrkdwn",
              text: `*Messages:*\n${conversationMessages.length}`,
            },
            {
              type: "mrkdwn",
              text: `*Time:*\n${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*User Questions:*\n- ${userQuestions}`,
          },
        },
      ],
    };

    // Add AI summary if available
    if (summary) {
      slackMessage.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*AI Summary:*\n${summary}`,
        },
      });
    }

    // Send to Slack
    const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error("Slack error:", slackResponse.status, errorText);
      throw new Error(`Slack API error: ${slackResponse.status}`);
    }

    console.log("Slack notification sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Slack notify error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
