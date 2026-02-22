import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Search, Filter, ChevronDown, ChevronUp, 
  ExternalLink, Video, Mail, Phone, Globe, Clock, Star, 
  AlertTriangle, CheckCircle2, XCircle, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HUDOverlay from '@/components/ui/HUDOverlay';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface Applicant {
  id: string;
  submittedAt: string;
  position: string;
  department: string;
  name: string;
  email: string;
  phone: string | null;
  portfolio: string | null;
  loomUrl: string | null;
  evaluation: {
    overallScore: number;
    verdict: string;
    summary: string;
    scores: {
      technical: number;
      problemSolving: number;
      communication: number;
      culturalFit: number;
      motivation: number;
    };
    standoutPoints: string[];
    concerns: string[];
  };
  answers: { question: string; answer: string }[];
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  reviewing: { label: 'Reviewing', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  interview: { label: 'Interview', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  hired: { label: 'Hired', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const verdictConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  strong_yes: { label: 'Strong Yes', color: 'text-green-400', icon: <CheckCircle2 className="w-4 h-4 text-green-400" /> },
  yes: { label: 'Yes', color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
  maybe: { label: 'Maybe', color: 'text-yellow-400', icon: <AlertTriangle className="w-4 h-4 text-yellow-400" /> },
  no: { label: 'No', color: 'text-red-400', icon: <XCircle className="w-4 h-4 text-red-400" /> },
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{score}/10</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all ${
          score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'
        }`}
        style={{ width: `${score * 10}%` }}
      />
    </div>
  </div>
);

const ApplicantTracker: React.FC = () => {
  const isMobile = useIsMobile();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    };
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/applicants', { headers });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/applicants/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteApplicant = async (id: string) => {
    if (!confirm('Remove this applicant?')) return;
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/applicants/${id}`, { method: 'DELETE', headers });
      setApplicants(prev => prev.filter(a => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filtered = applicants
    .filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || 
               a.email.toLowerCase().includes(q) || 
               a.position.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0);
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const stats = {
    total: applicants.length,
    new: applicants.filter(a => a.status === 'new').length,
    reviewing: applicants.filter(a => a.status === 'reviewing').length,
    interview: applicants.filter(a => a.status === 'interview').length,
    hired: applicants.filter(a => a.status === 'hired').length,
    avgScore: applicants.length ? Math.round(applicants.reduce((s, a) => s + (a.evaluation?.overallScore || 0), 0) / applicants.length) : 0,
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet><title>Applicant Tracker | AVA Admin</title></Helmet>
      <HUDOverlay />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`border-b border-cyan-500/20 bg-card/30 backdrop-blur-xl sticky top-0 z-20 ${isMobile ? 'py-2' : 'py-4'}`}>
          <div className={`container mx-auto ${isMobile ? 'px-3' : 'px-4'}`}>
            <div className="flex items-center gap-3">
              <Link to="/avaadminpanel" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className={`font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ${isMobile ? 'text-base' : 'text-xl'}`}>
                  Applicant Tracker
                </h1>
                {!isMobile && <p className="text-xs text-muted-foreground">AI-screened job applications</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={fetchApplicants} className="ml-auto h-8 w-8 p-0">
                <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <main className={`flex-1 container mx-auto ${isMobile ? 'px-3 py-3' : 'px-4 py-6'}`}>
          <div className="max-w-6xl mx-auto space-y-4">

            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} gap-2`}>
              {[
                { label: 'Total', value: stats.total, color: 'text-foreground' },
                { label: 'New', value: stats.new, color: 'text-blue-400' },
                { label: 'Reviewing', value: stats.reviewing, color: 'text-yellow-400' },
                { label: 'Interview', value: stats.interview, color: 'text-purple-400' },
                { label: 'Hired', value: stats.hired, color: 'text-green-400' },
                { label: 'Avg Score', value: stats.avgScore, color: 'text-cyan-400' },
              ].map(s => (
                <div key={s.label} className="bg-card/20 border border-white/5 rounded-xl p-3 text-center">
                  <div className={`text-lg font-orbitron font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or position..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-sm text-foreground appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="interview">Interview</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'date' | 'score')}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-sm text-foreground appearance-none cursor-pointer"
                >
                  <option value="date">Newest First</option>
                  <option value="score">Highest Score</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading applicants...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card/10 border border-white/5 rounded-2xl">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {applicants.length === 0 ? 'No applications yet. They\'ll show up here once candidates apply through the Careers page.' : 'No applicants match your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(applicant => {
                  const isExpanded = expandedId === applicant.id;
                  const status = statusConfig[applicant.status] || statusConfig.new;
                  const verdict = verdictConfig[applicant.evaluation?.verdict] || verdictConfig.maybe;
                  const score = applicant.evaluation?.overallScore || 0;
                  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';

                  return (
                    <div key={applicant.id} className="bg-card/20 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                        className="w-full text-left p-3 sm:p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            score >= 80 ? 'bg-green-500/15 text-green-400' : 
                            score >= 60 ? 'bg-yellow-500/15 text-yellow-400' : 
                            score >= 40 ? 'bg-orange-500/15 text-orange-400' : 
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {score}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{applicant.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.border} border ${status.color} font-medium`}>
                                {status.label}
                              </span>
                              <span className="flex items-center gap-1 text-[10px]">
                                {verdict.icon}
                                <span className={verdict.color}>{verdict.label}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground truncate">{applicant.position}</span>
                              <span className="text-[10px] text-muted-foreground/50">|</span>
                              <span className="text-[10px] text-muted-foreground">{applicant.department}</span>
                              <span className="text-[10px] text-muted-foreground/50">|</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(applicant.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/5 p-3 sm:p-4 space-y-4">
                          <div className="flex flex-wrap gap-4 text-xs">
                            <a href={`mailto:${applicant.email}`} className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                              <Mail className="w-3.5 h-3.5" /> {applicant.email}
                            </a>
                            {applicant.phone && (
                              <a href={`tel:${applicant.phone}`} className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                                <Phone className="w-3.5 h-3.5" /> {applicant.phone}
                              </a>
                            )}
                            {applicant.portfolio && (
                              <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                                <Globe className="w-3.5 h-3.5" /> Portfolio
                              </a>
                            )}
                            {applicant.loomUrl && (
                              <a href={applicant.loomUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-400 hover:underline">
                                <Video className="w-3.5 h-3.5" /> Loom Video
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">AI Scores</h4>
                              <ScoreBar label="Technical" score={applicant.evaluation?.scores?.technical || 0} />
                              <ScoreBar label="Problem Solving" score={applicant.evaluation?.scores?.problemSolving || 0} />
                              <ScoreBar label="Communication" score={applicant.evaluation?.scores?.communication || 0} />
                              <ScoreBar label="Cultural Fit" score={applicant.evaluation?.scores?.culturalFit || 0} />
                              <ScoreBar label="Motivation" score={applicant.evaluation?.scores?.motivation || 0} />
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">AI Summary</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{applicant.evaluation?.summary}</p>
                              </div>
                              {applicant.evaluation?.standoutPoints?.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-green-400 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Standout</h4>
                                  <ul className="space-y-0.5">
                                    {applicant.evaluation.standoutPoints.map((p, i) => (
                                      <li key={i} className="text-xs text-muted-foreground">- {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {applicant.evaluation?.concerns?.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-orange-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Concerns</h4>
                                  <ul className="space-y-0.5">
                                    {applicant.evaluation.concerns.map((c, i) => (
                                      <li key={i} className="text-xs text-muted-foreground">- {c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {applicant.answers?.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Q&A</h4>
                              <div className="space-y-2">
                                {applicant.answers.map((qa, i) => (
                                  <div key={i} className="bg-white/5 rounded-lg p-2.5">
                                    <p className="text-xs font-medium text-foreground mb-1">Q{i+1}: {qa.question}</p>
                                    <p className="text-xs text-muted-foreground">{qa.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <span className="text-xs text-muted-foreground mr-1">Status:</span>
                            {Object.entries(statusConfig).map(([key, cfg]) => (
                              <button
                                key={key}
                                onClick={() => updateStatus(applicant.id, key)}
                                className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-all ${
                                  applicant.status === key 
                                    ? `${cfg.bg} ${cfg.border} ${cfg.color}` 
                                    : 'bg-transparent border-white/5 text-muted-foreground/50 hover:border-white/20 hover:text-muted-foreground'
                                }`}
                              >
                                {cfg.label}
                              </button>
                            ))}
                            <button 
                              onClick={() => deleteApplicant(applicant.id)}
                              className="ml-auto p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicantTracker;
