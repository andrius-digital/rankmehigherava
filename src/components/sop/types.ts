// SOP Documentation System Types

export type SOPTabId = 'technical' | 'design' | 'quickref' | 'troubleshooting';

export interface SOPTab {
  id: SOPTabId;
  label: string;
  icon: string;
  description: string;
}

export interface SOPSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  content: SOPContentBlock[];
  subsections?: SOPSection[];
}

export type SOPContentBlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'table'
  | 'list'
  | 'checklist'
  | 'alert'
  | 'divider';

export type AlertType = 'warning' | 'info' | 'success' | 'critical';

export interface SOPContentBlock {
  type: SOPContentBlockType;
  content?: string;
  language?: string; // for code blocks
  alertType?: AlertType; // for alerts
  items?: string[]; // for lists
  checklistItems?: ChecklistItem[]; // for checklists
  ordered?: boolean; // for numbered lists
  headers?: string[]; // for tables
  rows?: string[][]; // for tables
}

export interface ChecklistItem {
  id: string;
  text: string;
  defaultChecked?: boolean;
}

export interface SOPDocument {
  id: string;
  tabId: SOPTabId;
  title: string;
  description: string;
  lastUpdated: string;
  version: string;
  sections: SOPSection[];
}

export interface SOPChecklistState {
  [itemId: string]: boolean;
}

export interface SOPSearchResult {
  sectionId: string;
  sectionTitle: string;
  matchedText: string;
  tabId: SOPTabId;
}
