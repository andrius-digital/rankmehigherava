import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_WEBSITE_SUBMISSIONS");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionData {
  companyName: string;
  businessEmail: string;
  businessPhone: string;
  mainCity: string;
  serviceCategory: string;
  serviceAreas: string;
  domainName: string;
  formData: Record<string, unknown>;
  submissionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SubmissionData = await req.json();
    console.log("Received website submission notification request:", data.companyName);

    const { companyName, businessEmail, businessPhone, mainCity, serviceCategory, serviceAreas, domainName, submissionId } = data;

    // Track notification results
    let emailSuccess = false;
    let emailError: string | null = null;
    let slackSuccess = false;
    let slackError: string | null = null;

    // Build HTML email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Website Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #e53935; margin: 0; font-size: 24px;">🎉 New Website Submission</h1>
            <p style="color: #fff; margin-top: 10px; opacity: 0.9;">A new client has completed the website onboarding form</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #e53935; padding-bottom: 10px;">📋 Business Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Company Name:</td>
                <td style="padding: 8px 0;">${companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Business Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${businessEmail}" style="color: #e53935;">${businessEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${businessPhone}" style="color: #e53935;">${businessPhone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Domain:</td>
                <td style="padding: 8px 0;">${domainName || 'Not specified'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #e53935; padding-bottom: 10px;">📍 Location & Services</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Main City:</td>
                <td style="padding: 8px 0;">${mainCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Service Category:</td>
                <td style="padding: 8px 0;">${serviceCategory || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Service Areas:</td>
                <td style="padding: 8px 0;">${serviceAreas || 'Not specified'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="color: #fff; margin: 0; font-size: 14px;">Submission ID: <strong>${submissionId}</strong></p>
            <p style="color: #888; margin-top: 10px; font-size: 12px;">Full form data is stored in the database</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px; text-align: center;">
            This email was sent from the Rank Me Higher website submission form.
          </p>
        </body>
      </html>
    `;

    // Send emails using Resend API - wrapped in try/catch to not block Slack
    const recipients = ["rubbail@rankmehigher.com", "andrius@cdlagency.com"];
    
    try {
      console.log("Sending emails to:", recipients);
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Rank Me Higher <notifications@rankmehigher.com>",
          to: recipients,
          subject: `🎉 New Website Submission: ${companyName}`,
          html: emailHtml,
        }),
      });

      const emailResult = await emailResponse.json();
      
      if (!emailResponse.ok) {
        console.error("Email sending failed:", emailResult);
        emailError = JSON.stringify(emailResult);
      } else {
        console.log("Email sent successfully:", emailResult);
        emailSuccess = true;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown email error";
      console.error("Email exception:", errMsg);
      emailError = errMsg;
    }

    // Send Slack notification - always attempt regardless of email status
    if (SLACK_WEBHOOK_URL) {
      try {
        const slackMessage = {
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🎉 New Website Submission",
                emoji: true
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Company:*\n${companyName}`
                },
                {
                  type: "mrkdwn",
                  text: `*Email:*\n${businessEmail}`
                },
                {
                  type: "mrkdwn",
                  text: `*Phone:*\n${businessPhone}`
                },
                {
                  type: "mrkdwn",
                  text: `*Main City:*\n${mainCity}`
                }
              ]
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Service Category:*\n${serviceCategory || 'Not specified'}`
                },
                {
                  type: "mrkdwn",
                  text: `*Domain:*\n${domainName || 'Not specified'}`
                }
              ]
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Submission ID: \`${submissionId}\``
                }
              ]
            }
          ]
        };

        console.log("Sending Slack notification...");
        
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackMessage),
        });

        if (!slackResponse.ok) {
          const slackText = await slackResponse.text();
          console.error("Slack notification failed:", slackText);
          slackError = slackText;
        } else {
          console.log("Slack notification sent successfully");
          slackSuccess = true;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown Slack error";
        console.error("Slack exception:", errMsg);
        slackError = errMsg;
      }
    } else {
      console.warn("SLACK_WEBHOOK_WEBSITE_SUBMISSIONS not configured, skipping Slack notification");
      slackError = "Webhook not configured";
    }

    // Return success if at least one notification was sent
    const success = emailSuccess || slackSuccess;
    const status = success ? 200 : 500;

    return new Response(
      JSON.stringify({ 
        success,
        email: { success: emailSuccess, error: emailError },
        slack: { success: slackSuccess, error: slackError }
      }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-website-submission function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
