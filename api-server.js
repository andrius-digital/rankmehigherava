import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SCREENING_SYSTEM_PROMPT = `You are an AI hiring assistant for "Rank Me Higher", a digital marketing agency. Your job is to screen applicants by asking smart questions and evaluating their answers.

About Rank Me Higher:
- We're a fast-moving agency that custom codes websites, runs profitable Meta ad campaigns, and builds AI-powered automations
- We value self-starters, problem-solvers, and people who take ownership
- We work remotely with team members worldwide
- We care about results, not credentials
- Our founder Andrius values honesty, hustle, and people who figure things out
- We use tools like Replit, Claude Code, N8N, GoHighLevel, Vapi, and Meta Ads Manager

What we look for in ALL candidates:
- Self-motivated and proactive (don't wait to be told what to do)
- Good communicator (clear, concise, responsive)
- Problem-solver (Google it, figure it out, then ask if stuck)
- Reliable and consistent (show up, deliver, follow through)
- Growth mindset (eager to learn, not afraid to fail)
- Team player but can work independently`;

app.post('/api/screening/questions', async (req, res) => {
  try {
    const { position, department } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: SCREENING_SYSTEM_PROMPT },
        { role: "user", content: `Generate exactly 5 screening questions for a "${position}" applicant in the "${department}" department.

Mix of question types:
1. One role-specific technical/skill question
2. One scenario-based problem-solving question (give them a realistic work situation)
3. One personality/work-style question
4. One question about their motivation/drive
5. One creative or unexpected question that reveals character

Each question should be conversational, not corporate. Keep them short (1-2 sentences max).

Return as JSON array: [{"id": 1, "question": "...", "type": "technical|scenario|personality|motivation|creative"}]` }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || '{"questions":[]}';
    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed;
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.post('/api/screening/evaluate', async (req, res) => {
  try {
    const { position, department, applicantName, answers, basicInfo } = req.body;

    const answersFormatted = answers.map((a, i) => `Q${i+1}: ${a.question}\nA${i+1}: ${a.answer}`).join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: SCREENING_SYSTEM_PROMPT },
        { role: "user", content: `Evaluate this applicant for the "${position}" role in "${department}".

Applicant: ${applicantName}
Portfolio/LinkedIn: ${basicInfo.portfolio || 'Not provided'}

Their answers:
${answersFormatted}

Score them on these criteria (each 1-10):
1. Technical/Role Fit - Do they have the skills?
2. Problem-Solving Ability - Can they figure things out?
3. Communication Quality - Are their answers clear and thoughtful?
4. Cultural Fit - Would they thrive in our fast-paced, remote agency?
5. Motivation & Drive - Do they genuinely want this?

Return JSON:
{
  "scores": {
    "technical": <number>,
    "problemSolving": <number>,
    "communication": <number>,
    "culturalFit": <number>,
    "motivation": <number>
  },
  "overallScore": <number 1-100>,
  "verdict": "strong_yes|yes|maybe|no",
  "summary": "<2-3 sentence assessment>",
  "standoutPoints": ["<what impressed you>"],
  "concerns": ["<any red flags or concerns>"]
}` }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const evaluation = JSON.parse(content);
    res.json({ evaluation });
  } catch (error) {
    console.error('Error evaluating:', error);
    res.status(500).json({ error: 'Failed to evaluate application' });
  }
});

app.post('/api/screening/submit', async (req, res) => {
  try {
    const { position, department, basicInfo, answers, evaluation, loomUrl } = req.body;

    if (!position || !department || !basicInfo?.name || !basicInfo?.email || !answers?.length || !evaluation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const verdictEmoji = {
      strong_yes: '🟢🟢',
      yes: '🟢',
      maybe: '🟡',
      no: '🔴'
    };

    const answersText = answers.slice(0, 10).map((a, i) => `<b>Q${i+1}:</b> ${String(a.question).slice(0, 500)}\n<b>A${i+1}:</b> ${String(a.answer).slice(0, 1000)}`).join('\n\n');

    const telegramMessage = `🤖 <b>AI-Screened Application</b> ${verdictEmoji[evaluation.verdict] || ''}

<b>Position:</b> ${String(position).slice(0, 100)}
<b>Department:</b> ${String(department).slice(0, 100)}
<b>AI Score:</b> ${evaluation.overallScore}/100 (${String(evaluation.verdict || '').replace('_', ' ').toUpperCase()})

👤 <b>Applicant Info</b>
<b>Name:</b> ${String(basicInfo.name).slice(0, 200)}
<b>Email:</b> ${String(basicInfo.email).slice(0, 200)}
<b>Phone:</b> ${basicInfo.phone ? String(basicInfo.phone).slice(0, 30) : 'N/A'}
<b>Portfolio:</b> ${basicInfo.portfolio ? String(basicInfo.portfolio).slice(0, 500) : 'N/A'}
${loomUrl ? `<b>Loom Video:</b> ${String(loomUrl).slice(0, 500)}` : ''}

📊 <b>AI Scores</b>
Technical: ${evaluation.scores?.technical || 0}/10
Problem-Solving: ${evaluation.scores?.problemSolving || 0}/10
Communication: ${evaluation.scores?.communication || 0}/10
Cultural Fit: ${evaluation.scores?.culturalFit || 0}/10
Motivation: ${evaluation.scores?.motivation || 0}/10

💬 <b>AI Summary:</b>
${String(evaluation.summary || '').slice(0, 1000)}

${evaluation.standoutPoints?.length ? `✅ <b>Standout:</b> ${evaluation.standoutPoints.map(s => String(s).slice(0, 200)).join(', ')}` : ''}
${evaluation.concerns?.length ? `⚠️ <b>Concerns:</b> ${evaluation.concerns.map(s => String(s).slice(0, 200)).join(', ')}` : ''}

📝 <b>Q&A:</b>
${answersText}`;

    const supabaseUrl = process.env.SUPABASE_URL || 'https://vyviopkpwcsdrfpdwzpa.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseKey) {
      console.error('SUPABASE_ANON_KEY not set');
      return res.json({ success: true, evaluation, warning: 'Notification not sent (missing config)' });
    }

    const notifyResponse = await fetch(
      `${supabaseUrl}/functions/v1/ava-notify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message: telegramMessage,
          type: 'ai_screened_application',
        }),
      }
    );

    if (!notifyResponse.ok) {
      console.error('Telegram notification failed:', await notifyResponse.text());
    }

    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error submitting:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
