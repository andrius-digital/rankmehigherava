import React, { useState } from 'react';
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Type,
  Code,
  List,
  CheckSquare,
  AlertTriangle,
  Table,
  Minus,
  Plus,
  Heading2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SOPContentBlock, SOPContentBlockType, AlertType, ChecklistItem } from '../types';

interface SOPBlockEditorProps {
  block: SOPContentBlock;
  blockIndex: number;
  onUpdate: (block: SOPContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const blockTypeIcons: Record<SOPContentBlockType, React.ElementType> = {
  paragraph: Type,
  heading: Heading2,
  code: Code,
  list: List,
  checklist: CheckSquare,
  alert: AlertTriangle,
  table: Table,
  divider: Minus,
};

const blockTypeLabels: Record<SOPContentBlockType, string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  code: 'Code Block',
  list: 'List',
  checklist: 'Checklist',
  alert: 'Alert Box',
  table: 'Table',
  divider: 'Divider',
};

const SOPBlockEditor: React.FC<SOPBlockEditorProps> = ({
  block,
  blockIndex,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = blockTypeIcons[block.type];

  const handleTypeChange = (newType: SOPContentBlockType) => {
    const newBlock: SOPContentBlock = { type: newType };

    // Preserve content where applicable
    if (block.content && ['paragraph', 'heading', 'code', 'alert'].includes(newType)) {
      newBlock.content = block.content;
    }

    // Set defaults for specific types
    if (newType === 'code') {
      newBlock.language = block.language || 'text';
    }
    if (newType === 'alert') {
      newBlock.alertType = block.alertType || 'info';
    }
    if (newType === 'list') {
      newBlock.items = block.items || [''];
      newBlock.ordered = block.ordered || false;
    }
    if (newType === 'checklist') {
      newBlock.checklistItems = block.checklistItems || [
        { id: `check-${Date.now()}`, text: '', defaultChecked: false },
      ];
    }
    if (newType === 'table') {
      newBlock.headers = block.headers || ['Column 1', 'Column 2'];
      newBlock.rows = block.rows || [['', '']];
    }

    onUpdate(newBlock);
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return (
          <Textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            placeholder={block.type === 'heading' ? 'Enter heading text...' : 'Enter paragraph text... (Use **text** for bold, `code` for inline code)'}
            className="min-h-[80px] bg-background/50 border-border/50"
          />
        );

      case 'code':
        return (
          <div className="space-y-2">
            <Input
              value={block.language || 'text'}
              onChange={(e) => onUpdate({ ...block, language: e.target.value })}
              placeholder="Language (e.g., bash, javascript, text)"
              className="bg-background/50 border-border/50 max-w-xs"
            />
            <Textarea
              value={block.content || ''}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder="Enter code..."
              className="min-h-[120px] bg-[#0d1117] font-mono text-sm text-gray-300 border-border/50"
            />
          </div>
        );

      case 'alert':
        return (
          <div className="space-y-2">
            <Select
              value={block.alertType || 'info'}
              onValueChange={(value) => onUpdate({ ...block, alertType: value as AlertType })}
            >
              <SelectTrigger className="w-40 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={block.content || ''}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              placeholder="Alert message..."
              className="min-h-[60px] bg-background/50 border-border/50"
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={block.ordered || false}
                onChange={(e) => onUpdate({ ...block, ordered: e.target.checked })}
                className="rounded"
              />
              Numbered list
            </label>
            <div className="space-y-1.5">
              {(block.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">
                    {block.ordered ? `${idx + 1}.` : '•'}
                  </span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [])];
                      newItems[idx] = e.target.value;
                      onUpdate({ ...block, items: newItems });
                    }}
                    placeholder="List item..."
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newItems = (block.items || []).filter((_, i) => i !== idx);
                      onUpdate({ ...block, items: newItems.length ? newItems : [''] });
                    }}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ ...block, items: [...(block.items || []), ''] })}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-1.5">
            {(block.checklistItems || []).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.defaultChecked || false}
                  onChange={(e) => {
                    const newItems = [...(block.checklistItems || [])];
                    newItems[idx] = { ...newItems[idx], defaultChecked: e.target.checked };
                    onUpdate({ ...block, checklistItems: newItems });
                  }}
                  className="rounded"
                  title="Default checked state"
                />
                <Input
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...(block.checklistItems || [])];
                    newItems[idx] = { ...newItems[idx], text: e.target.value };
                    onUpdate({ ...block, checklistItems: newItems });
                  }}
                  placeholder="Checklist item..."
                  className="flex-1 bg-background/50 border-border/50"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newItems = (block.checklistItems || []).filter((_, i) => i !== idx);
                    onUpdate({
                      ...block,
                      checklistItems: newItems.length
                        ? newItems
                        : [{ id: `check-${Date.now()}`, text: '', defaultChecked: false }],
                    });
                  }}
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onUpdate({
                  ...block,
                  checklistItems: [
                    ...(block.checklistItems || []),
                    { id: `check-${Date.now()}`, text: '', defaultChecked: false },
                  ],
                })
              }
              className="text-cyan-400 hover:text-cyan-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        );

      case 'table':
        const headers = block.headers || ['Column 1', 'Column 2'];
        const rows = block.rows || [['', '']];

        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newHeaders = [...headers, `Column ${headers.length + 1}`];
                  const newRows = rows.map((row) => [...row, '']);
                  onUpdate({ ...block, headers: newHeaders, rows: newRows });
                }}
                className="text-cyan-400 border-cyan-500/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRows = [...rows, headers.map(() => '')];
                  onUpdate({ ...block, rows: newRows });
                }}
                className="text-cyan-400 border-cyan-500/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
            </div>
            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    {headers.map((header, colIdx) => (
                      <th key={colIdx} className="relative p-2">
                        <Input
                          value={header}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[colIdx] = e.target.value;
                            onUpdate({ ...block, headers: newHeaders });
                          }}
                          className="bg-transparent border-0 text-center font-semibold p-0 h-auto"
                        />
                        {headers.length > 1 && (
                          <button
                            onClick={() => {
                              const newHeaders = headers.filter((_, i) => i !== colIdx);
                              const newRows = rows.map((row) =>
                                row.filter((_, i) => i !== colIdx)
                              );
                              onUpdate({ ...block, headers: newHeaders, rows: newRows });
                            }}
                            className="absolute top-0 right-0 p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-border/30 last:border-0">
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="p-2">
                          <Input
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...rows];
                              newRows[rowIdx] = [...newRows[rowIdx]];
                              newRows[rowIdx][colIdx] = e.target.value;
                              onUpdate({ ...block, rows: newRows });
                            }}
                            className="bg-transparent border-0 p-0 h-auto"
                          />
                        </td>
                      ))}
                      <td className="p-1 w-8">
                        {rows.length > 1 && (
                          <button
                            onClick={() => {
                              const newRows = rows.filter((_, i) => i !== rowIdx);
                              onUpdate({ ...block, rows: newRows });
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="py-2 text-center text-sm text-muted-foreground">
            Horizontal divider line
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border border-border/50 rounded-lg bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/30">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

        <div className="flex items-center gap-2 flex-1">
          <Icon className="h-4 w-4 text-cyan-400" />
          <Select value={block.type} onValueChange={(v) => handleTypeChange(v as SOPContentBlockType)}>
            <SelectTrigger className="w-36 h-7 text-xs bg-transparent border-0 p-0 pl-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(blockTypeLabels).map(([type, label]) => (
                <SelectItem key={type} value={type}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-7 w-7"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-7 w-7"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
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

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          {renderEditor()}
        </div>
      )}
    </div>
  );
};

export default SOPBlockEditor;
