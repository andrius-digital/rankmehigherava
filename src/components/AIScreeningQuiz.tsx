import { useState } from "react";
import { 
  ArrowRight, Send, CheckCircle2, Loader2, Brain, 
  MessageSquare, Sparkles, AlertCircle, Video
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface AIScreeningQuizProps {
  position: string;
  department: string;
  positionColor: 'red' | 'cyan';
  onBack: () => void;
  onComplete: () => void;
}

const STEPS = ["Info", "Quiz", "Video", "Review"];

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

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
  });

  const accent = positionColor === 'cyan' ? 'cyan' : 'red';
  const accentClasses = accent === 'cyan' 
    ? { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' }
    : { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' };

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
      setQuestions(data.questions);
      setStep(1);
    } catch {
      setError("Couldn't connect to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, { question: questions[currentQuestion].question, answer: currentAnswer.trim() }];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep(2);
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
    <div className="p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-3">
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

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-xs text-red-300">{error}</span>
        </div>
      )}

      {step === 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={`w-4 h-4 ${accentClasses.text}`} />
            <h3 className="font-orbitron font-bold text-sm text-foreground">Apply for {position}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Quick info, then our AI will ask you a few role-specific questions.</p>

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
                <Label className="text-[11px] font-medium text-foreground">Portfolio / LinkedIn</Label>
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
              <Brain className="w-3.5 h-3.5" /> Start AI Screening
            </button>
          </div>
        </div>
      )}

      {step === 1 && questions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-4 h-4 ${accentClasses.text}`} />
              <h3 className="font-orbitron font-bold text-xs text-foreground">Question {currentQuestion + 1} of {questions.length}</h3>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${accentClasses.bg} ${accentClasses.border} border ${accentClasses.text} font-medium uppercase`}>
              {questions[currentQuestion].type}
            </span>
          </div>

          <div className="w-full h-1 rounded-full bg-white/5 mb-3">
            <div className={`h-full rounded-full transition-all duration-500 ${accent === 'cyan' ? 'bg-cyan-500' : 'bg-red-500'}`} style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>

          {answers.length > 0 && (
            <div className="max-h-[120px] overflow-y-auto mb-2 space-y-1.5" style={{ scrollbarWidth: 'thin' }}>
              {answers.slice(-2).map((a, i) => (
                <div key={i} className="text-[10px] p-2 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-muted-foreground">Q: {a.question}</span>
                  <p className="text-foreground mt-0.5 line-clamp-2">{a.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className={`p-3 rounded-xl ${accentClasses.bg} ${accentClasses.border} border mb-2`}>
            <p className="text-sm text-foreground font-medium">{questions[currentQuestion].question}</p>
          </div>

          <Textarea 
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-white/5 border-white/10 text-sm min-h-[60px] resize-none mb-2"
            rows={2}
            placeholder="Type your answer... (Enter to submit, Shift+Enter for new line)"
            autoFocus
          />

          <button 
            onClick={submitAnswer}
            disabled={!currentAnswer.trim()}
            className={`w-full py-2 rounded-xl ${accentClasses.bg} ${accentClasses.border} border ${accentClasses.text} font-bold text-sm hover:brightness-125 transition-all disabled:opacity-30 flex items-center justify-center gap-2`}
          >
            {currentQuestion < questions.length - 1 ? (
              <>Next <ArrowRight className="w-3.5 h-3.5" /></>
            ) : (
              <>Finish Quiz <CheckCircle2 className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
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
        <div>
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
