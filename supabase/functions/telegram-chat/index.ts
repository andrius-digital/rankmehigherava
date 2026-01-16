import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_BOT_TOKEN = "8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE";
const TELEGRAM_CHAT_ID = "-5166184217";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ChatRequest {
  sessionId: string;
  message: string;
  pageUrl?: string;
}

async function sendTelegramMessage(text: string, replyToMessageId?: number, inlineKeyboard?: any): Promise<number | null> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return null;
  }

  try {
    const body: any = {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: "HTML",
      reply_to_message_id: replyToMessageId,
    };

    if (inlineKeyboard) {
      body.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (data.ok) {
      return data.result.message_id;
    } else {
      console.error("Telegram API error:", data);
      return null;
    }
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, pageUrl }: ChatRequest = await req.json();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (!sessionId || !message) {
      throw new Error("sessionId and message are required");
    }

    // Check if session exists, create if not
    let { data: session } = await supabase
      .from("telegram_chat_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (!session) {
      // Count existing active sessions to get visitor number
      const { count } = await supabase
        .from("telegram_chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      
      const visitorNumber = (count || 0) + 1;

      // Create new session with visitor number
      const { data: newSession, error: sessionError } = await supabase
        .from("telegram_chat_sessions")
        .insert({
          session_id: sessionId,
          page_url: pageUrl,
          is_active: true,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Failed to create session:", sessionError);
        throw new Error("Failed to create chat session");
      }

      session = newSession;
      session.visitor_number = visitorNumber;

      // Send initial notification to Telegram with Visitor number
      const welcomeText = `🆕 <b>VISITOR ${visitorNumber}</b> started chatting\n\n` +
        `📍 ${pageUrl || "Website"}\n` +
        `⏰ ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", hour12: true })}\n\n` +
        `<i>↩️ Reply to respond to Visitor ${visitorNumber}</i>`;

      const telegramMsgId = await sendTelegramMessage(welcomeText);
      
      if (telegramMsgId) {
        await supabase
          .from("telegram_chat_sessions")
          .update({ telegram_message_id: telegramMsgId })
          .eq("session_id", sessionId);
        
        session.telegram_message_id = telegramMsgId;
      }
    }

    // Store the user message
    const { data: newMsg, error: msgError } = await supabase
      .from("telegram_chat_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: message,
        is_read: false,
      })
      .select()
      .single();

    if (msgError) {
      console.error("Failed to store message:", msgError);
      throw new Error("Failed to store message");
    }

    // Send message to Telegram with "Mark as Seen" button
    const userMsgText = `💬 <b>Visitor:</b>\n${message}`;
    const seenButton = [[{ text: "👁 Mark as Seen", callback_data: `seen:${newMsg.id}` }]];
    const tgMsgId = await sendTelegramMessage(userMsgText, session.telegram_message_id, seenButton);

    // Store the telegram message ID for the user message
    if (tgMsgId) {
      await supabase
        .from("telegram_chat_messages")
        .update({ telegram_message_id: tgMsgId })
        .eq("id", newMsg.id);
    }

    // Update session timestamp
    await supabase
      .from("telegram_chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("session_id", sessionId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId,
        message: "Message sent to owner" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Telegram chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

