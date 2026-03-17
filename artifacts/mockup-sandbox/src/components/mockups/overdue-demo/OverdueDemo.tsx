export function OverdueDemo() {
  const tasks = [
    { id: '1', title: 'Add Keywords to GBP', col: 'new' as const, dueDate: '2026-03-10', category: 'gbp', priority: 'high' as const },
    { id: '2', title: 'Create GBP Posts', col: 'in_progress' as const, dueDate: '2026-03-12', category: 'gbp', priority: 'high' as const },
    { id: '3', title: 'Upload New Photos', col: 'new' as const, dueDate: '2026-03-23', category: 'gbp', priority: 'medium' as const },
    { id: '4', title: 'Write New Reviews', col: 'in_progress' as const, dueDate: '2026-04-06', category: 'reviews', priority: 'high' as const },
    { id: '5', title: 'Add Keywords to GBP', col: 'finished' as const, dueDate: '2026-03-16', category: 'gbp', priority: 'high' as const },
  ];

  const isOverdue = (dueDate: string, col: string) => {
    if (col === 'finished') return false;
    return new Date(dueDate + 'T23:59:59') < new Date();
  };

  const formatDate = (d: string) => {
    const parts = d.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CARD_GLOW = {
    new: 'border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
    in_progress: 'border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    finished: 'border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  };

  const COL_HEADER: Record<string, { label: string; dot: string }> = {
    new: { label: 'New', dot: 'bg-red-500' },
    in_progress: { label: 'In Progress', dot: 'bg-amber-500' },
    finished: { label: 'Finished', dot: 'bg-green-500' },
  };

  const columns = ['new', 'in_progress', 'finished'] as const;

  const companies = [
    { name: 'Off-Tint', locations: 3, unfinished: 5, total: 12 },
    { name: 'CDL Agency', locations: 2, unfinished: 3, total: 8 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans">
      <style>{`
        @keyframes overdue-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4), inset 0 0 0 1px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.6), inset 0 0 0 1px rgba(239, 68, 68, 0.7); }
        }
        .card-overdue {
          border-color: rgba(239, 68, 68, 0.5) !important;
          animation: overdue-pulse 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .animate-blink {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Visual Demo: Overdue Cards & Friday Alerts</h2>
        <p className="text-xs text-gray-400">Fake data — showing how overdue tasks and Friday alerts look</p>
      </div>

      {/* SECTION 1: Friday Alert Demo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold text-white">Friday Alert Demo</h3>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Simulated Friday</span>
        </div>
        <div className="space-y-2">
          {companies.map(c => (
            <div key={c.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 text-amber-500 animate-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <span className="text-sm font-medium text-white flex-1">{c.name}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {c.unfinished}/{c.total} unfinished
              </span>
              <div className="flex gap-1">
                {Array.from({ length: c.locations }).map((_, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                    <svg className="w-2.5 h-2.5 text-amber-500 animate-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <path d="M12 9v4"/><path d="M12 17h.01"/>
                    </svg>
                    Loc {i + 1}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Kanban Cards Demo */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <h3 className="text-sm font-semibold text-white">Overdue & Normal Task Cards</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.col === col);
            const hdr = COL_HEADER[col];
            return (
              <div key={col} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${hdr.dot}`} />
                  <span className="text-[11px] font-semibold text-white">{hdr.label}</span>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="p-2 space-y-2">
                  {colTasks.map(task => {
                    const overdue = isOverdue(task.dueDate, task.col);
                    return (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-2.5 bg-white/[0.03] transition-all ${overdue ? 'card-overdue' : CARD_GLOW[task.col]}`}
                      >
                        <div className="flex items-center gap-1 mb-1.5">
                          <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          <span className="text-xs font-medium text-white truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${overdue ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                            {overdue ? (
                              <>
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                  <path d="M12 9v4"/><path d="M12 17h.01"/>
                                </svg>
                                OVERDUE
                              </>
                            ) : (
                              <>
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                                {formatDate(task.dueDate)}
                              </>
                            )}
                          </span>
                          {task.col === 'finished' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-green-500/10 text-green-400 border-green-500/30">
                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                              Done
                            </span>
                          )}
                        </div>
                        {overdue && (
                          <div className="mt-1.5 text-[9px] text-red-400/70">
                            Was due {formatDate(task.dueDate)} — {Math.ceil((Date.now() - new Date(task.dueDate + 'T23:59:59').getTime()) / 86400000)} days overdue
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-3 bg-white/[0.03] border border-white/10 rounded-lg">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Legend:</strong>{' '}
          <span className="text-red-400">Red pulsing glow</span> = overdue task (past deadline, not finished) •{' '}
          <span className="text-amber-400">Blinking triangle</span> = Friday alert (unfinished tasks warning) •{' '}
          <span className="text-green-400">Green glow</span> = finished task •{' '}
          <span className="text-amber-400">Amber glow</span> = in progress
        </p>
      </div>
    </div>
  );
}
