import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Activity, Building2, MapPin, ClipboardList, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchActivityLog, formatRelativeTime, type ActivityLogEntry, type EntityType } from '@/utils/activityLog';

const ENTITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  company: Building2,
  location: MapPin,
  task: ClipboardList,
  sop: BookOpen,
};

const ENTITY_COLORS: Record<string, string> = {
  company: 'bg-cyan-500/20 text-cyan-400',
  location: 'bg-purple-500/20 text-purple-400',
  task: 'bg-amber-500/20 text-amber-400',
  sop: 'bg-green-500/20 text-green-400',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  move: 'Moved',
  status_change: 'Changed status',
};

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'company', label: 'Companies' },
  { key: 'location', label: 'Locations' },
  { key: 'task', label: 'Tasks' },
  { key: 'sop', label: 'SOPs' },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const ActivityLogModal: React.FC<Props> = ({ open, onClose }) => {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchActivityLog(
      200,
      filter === 'all' ? undefined : (filter as EntityType),
      search || undefined
    );
    setEntries(data);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
      <div className="modal-mobile-full bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-orbitron">Activity Log</h2>
          </div>
          <button onClick={onClose} className="h-11 w-11 sm:h-8 sm:w-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 space-y-3 shrink-0 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search activity..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[44px] sm:h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  filter === tab.key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 custom-scrollbar-minty">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading activity...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No activity found</div>
          ) : (
            <div className="space-y-1">
              {entries.map(entry => {
                const Icon = ENTITY_ICONS[entry.entity_type] || ClipboardList;
                const iconColor = ENTITY_COLORS[entry.entity_type] || 'bg-gray-500/20 text-gray-400';
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-cyan-400">{getInitials(entry.user_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 leading-snug">{entry.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${iconColor}`}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{entry.entity_type}</span>
                        </div>
                        <span className="text-[11px] text-gray-500">{entry.user_name}</span>
                        <span className="text-[11px] text-gray-600">·</span>
                        <span className="text-[11px] text-gray-500">{formatRelativeTime(entry.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;
