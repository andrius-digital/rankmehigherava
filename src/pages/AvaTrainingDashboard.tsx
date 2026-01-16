import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Video,
  Film,
  PenTool,
  Plus,
  AlertCircle,
  TrendingUp,
  Clock,
  Target,
  Star,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// Local storage based knowledge management
interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  priority: string;
  is_trained: boolean;
  created_at: string;
}

function getStoredKnowledge(): KnowledgeItem[] {
  const stored = localStorage.getItem('ava_knowledge');
  return stored ? JSON.parse(stored) : [];
}

function saveKnowledge(items: KnowledgeItem[]) {
  localStorage.setItem('ava_knowledge', JSON.stringify(items));
}

const categoryConfig = {
  company: { icon: Brain, label: 'Company Knowledge', color: '#00e5cc', gradient: 'from-cyan-500 to-teal-500' },
  vsl: { icon: Video, label: 'VSL Library', color: '#6366f1', gradient: 'from-indigo-500 to-purple-500' },
  reel: { icon: Film, label: 'Reel Scripts', color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  style: { icon: PenTool, label: 'Brand Voice', color: '#10b981', gradient: 'from-emerald-500 to-green-500' },
  faq: { icon: AlertCircle, label: 'FAQ', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
};

export default function AvaTrainingDashboard() {
  const [allKnowledge, setAllKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredKnowledge();
    setAllKnowledge(stored);
    setLoading(false);
  }, []);

  // Get items for selected category
  const knowledgeItems = selectedCategory 
    ? allKnowledge.filter(k => k.category === selectedCategory)
    : allKnowledge;

  // Calculate stats
  const getCategoryStats = (cat: string) => {
    const items = allKnowledge.filter(k => k.category === cat);
    return {
      count: items.length,
      pending: items.filter(k => !k.is_trained).length,
    };
  };

  function handleAddKnowledge(formData: any) {
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      category: formData.category,
      title: formData.title,
      content: formData.content,
      tags: formData.tags || [],
      priority: formData.priority || 'medium',
      is_trained: false,
      created_at: new Date().toISOString(),
    };
    
    const updated = [...allKnowledge, newItem];
    setAllKnowledge(updated);
    saveKnowledge(updated);
    setSelectedCategory(formData.category);
    setShowAddModal(false);
  }

  function handleMarkTrained(id: string) {
    const updated = allKnowledge.map(k => 
      k.id === id ? { ...k, is_trained: true } : k
    );
    setAllKnowledge(updated);
    saveKnowledge(updated);
  }

  function handleDelete(id: string) {
    const updated = allKnowledge.filter(k => k.id !== id);
    setAllKnowledge(updated);
    saveKnowledge(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00e5cc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AVA Training System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            to="/avaadminpanel"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all font-orbitron text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AVA Admin Panel
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2 font-orbitron">
            AVA Knowledge Base
          </h1>
          <p className="text-gray-400">Train and optimize AVA's intelligence</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a24] rounded-lg border border-white/5">
            <div
              className={`w-2 h-2 rounded-full ${
                allKnowledge.filter(k => !k.is_trained).length === 0 ? 'bg-green-500' : 'bg-amber-500'
              } animate-pulse`}
            />
            <span className="text-sm text-gray-400">
              {allKnowledge.filter(k => !k.is_trained).length === 0 ? 'All Trained' : 'Needs Attention'}
            </span>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#00e5cc] to-[#00b8a8] text-black font-semibold hover:shadow-lg hover:shadow-[#00e5cc]/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Target}
          label="Total Items"
          value={allKnowledge.length}
          trend={allKnowledge.length > 0 ? `+${allKnowledge.length}` : ''}
        />
        <MetricCard
          icon={Clock}
          label="Last Updated"
          value={allKnowledge.length > 0 ? formatTimeAgo(allKnowledge[allKnowledge.length - 1].created_at) : 'Never'}
        />
        <MetricCard
          icon={TrendingUp}
          label="Trained"
          value={`${allKnowledge.filter(k => k.is_trained).length}/${allKnowledge.length}`}
          progress={allKnowledge.length > 0 ? (allKnowledge.filter(k => k.is_trained).length / allKnowledge.length) * 100 : 0}
        />
        <MetricCard
          icon={Star}
          label="Pending"
          value={allKnowledge.filter(k => !k.is_trained).length}
          subtitle="items to train"
        />
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4 font-orbitron">Knowledge Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries(categoryConfig).map(([catKey, config]) => {
            const stats = getCategoryStats(catKey);
            const Icon = config.icon;

            return (
              <div
                key={catKey}
                className={`bg-[#1a1a24] border rounded-xl p-6 hover:border-[#00e5cc]/30 hover:-translate-y-1 transition-all cursor-pointer group ${
                  selectedCategory === catKey ? 'border-[#00e5cc]/50' : 'border-white/5'
                }`}
                onClick={() => setSelectedCategory(catKey)}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${config.gradient} opacity-20 group-hover:opacity-100 transition-opacity`}
                >
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{config.label}</h3>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-bold text-[#00e5cc]">{stats.count}</span>
                  <span className="text-sm text-gray-500 uppercase">Items</span>
                </div>
                {stats.pending > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-semibold mb-3">
                    <AlertCircle size={12} />
                    {stats.pending} pending
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(catKey);
                      setShowAddModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(catKey);
                    }}
                    className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Knowledge Browser */}
      {selectedCategory && (
        <div className="mb-8 bg-[#1a1a24] border border-white/5 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white font-orbitron">
              {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.label || selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          {knowledgeItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No knowledge items in this category yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#00e5cc] to-[#00b8a8] text-black font-semibold rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Knowledge
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-lg hover:bg-white/10 transition border-l-4 ${
                    item.is_trained 
                      ? 'bg-green-500/5 border-l-green-500' 
                      : 'bg-white/5 border-l-amber-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      {item.is_trained ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          Trained
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-xs font-semibold">
                          <Loader2 size={12} className="animate-spin" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.content}</p>
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#00e5cc]/10 text-[#00e5cc] rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-end">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        item.priority === 'high'
                          ? 'bg-red-500/10 text-red-500'
                          : item.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Trained</span>
                      <Switch
                        checked={item.is_trained}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleMarkTrained(item.id);
                          }
                        }}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-xs font-semibold border border-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddKnowledgeModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedCategory(null);
          }}
          onSave={handleAddKnowledge}
          defaultCategory={selectedCategory || 'company'}
        />
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, trend, subtitle, progress }: any) {
  return (
    <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 hover:border-[#00e5cc]/30 transition">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00e5cc]/10 to-[#6366f1]/10 flex items-center justify-center text-[#00e5cc]">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && <span className="text-sm text-green-500 font-semibold">{trend}</span>}
            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          </div>
          {progress !== undefined && (
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00e5cc] to-[#6366f1] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddKnowledgeModal({
  onClose,
  onSave,
  defaultCategory,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  defaultCategory: string;
}) {
  const [category, setCategory] = useState(defaultCategory);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const doSave = () => {
    setError('');
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!content.trim()) {
      setError('Please enter content');
      return;
    }
    
    setSaving(true);
    
    // Direct save to localStorage
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      category,
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
      is_trained: false,
      created_at: new Date().toISOString(),
    };
    
    const existing = getStoredKnowledge();
    const updated = [...existing, newItem];
    saveKnowledge(updated);
    
    onSave({
      category,
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
    });
    
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a24] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 sticky top-0 bg-[#1a1a24] z-10">
          <h2 className="text-2xl font-bold text-white font-orbitron">Add Knowledge</h2>
          <p className="text-gray-400 mt-1">Add new knowledge to AVA's database</p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Category</label>
            <select
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/20 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="company">Company Knowledge</option>
              <option value="vsl">VSL Library</option>
              <option value="reel">Reel Scripts</option>
              <option value="style">Brand Voice</option>
              <option value="faq">FAQ</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/20 outline-none"
              placeholder="e.g., Our company mission statement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Content</label>
            <textarea
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/20 outline-none resize-none"
              placeholder="Enter the knowledge content that AVA should learn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#00e5cc] focus:ring-2 focus:ring-[#00e5cc]/20 outline-none"
              placeholder="e.g., pricing, features, benefits"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Priority</label>
            <div className="flex gap-3">
              {['high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                    priority === p
                      ? 'bg-[#00e5cc] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  onClick={() => setPriority(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={doSave}
              className="flex-1 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#00e5cc] to-[#00b8a8] text-black hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Train'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

