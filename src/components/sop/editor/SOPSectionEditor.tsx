import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Save,
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
import { cn } from '@/lib/utils';
import { SOPSection, SOPContentBlock } from '../types';
import SOPBlockEditor from './SOPBlockEditor';

interface SOPSectionEditorProps {
  section: SOPSection;
  sectionIndex: number;
  onUpdate: (section: SOPSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isNested?: boolean;
}

const SOPSectionEditor: React.FC<SOPSectionEditorProps> = ({
  section,
  sectionIndex,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isNested = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...section, title: newTitle });
  };

  const handleLevelChange = (newLevel: string) => {
    onUpdate({ ...section, level: parseInt(newLevel) as 1 | 2 | 3 });
  };

  const handleIdChange = (newId: string) => {
    // Convert to kebab-case
    const sanitizedId = newId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onUpdate({ ...section, id: sanitizedId });
  };

  const handleBlockUpdate = (index: number, updatedBlock: SOPContentBlock) => {
    const newContent = [...section.content];
    newContent[index] = updatedBlock;
    onUpdate({ ...section, content: newContent });
  };

  const handleBlockDelete = (index: number) => {
    const newContent = section.content.filter((_, i) => i !== index);
    onUpdate({ ...section, content: newContent });
  };

  const handleBlockMoveUp = (index: number) => {
    if (index === 0) return;
    const newContent = [...section.content];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    onUpdate({ ...section, content: newContent });
  };

  const handleBlockMoveDown = (index: number) => {
    if (index >= section.content.length - 1) return;
    const newContent = [...section.content];
    [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    onUpdate({ ...section, content: newContent });
  };

  const addNewBlock = (type: SOPContentBlock['type'] = 'paragraph') => {
    const newBlock: SOPContentBlock = { type };
    if (type === 'list') newBlock.items = [''];
    if (type === 'checklist') {
      newBlock.checklistItems = [{ id: `check-${Date.now()}`, text: '', defaultChecked: false }];
    }
    if (type === 'table') {
      newBlock.headers = ['Column 1', 'Column 2'];
      newBlock.rows = [['', '']];
    }
    if (type === 'alert') newBlock.alertType = 'info';
    if (type === 'code') newBlock.language = 'text';

    onUpdate({ ...section, content: [...section.content, newBlock] });
  };

  // Handle subsections
  const handleSubsectionUpdate = (index: number, updatedSubsection: SOPSection) => {
    const newSubsections = [...(section.subsections || [])];
    newSubsections[index] = updatedSubsection;
    onUpdate({ ...section, subsections: newSubsections });
  };

  const handleSubsectionDelete = (index: number) => {
    const newSubsections = (section.subsections || []).filter((_, i) => i !== index);
    onUpdate({ ...section, subsections: newSubsections.length ? newSubsections : undefined });
  };

  const addSubsection = () => {
    const newSubsection: SOPSection = {
      id: `subsection-${Date.now()}`,
      title: 'New Subsection',
      level: Math.min(section.level + 1, 3) as 1 | 2 | 3,
      content: [],
    };
    onUpdate({
      ...section,
      subsections: [...(section.subsections || []), newSubsection],
    });
  };

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        isNested ? 'border-border/30 bg-card/20' : 'border-cyan-500/30 bg-card/30'
      )}
    >
      {/* Section Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b',
          isNested ? 'bg-muted/10 border-border/30' : 'bg-cyan-500/10 border-cyan-500/20'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-cyan-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-cyan-400" />
          )}
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={section.id}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="Section ID (kebab-case)"
              className="w-40 h-8 text-xs bg-background/50"
            />
            <Input
              value={section.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Section Title"
              className="flex-1 h-8 bg-background/50"
            />
            <Select value={String(section.level)} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-24 h-8 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
              className="h-8 w-8 text-cyan-400"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span
              className={cn(
                'font-medium cursor-pointer hover:text-cyan-400',
                section.level === 1 && 'text-lg',
                section.level === 2 && 'text-base',
                section.level === 3 && 'text-sm'
              )}
              onClick={() => setIsEditing(true)}
            >
              {section.title}
            </span>
            <span className="text-xs text-muted-foreground">({section.id})</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
              L{section.level}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          {onMoveUp && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-7 px-2 text-xs"
            >
              ↑
            </Button>
          )}
          {onMoveDown && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-7 px-2 text-xs"
            >
              ↓
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Content Blocks */}
          <div className="space-y-3">
            {section.content.map((block, idx) => (
              <SOPBlockEditor
                key={idx}
                block={block}
                blockIndex={idx}
                onUpdate={(updatedBlock) => handleBlockUpdate(idx, updatedBlock)}
                onDelete={() => handleBlockDelete(idx)}
                onMoveUp={() => handleBlockMoveUp(idx)}
                onMoveDown={() => handleBlockMoveDown(idx)}
                canMoveUp={idx > 0}
                canMoveDown={idx < section.content.length - 1}
              />
            ))}
          </div>

          {/* Add Block Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('paragraph')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Paragraph
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('heading')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('code')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('list')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('checklist')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Checklist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('alert')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('table')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Table
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNewBlock('divider')}
              className="text-xs border-border/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Divider
            </Button>
          </div>

          {/* Subsections */}
          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-cyan-500/20">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subsections
              </h4>
              {section.subsections.map((sub, idx) => (
                <SOPSectionEditor
                  key={sub.id}
                  section={sub}
                  sectionIndex={idx}
                  onUpdate={(updated) => handleSubsectionUpdate(idx, updated)}
                  onDelete={() => handleSubsectionDelete(idx)}
                  isNested
                />
              ))}
            </div>
          )}

          {/* Add Subsection Button */}
          {section.level < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addSubsection}
              className="mt-2 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Subsection
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SOPSectionEditor;
