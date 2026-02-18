import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Check, Copy, AlertTriangle, Info, CheckCircle2, AlertCircle, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOPContentBlock, AlertType, ChecklistItem } from './types';

interface SOPContentProps {
  blocks: SOPContentBlock[];
  searchQuery?: string;
}

// LocalStorage key for checklist state
const CHECKLIST_STORAGE_KEY = 'sop-checklist-progress';

// Cached checklist state
let checklistCache: Record<string, boolean> | null = null;

const getChecklistState = (): Record<string, boolean> => {
  if (checklistCache) return checklistCache;
  try {
    const stored = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    checklistCache = stored ? JSON.parse(stored) : {};
    return checklistCache;
  } catch {
    return {};
  }
};

const saveChecklistState = (state: Record<string, boolean>) => {
  checklistCache = state;
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

// Memoized text parsing - simpler version
const ParseText = memo(({ text }: { text: string }) => {
  // Handle bold (**text**) and inline code (`code`)
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1 py-0.5 bg-muted/50 rounded text-cyan-400 text-sm font-mono">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
});
ParseText.displayName = 'ParseText';

// Memoized Alert Component
const AlertBox = memo(({ type, content }: { type: AlertType; content: string }) => {
  const config = useMemo(() => ({
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', Icon: AlertTriangle },
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', Icon: Info },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', Icon: CheckCircle2 },
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', Icon: AlertCircle },
  }), []);

  const { bg, border, text, Icon } = config[type];

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', bg, border)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0', text)} />
      <p className={cn('text-sm', text)}>{content}</p>
    </div>
  );
});
AlertBox.displayName = 'AlertBox';

// Memoized Code Block - lighter version
const CodeBlock = memo(({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [code]);

  return (
    <div className="rounded-lg overflow-hidden bg-[#0d1117] border border-border/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded text-xs',
            copied ? 'bg-green-500/15 text-green-400' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto">
        <code className="text-sm font-mono text-gray-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

// Memoized Table Component
const TableBlock = memo(({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto rounded-lg border border-border/50">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-muted/30 border-b border-border/50">
          {headers.map((header, i) => (
            <th key={i} className="px-3 py-2 text-left font-semibold text-foreground">
              <ParseText text={header} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} className="border-b border-border/30 last:border-0">
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className="px-3 py-2 text-muted-foreground">
                <ParseText text={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));
TableBlock.displayName = 'TableBlock';

// Memoized Checklist Item
const ChecklistItemComponent = memo(({
  item,
  isChecked,
  onToggle
}: {
  item: ChecklistItem;
  isChecked: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={cn(
      'w-full flex items-start gap-2 p-2 rounded-lg border text-left transition-colors',
      isChecked ? 'bg-green-500/10 border-green-500/30' : 'bg-card/30 border-border/50 hover:border-border'
    )}
  >
    {isChecked ? (
      <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
    ) : (
      <Square className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    )}
    <span className={cn('text-sm', isChecked ? 'text-green-400 line-through opacity-70' : 'text-foreground')}>
      <ParseText text={item.text} />
    </span>
  </button>
));
ChecklistItemComponent.displayName = 'ChecklistItemComponent';

// Checklist Block
const ChecklistBlock = memo(({ items }: { items: ChecklistItem[] }) => {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(getChecklistState);

  const toggleItem = useCallback((itemId: string) => {
    setCheckedState(prev => {
      const newState = { ...prev, [itemId]: !prev[itemId] };
      saveChecklistState(newState);
      return newState;
    });
  }, []);

  return (
    <div className="space-y-1.5">
      {items.map(item => (
        <ChecklistItemComponent
          key={item.id}
          item={item}
          isChecked={checkedState[item.id] ?? item.defaultChecked ?? false}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
});
ChecklistBlock.displayName = 'ChecklistBlock';

// Memoized List Component
const ListBlock = memo(({ items, ordered }: { items: string[]; ordered?: boolean }) => (
  <ul className={cn('space-y-1', ordered && 'list-decimal list-inside')}>
    {items.map((item, i) => (
      <li key={i} className={cn('text-sm text-muted-foreground', !ordered && 'flex items-start gap-2')}>
        {!ordered && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />}
        <span><ParseText text={item} /></span>
      </li>
    ))}
  </ul>
));
ListBlock.displayName = 'ListBlock';

// Memoized Content Block Renderer
const ContentBlock = memo(({ block }: { block: SOPContentBlock }) => {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-sm text-muted-foreground leading-relaxed"><ParseText text={block.content || ''} /></p>;

    case 'heading':
      return (
        <h3 className="text-base font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-400 rounded-full" />
          {block.content}
        </h3>
      );

    case 'code':
      return <CodeBlock code={block.content || ''} language={block.language} />;

    case 'alert':
      return <AlertBox type={block.alertType || 'info'} content={block.content || ''} />;

    case 'table':
      return <TableBlock headers={block.headers || []} rows={block.rows || []} />;

    case 'list':
      return <ListBlock items={block.items || []} ordered={block.ordered} />;

    case 'checklist':
      return <ChecklistBlock items={block.checklistItems || []} />;

    case 'divider':
      return <hr className="my-4 border-border/50" />;

    default:
      return null;
  }
});
ContentBlock.displayName = 'ContentBlock';

// Main SOPContent Component - Memoized
const SOPContent: React.FC<SOPContentProps> = memo(({ blocks }) => {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <ContentBlock key={idx} block={block} />
      ))}
    </div>
  );
});
SOPContent.displayName = 'SOPContent';

export default SOPContent;
