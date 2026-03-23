import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { TeamTask, TaskPriority, TaskStatus, TeamMember } from './types';
import { PRIORITY_CONFIG, STATUS_COLUMNS, LABEL_PRESETS } from './types';

interface TaskModalProps {
  task: Partial<TeamTask> | null;
  members: TeamMember[];
  isAdmin: boolean;
  isManager: boolean;
  onSave: (task: Partial<TeamTask>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, members, isAdmin, isManager, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
    assignee_id: '',
    assignee_name: '',
    labels: [] as string[],
    notes: '',
  });
  const [showLabels, setShowLabels] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        assignee_id: task.assignee_id || '',
        assignee_name: task.assignee_name || '',
        labels: task.labels || [],
        notes: task.notes || '',
      });
    }
  }, [task]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave({
      ...task,
      ...form,
      due_date: form.due_date || null,
    });
  };

  const toggleLabel = (label: string) => {
    setForm(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label],
    }));
  };

  const addCustomLabel = () => {
    if (customLabel.trim() && !form.labels.includes(customLabel.trim())) {
      setForm(prev => ({ ...prev, labels: [...prev.labels, customLabel.trim()] }));
      setCustomLabel('');
    }
  };

  const handleAssigneeChange = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setForm(prev => ({
      ...prev,
      assignee_id: memberId,
      assignee_name: member?.name || '',
    }));
  };

  const isEdit = !!(task?.id);
  const canAssign = isAdmin || isManager;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-orbitron font-bold text-base">{isEdit ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Title *</label>
            <Input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              >
                {STATUS_COLUMNS.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
              >
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <Input
                type="date"
                value={form.due_date}
                onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
            {canAssign && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Assignee</label>
                <select
                  value={form.assignee_id}
                  onChange={e => handleAssigneeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                >
                  <option value="">Select member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase hover:text-foreground transition-colors"
            >
              <Tag className="w-3 h-3" /> Labels ({form.labels.length})
            </button>
            {showLabels && (
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {LABEL_PRESETS.map(label => (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${
                        form.labels.includes(label)
                          ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="Custom label"
                    className="bg-white/5 border-white/10 text-xs h-8"
                    onKeyDown={e => e.key === 'Enter' && addCustomLabel()}
                  />
                  <button
                    onClick={addCustomLabel}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            {form.labels.length > 0 && !showLabels && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {form.labels.map((label, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-sm hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
