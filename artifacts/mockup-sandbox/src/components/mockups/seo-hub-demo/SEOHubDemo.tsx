import { useState } from 'react';

export function SEOHubDemo() {
  const [sopExpanded, setSopExpanded] = useState<string | null>('sop-1');
  const [sopCategory, setSopCategory] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('Off-Tint');
  const [collapsedLocs, setCollapsedLocs] = useState<Set<string>>(new Set());

  const sops = [
    { id: 'sop-1', title: 'How to Optimize GBP Posts', category: 'gbp', description: 'Step-by-step guide for creating optimized Google Business Profile posts', content: '## Step 1: Open Google Business Profile\nLog into the GBP dashboard for the client.\n\n## Step 2: Create a New Post\n- Click "Add Update" button\n- Choose post type: **Update**, **Offer**, or **Event**\n- Write keyword-rich content (150-300 words)\n\n## Step 3: Add Visual Media\n- Upload a **high-quality photo** (min 720px wide)\n- Ensure the image relates to the post topic\n\n## Step 4: Add CTA\n- Select appropriate Call-to-Action button\n- Link to the relevant landing page' },
    { id: 'sop-2', title: 'Review Generation Process', category: 'reviews', description: 'Framework for requesting and managing client reviews', content: '## Overview\nConsistent review generation is critical for local SEO ranking.' },
    { id: 'sop-3', title: 'Citation Building Checklist', category: 'citations', description: 'NAP consistency across all directories', content: '## Directories List\nYelp, YellowPages, BBB, Manta...' },
    { id: 'sop-4', title: 'GBP Photo Guidelines', category: 'gbp', description: 'Requirements for uploading photos to Google Business Profile', content: '## Photo Types\nExterior, Interior, Team, Products...' },
    { id: 'sop-5', title: 'Monthly Reporting Template', category: 'reporting', description: 'How to generate and send monthly SEO reports', content: '## Report Structure...' },
  ];

  const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
    gbp: { label: 'GBP', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    citations: { label: 'Citations', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    reviews: { label: 'Reviews', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'on-page': { label: 'On-Page', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    reporting: { label: 'Reporting', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };

  const CARD_GLOW = {
    new: 'border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
    in_progress: 'border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    finished: 'border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  };

  const companies = ['Off-Tint', 'CDL Agency'];
  const locations: Record<string, Array<{ id: string; address: string }>> = {
    'Off-Tint': [
      { id: 'loc-1', address: '1234 Main St, Lisle, IL' },
      { id: 'loc-2', address: '5678 Oak Ave, Naperville, IL' },
    ],
    'CDL Agency': [
      { id: 'loc-3', address: '910 Elm Rd, Chicago, IL' },
    ],
  };

  const tasks: Record<string, Array<{ id: string; title: string; col: 'new' | 'in_progress' | 'finished'; dueDate: string | null; category: string; priority: string; notes: string }>> = {
    'loc-1': [
      { id: 't1', title: 'Add Keywords to GBP', col: 'in_progress', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '|||keyword1|||keyword2|||keyword3' },
      { id: 't2', title: 'Create GBP Posts', col: 'new', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '' },
      { id: 't3', title: 'Upload New Photos', col: 'finished', dueDate: '2026-03-22', category: 'gbp', priority: 'medium', notes: '|||exterior shot|||team photo' },
      { id: 't4', title: 'Write New Reviews', col: 'in_progress', dueDate: '2026-04-06', category: 'reviews', priority: 'high', notes: '|||https://g.co/review1' },
    ],
    'loc-2': [
      { id: 't5', title: 'Add Keywords to GBP', col: 'new', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '' },
      { id: 't6', title: 'Create GBP Posts', col: 'finished', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '|||post1|||post2|||post3' },
      { id: 't7', title: 'Upload New Photos', col: 'new', dueDate: '2026-03-22', category: 'gbp', priority: 'medium', notes: '' },
      { id: 't8', title: 'Write New Reviews', col: 'new', dueDate: '2026-04-06', category: 'reviews', priority: 'high', notes: '' },
    ],
    'loc-3': [
      { id: 't9', title: 'Add Keywords to GBP', col: 'finished', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '|||kw1|||kw2|||kw3|||kw4|||kw5|||kw6|||kw7|||kw8|||kw9|||kw10' },
      { id: 't10', title: 'Create GBP Posts', col: 'in_progress', dueDate: '2026-03-22', category: 'gbp', priority: 'high', notes: '|||post-url-1|||post-url-2' },
      { id: 't11', title: 'Upload New Photos', col: 'finished', dueDate: '2026-03-22', category: 'gbp', priority: 'medium', notes: '|||photo1' },
      { id: 't12', title: 'Write New Reviews', col: 'finished', dueDate: '2026-04-06', category: 'reviews', priority: 'high', notes: '|||review1|||review2' },
    ],
  };

  const TASK_TARGETS: Record<string, { target: number; targetMin?: number }> = {
    'Add Keywords to GBP': { target: 10 },
    'Create GBP Posts': { target: 4, targetMin: 3 },
    'Upload New Photos': { target: 2, targetMin: 1 },
    'Write New Reviews': { target: 2 },
  };

  const getProgress = (notes: string, title: string) => {
    const entries = notes.split('|||').filter(e => e.trim());
    const config = TASK_TARGETS[title];
    if (!config) return null;
    return { count: entries.length, target: config.target, targetMin: config.targetMin };
  };

  const getProgressColor = (count: number, target: number, targetMin?: number) => {
    if (count >= target) return 'text-green-400';
    if (targetMin && count >= targetMin) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatDate = (d: string) => {
    const parts = d.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredSops = sopCategory === 'all' ? sops : sops.filter(s => s.category === sopCategory);
  const currentLocs = locations[selectedCompany] || [];

  const toggleLoc = (id: string) => {
    setCollapsedLocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const columns = [
    { key: 'new', label: 'New', dot: 'bg-red-500' },
    { key: 'in_progress', label: 'In Progress', dot: 'bg-amber-500' },
    { key: 'finished', label: 'Finished', dot: 'bg-green-500' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <style>{`
        @keyframes overdue-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4), inset 0 0 0 1px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.6), inset 0 0 0 1px rgba(239, 68, 68, 0.7); }
        }
        .card-overdue { border-color: rgba(239,68,68,0.5) !important; animation: overdue-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">GBP Management</h1>
                <p className="text-[10px] text-gray-500">Local SEO Specialist Hub</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors relative">
              GBP Locations
            </button>
            <button className="px-4 py-2.5 text-sm font-medium text-cyan-400 transition-colors relative">
              Local SEO Hub
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* SOP Library Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              <h2 className="text-base font-bold text-white">SOP Library</h2>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{filteredSops.length} documents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 w-48" placeholder="Search SOPs..." />
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium text-white transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add SOP
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5 mb-3">
            {['all', ...Object.keys(CATEGORY_CONFIG)].map(cat => (
              <button
                key={cat}
                onClick={() => setSopCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  sopCategory === cat ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat]?.label}
              </button>
            ))}
          </div>

          {/* SOP List */}
          <div className="space-y-1.5">
            {filteredSops.map(sop => {
              const catConf = CATEGORY_CONFIG[sop.category];
              const isExpanded = sopExpanded === sop.id;
              return (
                <div key={sop.id} className="border border-white/5 rounded-lg bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => setSopExpanded(isExpanded ? null : sop.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    <span className="text-sm font-medium text-white flex-1 text-left">{sop.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${catConf?.color}`}>{catConf?.label}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5">
                      <p className="text-xs text-gray-400 mt-3 mb-3">{sop.description}</p>
                      <div className="bg-white/[0.03] rounded-lg p-4 text-xs text-gray-300 leading-relaxed space-y-2">
                        {sop.content.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-white mt-2">{line.replace('## ', '')}</h3>;
                          if (line.startsWith('- ')) return <div key={i} className="flex gap-2 ml-2"><span className="text-gray-500">•</span><span>{line.replace('- ', '')}</span></div>;
                          if (line.trim()) return <p key={i}>{line}</p>;
                          return <div key={i} className="h-1" />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban Board Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              <h2 className="text-base font-bold text-white">Weekly Task Board</h2>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Mar 16 – Mar 22</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400 hover:bg-white/10 transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/></svg>
                Archive
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium text-white transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Task
              </button>
            </div>
          </div>

          {/* Company selector */}
          <div className="flex gap-2 mb-4">
            {companies.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedCompany === c ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>
                {c}
              </button>
            ))}
          </div>

          {/* Locations with Kanban */}
          <div className="space-y-3">
            {currentLocs.map(loc => {
              const locTasks = tasks[loc.id] || [];
              const isCollapsed = collapsedLocs.has(loc.id);
              const finishedCount = locTasks.filter(t => t.col === 'finished').length;
              return (
                <div key={loc.id} className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => toggleLoc(loc.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-xs font-medium text-white flex-1 text-left">{loc.address.split(',')[0]}</span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{finishedCount}/{locTasks.length} done</span>
                  </button>
                  {!isCollapsed && (
                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-3 gap-2">
                        {columns.map(col => {
                          const colTasks = locTasks.filter(t => t.col === col.key);
                          return (
                            <div key={col.key} className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
                              <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-white/5">
                                <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                                <span className="text-[10px] font-semibold text-white">{col.label}</span>
                                <span className="text-[9px] text-gray-500 bg-white/5 px-1 py-0.5 rounded-full">{colTasks.length}</span>
                              </div>
                              <div className="p-1.5 space-y-1.5 min-h-[60px]">
                                {colTasks.map(task => {
                                  const progress = getProgress(task.notes, task.title);
                                  return (
                                    <div
                                      key={task.id}
                                      className={`border rounded-lg p-2 bg-white/[0.03] transition-all cursor-pointer ${CARD_GLOW[task.col]}`}
                                    >
                                      <div className="flex items-center gap-1 mb-1">
                                        <svg className="w-2.5 h-2.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                                        <span className="text-[11px] font-medium text-white truncate">{task.title}</span>
                                      </div>
                                      {progress && progress.count > 0 && (
                                        <div className="mb-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className={`text-[9px] font-bold ${getProgressColor(progress.count, progress.target, progress.targetMin)}`}>
                                              {progress.count}/{progress.targetMin ? `${progress.targetMin}-${progress.target}` : progress.target}
                                            </span>
                                            <div className="flex-1 bg-white/5 rounded-full h-1">
                                              <div
                                                className={`h-1 rounded-full ${progress.count >= progress.target ? 'bg-green-500' : progress.targetMin && progress.count >= progress.targetMin ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, (progress.count / progress.target) * 100)}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        {task.dueDate && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border bg-white/5 text-gray-400 border-white/10">
                                            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                                            {formatDate(task.dueDate)}
                                          </span>
                                        )}
                                        {task.col === 'finished' && (
                                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium border bg-green-500/10 text-green-400 border-green-500/30">
                                            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {colTasks.length === 0 && (
                                  <div className="text-center py-3 text-gray-600 text-[9px]">Empty</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
