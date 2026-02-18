import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  GripVertical,
  Wrench,
  Palette,
  Zap,
  Bug,
  FileText,
  BookOpen,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { SOPTab } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  Palette,
  Zap,
  Bug,
  FileText,
  BookOpen,
  Settings,
  HelpCircle,
};

const availableIcons = [
  { value: 'Wrench', label: 'Wrench' },
  { value: 'Palette', label: 'Palette' },
  { value: 'Zap', label: 'Lightning' },
  { value: 'Bug', label: 'Bug' },
  { value: 'FileText', label: 'Document' },
  { value: 'BookOpen', label: 'Book' },
  { value: 'Settings', label: 'Settings' },
  { value: 'HelpCircle', label: 'Help' },
];

interface SOPTabEditorProps {
  tabs: SOPTab[];
  activeTab: string;
  onTabSelect: (tabId: string) => void;
  onTabCreate: (tab: SOPTab) => void;
  onTabUpdate: (tabId: string, updates: Partial<SOPTab>) => void;
  onTabDelete: (tabId: string) => void;
  onTabReorder: (tabs: SOPTab[]) => void;
}

const SOPTabEditor: React.FC<SOPTabEditorProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onTabCreate,
  onTabUpdate,
  onTabDelete,
  onTabReorder,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTab, setNewTab] = useState<Partial<SOPTab>>({
    id: '',
    label: '',
    icon: 'FileText',
    description: '',
  });

  const handleCreateTab = () => {
    if (!newTab.id || !newTab.label) return;

    // Ensure unique ID
    const sanitizedId = newTab.id.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existingIds = tabs.map((t) => t.id);
    if (existingIds.includes(sanitizedId as SOPTab['id'])) {
      alert('A tab with this ID already exists');
      return;
    }

    onTabCreate({
      id: sanitizedId as SOPTab['id'],
      label: newTab.label,
      icon: newTab.icon || 'FileText',
      description: newTab.description || '',
    });

    setNewTab({ id: '', label: '', icon: 'FileText', description: '' });
    setIsCreating(false);
  };

  const handleMoveTab = (index: number, direction: 'up' | 'down') => {
    const newTabs = [...tabs];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tabs.length) return;

    [newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
    onTabReorder(newTabs);
  };

  return (
    <div className="space-y-4">
      {/* Tab List */}
      <div className="space-y-2">
        {tabs.map((tab, index) => {
          const Icon = iconMap[tab.icon] || FileText;
          const isEditing = editingTabId === tab.id;

          return (
            <div
              key={tab.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                activeTab === tab.id
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-card/30 border-border/50 hover:border-border'
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={tab.label}
                    onChange={(e) => onTabUpdate(tab.id, { label: e.target.value })}
                    className="h-8 bg-background/50"
                    placeholder="Tab Label"
                  />
                  <Select
                    value={tab.icon}
                    onValueChange={(value) => onTabUpdate(tab.id, { icon: value })}
                  >
                    <SelectTrigger className="w-32 h-8 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={tab.description}
                    onChange={(e) => onTabUpdate(tab.id, { description: e.target.value })}
                    className="h-8 bg-background/50 flex-1"
                    placeholder="Description"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTabId(null)}
                    className="h-8 w-8"
                  >
                    <Save className="h-4 w-4 text-cyan-400" />
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onTabSelect(tab.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        activeTab === tab.id ? 'text-cyan-400' : 'text-muted-foreground'
                      )}
                    />
                    <div>
                      <div
                        className={cn(
                          'font-medium text-sm',
                          activeTab === tab.id ? 'text-cyan-400' : 'text-foreground'
                        )}
                      >
                        {tab.label}
                      </div>
                      {tab.description && (
                        <div className="text-xs text-muted-foreground">{tab.description}</div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveTab(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveTab(index, 'down')}
                      disabled={index === tabs.length - 1}
                      className="h-7 w-7"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTabId(tab.id)}
                      className="h-7 w-7"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-red-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tab</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{tab.label}"? This will also delete
                            all sections and content within this tab. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onTabDelete(tab.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Create New Tab */}
      {isCreating ? (
        <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 space-y-3">
          <h4 className="text-sm font-semibold text-cyan-400">Create New Tab</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={newTab.id || ''}
              onChange={(e) =>
                setNewTab({
                  ...newTab,
                  id: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              placeholder="Tab ID (e.g., my-tab)"
              className="bg-background/50"
            />
            <Input
              value={newTab.label || ''}
              onChange={(e) => setNewTab({ ...newTab, label: e.target.value })}
              placeholder="Tab Label"
              className="bg-background/50"
            />
            <Select
              value={newTab.icon || 'FileText'}
              onValueChange={(value) => setNewTab({ ...newTab, icon: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newTab.description || ''}
              onChange={(e) => setNewTab({ ...newTab, description: e.target.value })}
              placeholder="Description (optional)"
              className="bg-background/50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateTab}
              disabled={!newTab.id || !newTab.label}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Tab
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="w-full border-dashed border-cyan-500/30 text-cyan-400 hover:border-cyan-500/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Tab
        </Button>
      )}
    </div>
  );
};

export default SOPTabEditor;
