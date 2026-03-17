import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronRight,
  BookOpen, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

type SOPRow = Database['public']['Tables']['sops']['Row'];
type SOP = SOPRow;

const EMPTY_SOP = { title: '', category: 'gbp', description: '', content: '' };

const SOPLibrary: React.FC = () => {
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_SOP);

  const fetchSops = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sops')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSops(data || []);
    } catch {
      toast.error('Failed to load SOPs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSops(); }, [fetchSops]);

  const filtered = sops.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  const openAdd = () => { setEditingId(null); setForm(EMPTY_SOP); setModalOpen(true); };
  const openEdit = (s: SOP) => {
    setEditingId(s.id);
    setForm({ title: s.title, category: s.category || 'gbp', description: s.description, content: s.content });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      if (editingId) {
        const { error } = await supabase.from('sops').update({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          content: form.content,
        }).eq('id', editingId);
        if (error) throw error;
        toast.success('SOP updated');
      } else {
        const { error } = await supabase.from('sops').insert({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          content: form.content,
        });
        if (error) throw error;
        toast.success('SOP added');
      }
      setModalOpen(false);
      fetchSops();
    } catch { toast.error('Failed to save SOP'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
      toast.success('SOP deleted');
      if (expandedId === id) setExpandedId(null);
      fetchSops();
    } catch { toast.error('Failed to delete SOP'); }
  };

  const renderMarkdown = (md: string) => {
    const html = marked.parse(md, { breaks: true }) as string;
    let processed = DOMPurify.sanitize(html);
    processed = processed.replace(
      /\[([A-Z][A-Z\s\/\-"]+)\]/g,
      '<code class="sop-variable">[$1]</code>'
    );
    return processed;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">SOP Library</h2>
          <span className="text-xs text-gray-500">({sops.length} procedures)</span>
        </div>
        <Button onClick={openAdd} className="bg-[#00e5cc]/10 border border-[#00e5cc]/30 text-[#00e5cc] hover:bg-[#00e5cc]/20 hover:shadow-[0_0_15px_rgba(0,229,204,0.15)] gap-2 text-xs transition-all">
          <Plus className="w-3.5 h-3.5" /> Add SOP
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search SOPs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading SOPs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No SOPs found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(sop => {
            const isExpanded = expandedId === sop.id;
            return (
              <div
                key={sop.id}
                className={`border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm transition-all ${isExpanded ? 'md:col-span-2' : ''}`}
              >
                <div
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : sop.id)}
                >
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm truncate">{sop.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{sop.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEdit(sop)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => handleDelete(sop.id, sop.title)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-white/10 px-5 py-5 bg-white/[0.01]">
                    <div
                      className="sop-content prose prose-invert prose-sm max-w-none prose-headings:text-cyan-400 prose-a:text-cyan-400 prose-strong:text-white prose-li:text-gray-300 prose-p:text-gray-300 prose-blockquote:border-cyan-500/30 prose-blockquote:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(sop.content) }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit SOP' : 'Add SOP'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Short Description</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Content (Markdown supported)</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={12}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none resize-none font-mono"
                  placeholder="Write your SOP content in Markdown..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#00e5cc]/10 border border-[#00e5cc]/30 text-[#00e5cc] hover:bg-[#00e5cc]/20 hover:shadow-[0_0_15px_rgba(0,229,204,0.15)] transition-all">{editingId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOPLibrary;
