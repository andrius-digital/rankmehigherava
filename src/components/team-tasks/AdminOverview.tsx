import React, { useState } from 'react';
import { Users, AlertTriangle, CheckCircle2, Clock, BarChart3, ChevronRight, Calendar, Tag, ListTodo, Eye } from 'lucide-react';
import type { TeamTask, TeamMember, TaskStatus, TaskPriority } from './types';
import { STATUS_COLUMNS, PRIORITY_CONFIG } from './types';

interface AdminOverviewProps {
  members: TeamMember[];
  tasks: TeamTask[];
  onSelectMember: (memberId: string | null) => void;
  selectedMemberId: string | null;
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(dueDate + 'T00:00:00') < now;
}

function isDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = (due.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= 2;
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type ViewTab = 'overview' | 'all-tasks';
type FilterKey = TaskStatus | 'all' | 'overdue' | 'active';

const AdminOverview: React.FC<AdminOverviewProps> = ({ members, tasks, onSelectMember, selectedMemberId }) => {
  const [viewTab, setViewTab] = useState<ViewTab>('overview');
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'assignee' | 'status'>('priority');

  const memberStats = members.map(member => {
    const memberTasks = tasks.filter(t => t.assignee_id === member.id);
    const total = memberTasks.length;
    const done = memberTasks.filter(t => t.status === 'done').length;
    const overdue = memberTasks.filter(t => isOverdue(t.due_date, t.status)).length;
    const inProgress = memberTasks.filter(t => t.status === 'in_progress').length;
    const todo = memberTasks.filter(t => t.status === 'todo').length;
    const inReview = memberTasks.filter(t => t.status === 'in_review').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { member, total, done, overdue, inProgress, todo, inReview, completionRate };
  });

  const totalTasks = tasks.length;
  const totalDone = tasks.filter(t => t.status === 'done').length;
  const totalOverdue = tasks.filter(t => isOverdue(t.due_date, t.status)).length;
  const totalInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const totalTodo = tasks.filter(t => t.status === 'todo').length;
  const totalInReview = tasks.filter(t => t.status === 'in_review').length;
  const totalDueSoon = tasks.filter(t => isDueSoon(t.due_date, t.status)).length;
  const completionRate = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const statusOrder: Record<string, number> = { todo: 0, in_progress: 1, in_review: 2, done: 3 };

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') return isOverdue(t.due_date, t.status);
    if (statusFilter === 'active') return t.status === 'in_progress' || t.status === 'in_review';
    return t.status === statusFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    if (sortBy === 'due_date') {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    if (sortBy === 'assignee') return (a.assignee_name || '').localeCompare(b.assignee_name || '');
    if (sortBy === 'status') return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
    return 0;
  });

  const statusDotColor: Record<TaskStatus, string> = {
    todo: 'bg-blue-400',
    in_progress: 'bg-amber-400',
    in_review: 'bg-purple-400',
    done: 'bg-green-400',
  };

  const statusLabel: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Tasks</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-orbitron font-bold text-foreground">{totalTasks}</p>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{completionRate}% done</p>
              <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden mt-0.5">
                <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => { setViewTab('all-tasks'); setStatusFilter('active'); }} className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active</span>
          </div>
          <p className="text-3xl font-orbitron font-bold text-amber-400">{totalInProgress + totalInReview}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{totalInProgress} wip · {totalInReview} review</p>
        </button>
        <button onClick={() => { setViewTab('all-tasks'); setStatusFilter('all'); setSortBy('due_date'); }} className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-3xl font-orbitron font-bold text-green-400">{totalDone}</p>
          {totalDueSoon > 0 && <p className="text-[10px] text-amber-400 mt-0.5">{totalDueSoon} due soon</p>}
        </button>
        <button onClick={() => { setViewTab('all-tasks'); setStatusFilter('overdue'); }} className={`p-4 rounded-xl border text-left transition-all ${totalOverdue > 0 ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${totalOverdue > 0 ? 'text-red-400' : 'text-muted-foreground'}`} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overdue</span>
          </div>
          <p className={`text-3xl font-orbitron font-bold ${totalOverdue > 0 ? 'text-red-400' : 'text-foreground'}`}>{totalOverdue}</p>
          {totalOverdue > 0 && <p className="text-[10px] text-red-400/70 mt-0.5">Needs attention</p>}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setViewTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewTab === 'overview' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-3.5 h-3.5" /> Team Overview
        </button>
        <button
          onClick={() => { setViewTab('all-tasks'); setStatusFilter('all'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewTab === 'all-tasks' ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground'}`}
        >
          <ListTodo className="w-3.5 h-3.5" /> All Tasks
        </button>
      </div>

      {viewTab === 'overview' && (
        <div className="space-y-3">
          {totalOverdue > 0 && (
            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-400">Overdue Tasks</span>
              </div>
              <div className="space-y-1.5">
                {tasks.filter(t => isOverdue(t.due_date, t.status)).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-red-500/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_CONFIG[t.priority as TaskPriority]?.dot || 'bg-gray-400'}`} />
                      <span className="text-foreground font-medium truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-muted-foreground">{t.assignee_name}</span>
                      <span className="text-red-400 font-bold">{formatDate(t.due_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => onSelectMember(null)}
              className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 text-left hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">All Tasks Board</p>
                  <p className="text-[10px] text-muted-foreground">View combined Kanban</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {STATUS_COLUMNS.map(col => {
                  const count = tasks.filter(t => t.status === col.key).length;
                  return (
                    <div key={col.key} className={`text-center py-1.5 rounded-lg ${col.bgColor}`}>
                      <p className="text-sm font-bold font-orbitron">{count}</p>
                      <p className="text-[8px] text-muted-foreground uppercase">{col.label.split(' ')[0]}</p>
                    </div>
                  );
                })}
              </div>
            </button>

            {memberStats.map(({ member, total, done, overdue, inProgress, todo, inReview, completionRate }) => (
              <button
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <span className="font-orbitron font-bold text-sm text-cyan-400">{member.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
                      {member.is_manager && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/20 border border-purple-500/30 text-purple-400">MGR</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden flex">
                    {total > 0 && (
                      <>
                        {todo > 0 && <div className="h-full bg-blue-400" style={{ width: `${(todo / total) * 100}%` }} />}
                        {inProgress > 0 && <div className="h-full bg-amber-400" style={{ width: `${(inProgress / total) * 100}%` }} />}
                        {inReview > 0 && <div className="h-full bg-purple-400" style={{ width: `${(inReview / total) * 100}%` }} />}
                        {done > 0 && <div className="h-full bg-green-400" style={{ width: `${(done / total) * 100}%` }} />}
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold w-8 text-right">{completionRate}%</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                  <div className="text-center py-1 rounded bg-blue-500/10"><span className="text-blue-400 font-bold">{todo}</span> <span className="text-muted-foreground">todo</span></div>
                  <div className="text-center py-1 rounded bg-amber-500/10"><span className="text-amber-400 font-bold">{inProgress}</span> <span className="text-muted-foreground">wip</span></div>
                  <div className="text-center py-1 rounded bg-purple-500/10"><span className="text-purple-400 font-bold">{inReview}</span> <span className="text-muted-foreground">review</span></div>
                  <div className="text-center py-1 rounded bg-green-500/10"><span className="text-green-400 font-bold">{done}</span> <span className="text-muted-foreground">done</span></div>
                </div>
                {overdue > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-bold">{overdue} overdue</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewTab === 'all-tasks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {([
                { key: 'all' as FilterKey, label: 'All', count: tasks.length },
                { key: 'todo' as FilterKey, label: 'To Do', count: totalTodo },
                { key: 'active' as FilterKey, label: 'Active', count: totalInProgress + totalInReview },
                { key: 'in_review' as FilterKey, label: 'Review', count: totalInReview },
                { key: 'done' as FilterKey, label: 'Done', count: totalDone },
                { key: 'overdue' as FilterKey, label: 'Overdue', count: totalOverdue },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    statusFilter === f.key
                      ? f.key === 'overdue' ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                      : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label} <span className="opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground focus:outline-none"
            >
              <option value="priority">Sort: Priority</option>
              <option value="due_date">Sort: Due Date</option>
              <option value="assignee">Sort: Assignee</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks match this filter</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_90px] gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Task</span>
                <span>Assignee</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Due</span>
              </div>
              <div className="divide-y divide-white/5">
                {sortedTasks.map(task => {
                  const overdue = isOverdue(task.due_date, task.status);
                  const dueSoon = isDueSoon(task.due_date, task.status);
                  return (
                    <div
                      key={task.id}
                      className={`px-4 py-3 hover:bg-white/[0.03] transition-colors ${overdue ? 'bg-red-500/[0.03]' : ''}`}
                    >
                      <div className="md:grid md:grid-cols-[1fr_120px_100px_100px_90px] md:gap-2 md:items-center">
                        <div className="flex items-start gap-2 mb-1 md:mb-0">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_CONFIG[task.priority as TaskPriority]?.dot || 'bg-gray-400'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                            {task.labels.length > 0 && (
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {task.labels.map(l => (
                                  <span key={l} className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 text-muted-foreground">{l}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex md:block items-center gap-2 text-xs mb-1 md:mb-0">
                          <span className="md:hidden text-muted-foreground text-[10px]">Assignee:</span>
                          <span className="text-foreground font-medium truncate">{task.assignee_name || '—'}</span>
                        </div>
                        <div className="flex md:block items-center gap-2 mb-1 md:mb-0">
                          <span className="md:hidden text-muted-foreground text-[10px]">Status:</span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor[task.status]}`} />
                            {statusLabel[task.status]}
                          </span>
                        </div>
                        <div className="flex md:block items-center gap-2 mb-1 md:mb-0">
                          <span className="md:hidden text-muted-foreground text-[10px]">Priority:</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_CONFIG[task.priority as TaskPriority]?.color || ''}`}>
                            {PRIORITY_CONFIG[task.priority as TaskPriority]?.label || task.priority}
                          </span>
                        </div>
                        <div className="flex md:block items-center gap-2">
                          <span className="md:hidden text-muted-foreground text-[10px]">Due:</span>
                          <span className={`text-xs font-medium ${overdue ? 'text-red-400 font-bold' : dueSoon ? 'text-amber-400' : 'text-muted-foreground'}`}>
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
