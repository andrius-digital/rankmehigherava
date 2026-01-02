import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = "8579583220:AAHcl0ElgV6VuDno-OZNQwKTKV2vDs3aYxE";
const TELEGRAM_CHAT_ID = "-5166184217";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const update = await req.json();
    console.log("Webhook received:", JSON.stringify(update));

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle callback query (button tap)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      
      if (data && data.startsWith("seen:")) {
        const messageId = data.replace("seen:", "");
        
        // Mark message as read
        await supabase
          .from("telegram_chat_messages")
          .update({ is_read: true })
          .eq("id", messageId);

        // Answer the callback to remove loading state
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: "✓ Marked as seen",
            }),
          }
        );

        // Update the message to remove the button and show "Seen"
        if (callbackQuery.message) {
          const originalText = callbackQuery.message.text || "";
          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                message_id: callbackQuery.message.message_id,
                text: originalText + "\n\n👁 <i>Seen</i>",
                parse_mode: "HTML",
              }),
            }
          );
        }
      }
      
      return new Response("OK", { status: 200 });
    }

    // Handle regular message
    const message = update.message;
    if (!message || !message.text) {
      return new Response("OK", { status: 200 });
    }

    // Skip bot messages
    if (message.from?.is_bot) {
      return new Response("OK", { status: 200 });
    }

    const text = message.text;
    let targetSession = null;

    // Check if this is a REPLY to a specific message
    if (message.reply_to_message) {
      const replyToId = message.reply_to_message.message_id;

      // Try to find session by the original welcome message ID
      const { data: sessionByWelcome } = await supabase
        .from("telegram_chat_sessions")
        .select("*")
        .eq("telegram_message_id", replyToId)
        .eq("is_active", true)
        .single();

      if (sessionByWelcome) {
        targetSession = sessionByWelcome;
      } else {
        // Try to find session by a visitor message
        const { data: msgData } = await supabase
          .from("telegram_chat_messages")
          .select("session_id")
          .eq("telegram_message_id", replyToId)
          .single();

        if (msgData) {
          const { data: sessionData } = await supabase
            .from("telegram_chat_sessions")
            .select("*")
            .eq("session_id", msgData.session_id)
            .single();
          
          if (sessionData) {
            targetSession = sessionData;
          }
        }
      }
    }

    // If no specific reply, use most recent active session
    if (!targetSession) {
      const { data: sessions } = await supabase
        .from("telegram_chat_sessions")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        targetSession = sessions[0];
      }
    }

    if (!targetSession) {
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: "ℹ️ No active visitor sessions",
            reply_to_message_id: message.message_id,
          }),
        }
      );
      return new Response("OK", { status: 200 });
    }

    // Save owner reply
    const { error: insertError } = await supabase
      .from("telegram_chat_messages")
      .insert({
        session_id: targetSession.session_id,
        role: "owner",
        content: text,
        telegram_message_id: message.message_id,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `❌ Error: ${insertError.message}`,
            reply_to_message_id: message.message_id,
          }),
        }
      );
      return new Response("OK", { status: 200 });
    }

    // Mark all unread user messages in this session as read (since owner is replying)
    await supabase
      .from("telegram_chat_messages")
      .update({ is_read: true })
      .eq("session_id", targetSession.session_id)
      .eq("role", "user")
      .eq("is_read", false);

    // Success confirmation
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `✅ Sent`,
          reply_to_message_id: message.message_id,
        }),
      }
    );

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});
