import { useState, useRef, useEffect } from "react";
import { 
  ArrowRight, Send, CheckCircle2, Loader2, Brain, 
  Sparkles, AlertCircle, Video, Mic, MicOff, Square, Play
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScreeningQuestion {
  id: number;
  question: string;
  type: string;
}

interface Evaluation {
  scores: {
    technical: number;
    problemSolving: number;
    communication: number;
    culturalFit: number;
    motivation: number;
  };
  overallScore: number;
  verdict: string;
  summary: string;
  standoutPoints: string[];
  concerns: string[];
}

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  type?: string;
  audioUrl?: string;
}

interface AIScreeningQuizProps {
  position: string;
  department: string;
  positionColor: 'red' | 'cyan';
  onBack: () => void;
  onComplete: () => void;
}

const STEPS = ["Info", "Chat", "Video", "Review"];

export default function AIScreeningQuiz({ position, department, positionColor, onBack, onComplete }: AIScreeningQuizProps) {
  const [step, setStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [answers, setAnswers] = useState<{question: string; answer: string}[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loomUrl, setLoomUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
  });

  const accent = positionColor === 'cyan' ? 'cyan' : 'red';
  const accentClasses = accent === 'cyan' 
    ? { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20', solid: 'bg-cyan-500' }
    : { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20', solid: 'bg-red-500' };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, aiTyping]);

  const addAiMessage = (text: string, type?: string) => {
    const msg: ChatMessage = { id: Date.now().toString(), role: 'ai', text, type };
    setChatMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (text: string, audioUrl?: string) => {
    const msg: ChatMessage = { id: Date.now().toString(), role: 'user', text, audioUrl };
    setChatMessages(prev => [...prev, msg]);
  };

  const startQuiz = async () => {
    if (!basicInfo.name || !basicInfo.email) return;
    setLoading(true);
    setLoadingMessage("AI is preparing your screening questions...");
    setError("");

    try {
      const res = await fetch('/api/screening/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, department }),
      });
      if (!res.ok) throw new Error('Failed to generate questions');
      const data = await res.json();
      const qs = Array.isArray(data.questions) ? data.questions : [];
      if (qs.length === 0) throw new Error('No questions received');
      setQuestions(qs);
      setStep(1);

      setTimeout(() => {
        addAiMessage(`Hey ${basicInfo.name.split(' ')[0]}! 👋 I'm AVA, the AI recruiter at Rank Me Higher. Let's chat about the ${position} role.`);
        setTimeout(() => {
          addAiMessage(`I've got ${qs.length} quick questions for you. Type your answers or hit the mic button to record a voice note. Let's go!`);
          setTimeout(() => {
            addAiMessage(qs[0].question, qs[0].type);
          }, 800);
        }, 600);
      }, 300);
    } catch {
      setError("Couldn't connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = (answerText?: string) => {
    const text = answerText || currentAnswer.trim();
    if (!text) return;

    addUserMessage(text, audioUrl || undefined);
    const newAnswers = [...answers, { question: questions[currentQuestion].question, answer: text }];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    setAudioBlob(null);
    setAudioUrl(null);

    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        const encouragements = ["Great answer! ", "Nice! ", "Got it! ", "Thanks! ", "Interesting! "];
        const prefix = encouragements[Math.floor(Math.random() * encouragements.length)];
        if (nextQ < questions.length) {
          addAiMessage(`${prefix}Question ${nextQ + 1} of ${questions.length}:`);
          setTimeout(() => {
            addAiMessage(questions[nextQ].question, questions[nextQ].type);
          }, 500);
        }
      }, 800);
    } else {
      setAiTyping(true);
      setTimeout(() => {
        setAiTyping(false);
        addAiMessage("That's all the questions! 🎉 Now I need a quick video intro from you before I analyze everything.");
        setTimeout(() => setStep(2), 1000);
      }, 1000);
    }
  };

  const [micWarning, setMicWarning] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setMicWarning("");

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        transcribeAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setMicWarning("Mic blocked by browser preview. Open this page in a new tab for voice notes, or type your answer below.");
      setTimeout(() => setMicWarning(""), 8000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const res = await fetch('/api/screening/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setCurrentAnswer(data.text);
        }
      } else {
        setCurrentAnswer("[Voice note recorded - transcription unavailable]");
      }
    } catch {
      setCurrentAnswer("[Voice note recorded]");
    } finally {
      setIsTranscribing(false);
    }
  };

  const submitForEvaluation = async () => {
    setLoading(true);
    setLoadingMessage("AI is analyzing your answers...");
    setError("");

    try {
      const res = await fetch('/api/screening/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, department, applicantName: basicInfo.name, answers, basicInfo }),
      });
      if (!res.ok) throw new Error('Failed to evaluate');
      const data = await res.json();
      setEvaluation(data.evaluation);
      setStep(3);
    } catch {
      setError("Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch('/api/screening/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, department, basicInfo, answers, evaluation, loomUrl }),
      });
      if (!res.ok) throw new Error('Submit failed');
      onComplete();
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && step === 1) {
      e.preventDefault();
      submitAnswer();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className={`w-14 h-14 rounded-full ${accentClasses.bg} ${accentClasses.border} border flex items-center justify-center mb-4 animate-pulse`}>
          <Brain className={`w-7 h-7 ${accentClasses.text}`} />
        </div>
        <Loader2 className={`w-5 h-5 ${accentClasses.text} animate-spin mb-3`} />
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: '80vh' }}>
      <div className="px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                i < step ? `${accentClasses.bg} ${accentClasses.border} ${accentClasses.text}` :
                i === step ? `${accentClasses.bg} ${accentClasses.border} ${accentClasses.text} ring-1 ring-offset-1 ring-offset-background ${accent === 'cyan' ? 'ring-cyan-500/50' : 'ring-red-500/50'}` :
                'bg-white/5 border-white/10 text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < step ? (accent === 'cyan' ? 'bg-cyan-500/40' : 'bg-red-500/40') : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-xs text-red-300">{error}</span>
        </div>
      )}

      {step === 0 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={`w-4 h-4 ${accentClasses.text}`} />
            <h3 className="font-orbitron font-bold text-sm text-foreground">Apply for {position}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Quick info, then you'll chat with our AI recruiter AVA.</p>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] font-medium text-foreground">Full Name *</Label>
                <Input required value={basicInfo.name} onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} className="mt-0.5 bg-white/5 border-white/10 text-sm h-8" placeholder="Your name" />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-foreground">Email *</Label>
                <Input type="email" required value={basicInfo.email} onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})} className="mt-0.5 bg-white/5 border-white/10 text-sm h-8" placeholder="you@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] font-medium text-foreground">Phone</Label>
                <Input value={basicInfo.phone} onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})} className="mt-0.5 bg-white/5 border-white/10 text-sm h-8" placeholder="+1 (555)..." />
              </div>
              <div>
                <Label className="text-[11px] font-medium text-foreground">Portfolio</Label>
                <Input value={basicInfo.portfolio} onChange={(e) => setBasicInfo({...basicInfo, portfolio: e.target.value})} className="mt-0.5 bg-white/5 border-white/10 text-sm h-8" placeholder="URL" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button type="button" onClick={onBack} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button 
              onClick={startQuiz} 
              disabled={!basicInfo.name || !basicInfo.email}
              className={`flex-1 py-2 rounded-xl ${accentClasses.bg} ${accentClasses.border} border ${accentClasses.text} font-bold text-sm hover:brightness-125 transition-all disabled:opacity-30 flex items-center justify-center gap-2`}
            >
              <Brain className="w-3.5 h-3.5" /> Start Chat with AVA
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '400px', minHeight: '250px' }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full ${accentClasses.bg} ${accentClasses.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                        <Brain className={`w-3 h-3 ${accentClasses.text}`} />
                      </div>
                      <div className={`rounded-2xl rounded-tl-sm px-3 py-2 ${accentClasses.bg} border ${accentClasses.border}`}>
                        {msg.type && (
                          <span className={`text-[8px] uppercase tracking-wider ${accentClasses.text} font-bold`}>{msg.type}</span>
                        )}
                        <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="rounded-2xl rounded-tr-sm px-3 py-2 bg-white/10 border border-white/10">
                      {msg.audioUrl && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="w-3 h-3 text-green-400" />
                          <span className="text-[9px] text-green-400 font-medium">Voice note</span>
                        </div>
                      )}
                      <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full ${accentClasses.bg} ${accentClasses.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                    <Brain className={`w-3 h-3 ${accentClasses.text}`} />
                  </div>
                  <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${accentClasses.bg} border ${accentClasses.border}`}>
                    <div className="flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${accentClasses.solid} animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-1.5 h-1.5 rounded-full ${accentClasses.solid} animate-bounce`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-1.5 h-1.5 rounded-full ${accentClasses.solid} animate-bounce`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-white/5">
            {micWarning && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-300 leading-tight">{micWarning}</span>
                <button onClick={() => setMicWarning("")} className="text-amber-400/60 hover:text-amber-400 ml-auto shrink-0 text-xs">&times;</button>
              </div>
            )}

            {isTranscribing && (
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Transcribing voice note...</span>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">Recording...</span>
                </div>
                <button onClick={stopRecording} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors">
                  <Square className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}

            {audioUrl && !isRecording && !isTranscribing && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <Mic className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400">Voice note ready</span>
                <audio src={audioUrl} controls className="h-6 flex-1" style={{ maxWidth: '150px' }} />
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-white/20 transition-colors"
                  rows={2}
                  placeholder="Type your answer or record a voice note..."
                  disabled={isRecording || isTranscribing}
                />
              </div>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                  isRecording 
                    ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' 
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
                } disabled:opacity-30`}
                title={isRecording ? 'Stop recording' : 'Record voice note'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => submitAnswer()}
                disabled={!currentAnswer.trim() || isRecording || isTranscribing}
                className={`p-2.5 rounded-xl ${accentClasses.bg} ${accentClasses.border} border ${accentClasses.text} transition-all shrink-0 hover:brightness-125 disabled:opacity-30`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/50 mt-1 text-center">
              Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length} · Press Enter to send
            </p>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className={`w-4 h-4 ${accentClasses.text}`} />
            <h3 className="font-orbitron font-bold text-sm text-foreground">Video Introduction</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${accentClasses.bg} ${accentClasses.text} ml-auto font-bold`}>Required</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Record a 1-2 min Loom video introducing yourself. Just be yourself!
          </p>

          <div>
            <Label className="text-[11px] font-medium text-foreground">Loom Video URL</Label>
            <Input 
              value={loomUrl}
              onChange={(e) => setLoomUrl(e.target.value)}
              className="mt-0.5 bg-white/5 border-white/10 text-sm h-8"
              placeholder="https://www.loom.com/share/..."
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button 
              onClick={submitForEvaluation}
              disabled={!loomUrl}
              className={`w-full py-2 rounded-xl ${accentClasses.bg} ${accentClasses.border} border ${accentClasses.text} font-bold text-sm hover:brightness-125 transition-all disabled:opacity-30 flex items-center justify-center gap-2`}
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && evaluation && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className={`w-4 h-4 ${accentClasses.text}`} />
            <h3 className="font-orbitron font-bold text-sm text-foreground">AI Assessment Complete</h3>
          </div>

          <div className={`p-3 rounded-xl ${accentClasses.bg} ${accentClasses.border} border mb-3 text-center`}>
            <div className={`text-3xl font-orbitron font-bold ${accentClasses.text}`}>{evaluation.overallScore}<span className="text-lg text-muted-foreground">/100</span></div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Overall Match Score</p>
          </div>

          <div className="grid grid-cols-5 gap-1 mb-3">
            {[
              { label: "Tech", score: evaluation.scores.technical },
              { label: "Problem", score: evaluation.scores.problemSolving },
              { label: "Comms", score: evaluation.scores.communication },
              { label: "Culture", score: evaluation.scores.culturalFit },
              { label: "Drive", score: evaluation.scores.motivation },
            ].map(({ label, score }) => (
              <div key={label} className="text-center p-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className={`text-sm font-bold ${score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>{score}</div>
                <div className="text-[8px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground mb-3">{evaluation.summary}</p>

          <button 
            onClick={submitApplication}
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${accent === 'cyan' ? 'from-cyan-600 to-cyan-500' : 'from-red-600 to-red-500'} text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Submit Application</>}
          </button>
        </div>
      )}
    </div>
  );
}
