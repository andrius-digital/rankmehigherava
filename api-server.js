import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const app = express();
app.use(express.json({ limit: '1mb' }));

const APPLICANTS_FILE = path.join(process.cwd(), 'data', 'applicants.json');

function ensureDataDir() {
  const dir = path.dirname(APPLICANTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadApplicants() {
  ensureDataDir();
  if (!fs.existsSync(APPLICANTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(APPLICANTS_FILE, 'utf-8'));
  } catch { return []; }
}

function saveApplicant(applicant) {
  const applicants = loadApplicants();
  applicants.unshift(applicant);
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2));
}

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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SCREENING_SYSTEM_PROMPT + `\n\nIMPORTANT: Always respond with a JSON object containing a "questions" key with an array of exactly 5 question objects.` },
        { role: "user", content: `Generate exactly 5 screening questions for a "${position}" applicant in the "${department}" department.

Mix: 1 technical, 1 scenario, 1 personality, 1 motivation, 1 creative. Keep each question conversational and short (1-2 sentences).

You MUST return exactly this format: {"questions": [{"id": 1, "question": "your question here", "type": "technical"}, {"id": 2, "question": "...", "type": "scenario"}, {"id": 3, "question": "...", "type": "personality"}, {"id": 4, "question": "...", "type": "motivation"}, {"id": 5, "question": "...", "type": "creative"}]}` }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || '{"questions":[]}';
    console.log('OpenAI raw response:', content.substring(0, 300));
    const parsed = JSON.parse(content);

    let questions = [];

    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
      if (arrayVal) {
        questions = arrayVal;
      } else if (parsed.id && parsed.question) {
        questions = [parsed];
      }
    }

    if (questions.length === 0) {
      console.error('Parsed 0 questions. Retrying with stricter prompt...');
      const retry = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate interview questions. Return ONLY a JSON object with a 'questions' key containing an array." },
          { role: "user", content: `Generate 5 screening questions for a "${position}" role. Mix: technical, scenario, personality, motivation, creative. Return: {"questions": [{"id": 1, "question": "...", "type": "technical"}, ...]}` }
        ],
        response_format: { type: "json_object" },
      });
      const retryContent = retry.choices[0]?.message?.content || '{}';
      console.log('Retry response:', retryContent.substring(0, 300));
      const retryParsed = JSON.parse(retryContent);
      if (Array.isArray(retryParsed.questions)) questions = retryParsed.questions;
      else if (Array.isArray(retryParsed)) questions = retryParsed;
      else {
        const retryArr = Object.values(retryParsed).find(v => Array.isArray(v));
        if (retryArr) questions = retryArr;
      }
    }

    if (questions.length === 0) {
      return res.status(500).json({ error: 'Could not generate questions. Please try again.' });
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
  }
});

app.post('/api/screening/evaluate', async (req, res) => {
  try {
    const { position, department, applicantName, answers, basicInfo } = req.body;

    const answersFormatted = answers.map((a, i) => `Q${i+1}: ${a.question}\nA${i+1}: ${a.answer}`).join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    const applicantRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      submittedAt: new Date().toISOString(),
      position: String(position).slice(0, 100),
      department: String(department).slice(0, 100),
      name: String(basicInfo.name).slice(0, 200),
      email: String(basicInfo.email).slice(0, 200),
      phone: basicInfo.phone ? String(basicInfo.phone).slice(0, 30) : null,
      portfolio: basicInfo.portfolio ? String(basicInfo.portfolio).slice(0, 500) : null,
      loomUrl: loomUrl ? String(loomUrl).slice(0, 500) : null,
      evaluation: {
        overallScore: evaluation.overallScore,
        verdict: evaluation.verdict,
        summary: evaluation.summary,
        scores: evaluation.scores,
        standoutPoints: evaluation.standoutPoints,
        concerns: evaluation.concerns
      },
      answers: answers.slice(0, 10).map(a => ({
        question: String(a.question).slice(0, 500),
        answer: String(a.answer).slice(0, 1000)
      })),
      status: 'new'
    };

    saveApplicant(applicantRecord);

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

    const TELEGRAM_CHANNELS = {
      'Creative': '-1003863683808',
      'Marketing': '-1003516103565',
      'Software Engineers': '-1003711003707',
    };

    const chatId = TELEGRAM_CHANNELS[department] || TELEGRAM_CHANNELS['Software Engineers'];
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return res.json({ success: true, evaluation, warning: 'Notification not sent (missing bot token)' });
    }

    try {
      const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      if (!tgResponse.ok) {
        const errText = await tgResponse.text();
        console.error('Telegram notification failed:', errText);
      } else {
        console.log(`Telegram notification sent to channel ${chatId} for ${position} (${department})`);
      }
    } catch (tgErr) {
      console.error('Telegram send error:', tgErr);
    }

    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error submitting:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

function verifySupabaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/applicants', verifySupabaseAuth, (req, res) => {
  const applicants = loadApplicants();
  res.json({ applicants });
});

app.patch('/api/applicants/:id/status', verifySupabaseAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['new', 'reviewing', 'interview', 'hired', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const applicants = loadApplicants();
  const idx = applicants.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  applicants[idx].status = status;
  ensureDataDir();
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2));
  res.json({ success: true, applicant: applicants[idx] });
});

app.delete('/api/applicants/:id', verifySupabaseAuth, (req, res) => {
  const { id } = req.params;
  let applicants = loadApplicants();
  const idx = applicants.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  applicants.splice(idx, 1);
  ensureDataDir();
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2));
  res.json({ success: true });
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/screening/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    const tmpPath = path.join('/tmp', `audio_${Date.now()}.webm`);
    fs.writeFileSync(tmpPath, req.file.buffer);

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmpPath),
        model: 'whisper-1',
      });
      res.json({ text: transcription.text });
    } finally {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
