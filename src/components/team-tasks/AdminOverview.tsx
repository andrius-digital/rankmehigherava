import React from 'react';
import { Users, AlertTriangle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import type { TeamTask, TeamMember } from './types';

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

const AdminOverview: React.FC<AdminOverviewProps> = ({ members, tasks, onSelectMember, selectedMemberId }) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Tasks</span>
          </div>
          <p className="text-2xl font-orbitron font-bold text-foreground">{totalTasks}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</span>
          </div>
          <p className="text-2xl font-orbitron font-bold text-foreground">{totalInProgress}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed</span>
          </div>
          <p className="text-2xl font-orbitron font-bold text-foreground">{totalDone}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Overdue</span>
          </div>
          <p className="text-2xl font-orbitron font-bold text-red-400">{totalOverdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          onClick={() => onSelectMember(null)}
          className={`p-3 rounded-xl border transition-all text-left ${
            selectedMemberId === null
              ? 'bg-cyan-500/10 border-cyan-500/30'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">All Members</p>
              <p className="text-[10px] text-muted-foreground">View all tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{totalTasks} total</span>
            <span className="text-green-400">{totalDone} done</span>
            {totalOverdue > 0 && <span className="text-red-400">{totalOverdue} overdue</span>}
          </div>
        </button>

        {memberStats.map(({ member, total, done, overdue, inProgress, todo, inReview, completionRate }) => (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className={`p-3 rounded-xl border transition-all text-left ${
              selectedMemberId === member.id
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <span className="font-orbitron font-bold text-xs text-cyan-400">{member.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
              </div>
              {member.is_manager && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/20 border border-purple-500/30 text-purple-400">MGR</span>
              )}
            </div>

            <div className="w-full h-1.5 rounded-full bg-white/5 mb-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground">{total} tasks</span>
              <span className="text-blue-400">{todo} to do</span>
              <span className="text-amber-400">{inProgress} wip</span>
              <span className="text-purple-400">{inReview} review</span>
              <span className="text-green-400">{done} done</span>
              {overdue > 0 && <span className="text-red-400 font-bold">{overdue} overdue</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
