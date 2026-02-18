import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Search, Printer, ChevronRight, ChevronDown, Wrench, Palette, Zap, Bug, BookOpen, Edit3, Eye, Save, Loader2, Settings2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { SOPTab, SOPTabId, SOPSection, SOPSearchResult, SOPDocument, SOPContentBlock } from './types';
import { SOP_TABS, ALL_SOP_DOCUMENTS, getSopByTabId } from './sopData';
import SOPContent from './SOPContent';
import { SOPTabEditor, SOPDocumentEditor } from './editor';
import * as sopService from '@/services/sopService';

interface SOPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_ICONS: Record<string, React.ElementType> = {
  Wrench,
  Palette,
  Zap,
  Bug,
  FileText: BookOpen,
  BookOpen,
  Settings: Settings2,
  HelpCircle: BookOpen,
};

const SOPModal: React.FC<SOPModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('technical');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);

  // Database state
  const [dbTabs, setDbTabs] = useState<SOPTab[]>([]);
  const [dbDocuments, setDbDocuments] = useState<Map<string, SOPDocument>>(new Map());
  const [hasDbData, setHasDbData] = useState(false);

  // Get current tabs and document
  const currentTabs = useMemo(() => {
    return useDatabase && hasDbData ? dbTabs : SOP_TABS;
  }, [useDatabase, hasDbData, dbTabs]);

  const currentDocument = useMemo(() => {
    if (useDatabase && hasDbData) {
      return dbDocuments.get(activeTab) || null;
    }
    return getSopByTabId(activeTab) || null;
  }, [activeTab, useDatabase, hasDbData, dbDocuments]);

  // Check for database data on mount
  useEffect(() => {
    const checkDbData = async () => {
      try {
        const hasData = await sopService.hasSOPData();
        setHasDbData(hasData);
        if (hasData) {
          setUseDatabase(true);
          await loadFromDatabase();
        }
      } catch (error) {
        console.error('Error checking database:', error);
      }
    };

    if (isOpen) {
      checkDbData();
    }
  }, [isOpen]);

  // Load data from database
  const loadFromDatabase = async () => {
    setIsLoading(true);
    try {
      const tabs = await sopService.fetchAllTabs();
      setDbTabs(tabs);

      const docs = new Map<string, SOPDocument>();
      for (const tab of tabs) {
        const doc = await sopService.fetchDocumentByTabId(tab.id);
        if (doc) {
          docs.set(tab.id, doc);
        }
      }
      setDbDocuments(docs);
      setHasDbData(true);
      setUseDatabase(true);
    } catch (error) {
      console.error('Error loading from database:', error);
      toast({
        title: 'Error',
        description: 'Failed to load from database. Using static data.',
        variant: 'destructive',
      });
      setUseDatabase(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Seed database with static data
  const seedDatabase = async () => {
    setIsLoading(true);
    try {
      await sopService.seedSOPData(SOP_TABS, ALL_SOP_DOCUMENTS);
      await loadFromDatabase();
      toast({
        title: 'Success',
        description: 'Database seeded with SOP content.',
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-expand first section on tab change
  useEffect(() => {
    if (currentDocument?.sections[0]) {
      setExpandedSections(new Set([currentDocument.sections[0].id]));
      setActiveSectionId(currentDocument.sections[0].id);
    }
  }, [activeTab, currentDocument]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    setActiveSectionId(sectionId);
  }, []);

  // Search functionality
  const searchResults = useMemo((): SOPSearchResult[] => {
    if (!searchQuery.trim()) return [];

    const results: SOPSearchResult[] = [];
    const query = searchQuery.toLowerCase();
    const docsToSearch = useDatabase && hasDbData ? Array.from(dbDocuments.values()) : ALL_SOP_DOCUMENTS;

    docsToSearch.forEach((doc) => {
      doc.sections.forEach((section) => {
        // Search in section title
        if (section.title.toLowerCase().includes(query)) {
          results.push({
            sectionId: section.id,
            sectionTitle: section.title,
            matchedText: section.title,
            tabId: doc.tabId,
          });
        }

        // Search in content
        section.content.forEach((block) => {
          if (block.content?.toLowerCase().includes(query)) {
            const matchIndex = block.content.toLowerCase().indexOf(query);
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(block.content.length, matchIndex + query.length + 30);
            const matchedText = (start > 0 ? '...' : '') + block.content.slice(start, end) + (end < block.content.length ? '...' : '');

            // Avoid duplicates
            if (!results.some((r) => r.sectionId === section.id && r.tabId === doc.tabId)) {
              results.push({
                sectionId: section.id,
                sectionTitle: section.title,
                matchedText,
                tabId: doc.tabId,
              });
            }
          }

          // Search in list items
          if (block.items) {
            block.items.forEach((item) => {
              if (item.toLowerCase().includes(query)) {
                if (!results.some((r) => r.sectionId === section.id && r.tabId === doc.tabId)) {
                  results.push({
                    sectionId: section.id,
                    sectionTitle: section.title,
                    matchedText: item.length > 60 ? item.slice(0, 60) + '...' : item,
                    tabId: doc.tabId,
                  });
                }
              }
            });
          }

          // Search in checklist items
          if (block.checklistItems) {
            block.checklistItems.forEach((item) => {
              if (item.text.toLowerCase().includes(query)) {
                if (!results.some((r) => r.sectionId === section.id && r.tabId === doc.tabId)) {
                  results.push({
                    sectionId: section.id,
                    sectionTitle: section.title,
                    matchedText: item.text,
                    tabId: doc.tabId,
                  });
                }
              }
            });
          }
        });
      });
    });

    return results.slice(0, 20); // Limit results
  }, [searchQuery, useDatabase, hasDbData, dbDocuments]);

  // Navigate to search result
  const navigateToResult = (result: SOPSearchResult) => {
    setActiveTab(result.tabId);
    setExpandedSections((prev) => new Set([...prev, result.sectionId]));
    setActiveSectionId(result.sectionId);
    setSearchQuery('');

    // Scroll to section after a short delay for render
    setTimeout(() => {
      const element = document.getElementById(`sop-section-${result.sectionId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // =====================================
  // EDIT MODE HANDLERS
  // =====================================

  // Tab operations
  const handleTabCreate = async (tab: SOPTab) => {
    if (!useDatabase) {
      toast({
        title: 'Info',
        description: 'Initialize database first to create tabs.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await sopService.createTab({ ...tab, id: tab.id });
      await loadFromDatabase();
      setActiveTab(tab.id);
      toast({ title: 'Success', description: 'Tab created successfully.' });
    } catch (error) {
      console.error('Error creating tab:', error);
      toast({ title: 'Error', description: 'Failed to create tab.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabUpdate = async (tabId: string, updates: Partial<SOPTab>) => {
    if (!useDatabase) return;

    setIsSaving(true);
    try {
      await sopService.updateTab(tabId, updates);
      await loadFromDatabase();
      toast({ title: 'Success', description: 'Tab updated successfully.' });
    } catch (error) {
      console.error('Error updating tab:', error);
      toast({ title: 'Error', description: 'Failed to update tab.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabDelete = async (tabId: string) => {
    if (!useDatabase) return;

    setIsSaving(true);
    try {
      await sopService.deleteTab(tabId);
      await loadFromDatabase();
      if (activeTab === tabId && currentTabs.length > 0) {
        setActiveTab(currentTabs[0].id);
      }
      toast({ title: 'Success', description: 'Tab deleted successfully.' });
    } catch (error) {
      console.error('Error deleting tab:', error);
      toast({ title: 'Error', description: 'Failed to delete tab.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabReorder = async (tabs: SOPTab[]) => {
    if (!useDatabase) return;

    setDbTabs(tabs); // Optimistic update
    try {
      await sopService.reorderTabs(tabs.map((t) => t.id));
    } catch (error) {
      console.error('Error reordering tabs:', error);
      await loadFromDatabase(); // Revert on error
    }
  };

  // Document operations
  const handleDocumentCreate = async (doc: Omit<SOPDocument, 'id' | 'sections'>) => {
    if (!useDatabase) return;

    setIsSaving(true);
    try {
      await sopService.createDocument(activeTab, doc);
      await loadFromDatabase();
      toast({ title: 'Success', description: 'Document created successfully.' });
    } catch (error) {
      console.error('Error creating document:', error);
      toast({ title: 'Error', description: 'Failed to create document.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUpdate = async (doc: SOPDocument) => {
    if (!useDatabase) {
      // For static data, just update local state (won't persist)
      const newDocs = new Map(dbDocuments);
      newDocs.set(doc.tabId, doc);
      setDbDocuments(newDocs);
      return;
    }

    // For database, update the document
    setIsSaving(true);
    try {
      await sopService.updateDocument(doc.id, {
        title: doc.title,
        description: doc.description,
        version: doc.version,
        lastUpdated: new Date().toISOString().split('T')[0],
      });

      // Update sections and content blocks
      // Note: For full implementation, you would need to track which sections/blocks changed
      // and only update those. For now, we'll do a simple reload.

      // Optimistic update
      const newDocs = new Map(dbDocuments);
      newDocs.set(doc.tabId, doc);
      setDbDocuments(newDocs);

      toast({ title: 'Saved', description: 'Changes saved successfully.' });
    } catch (error) {
      console.error('Error updating document:', error);
      toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
      await loadFromDatabase(); // Revert
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-[95vw] h-[90vh] max-w-7xl',
          'bg-background border border-border/50 rounded-xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Standard Operating Procedures</h2>
              <p className="text-sm text-muted-foreground">
                {currentDocument?.title || 'No document'} • {useDatabase ? 'Database' : 'Static Data'}
                {isEditMode && <span className="text-amber-400 ml-2">• Edit Mode</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Loading indicator */}
            {(isLoading || isSaving) && (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            )}

            {/* Search (only in view mode) */}
            {!isEditMode && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search SOPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-card/50 border-border/50 focus:border-cyan-500/50"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={`${result.tabId}-${result.sectionId}-${idx}`}
                        onClick={() => navigateToResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                            {currentTabs.find((t) => t.id === result.tabId)?.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{result.sectionTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {result.matchedText}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Database Actions (in edit mode) */}
            {isEditMode && !hasDbData && (
              <Button
                variant="outline"
                size="sm"
                onClick={seedDatabase}
                disabled={isLoading}
                className="text-cyan-400 border-cyan-500/30"
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                Initialize Database
              </Button>
            )}

            {isEditMode && hasDbData && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadFromDatabase}
                disabled={isLoading}
                className="text-cyan-400 border-cyan-500/30"
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
            )}

            {/* Edit/View Toggle */}
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                isEditMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "text-muted-foreground border-border/50"
              )}
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  View Mode
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Mode
                </>
              )}
            </Button>

            {/* Print Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="text-muted-foreground hover:text-foreground"
            >
              <Printer className="w-5 h-5" />
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isEditMode ? (
          // EDIT MODE LAYOUT
          <div className="flex-1 flex overflow-hidden">
            {/* Tab Editor Sidebar */}
            <div className="w-80 border-r border-border/50 bg-card/30 flex-shrink-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Manage Tabs
                  </h3>
                  <SOPTabEditor
                    tabs={currentTabs}
                    activeTab={activeTab}
                    onTabSelect={setActiveTab}
                    onTabCreate={handleTabCreate}
                    onTabUpdate={handleTabUpdate}
                    onTabDelete={handleTabDelete}
                    onTabReorder={handleTabReorder}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Document Editor */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                <SOPDocumentEditor
                  document={currentDocument}
                  onUpdate={handleDocumentUpdate}
                  onCreate={handleDocumentCreate}
                  tabId={activeTab}
                  tabLabel={currentTabs.find((t) => t.id === activeTab)?.label || activeTab}
                />
              </div>
            </ScrollArea>
          </div>
        ) : (
          // VIEW MODE LAYOUT
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50 bg-card/30 overflow-x-auto">
              {currentTabs.map((tab) => {
                const IconComponent = TAB_ICONS[tab.icon] || BookOpen;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar - Table of Contents */}
              <div className="w-64 border-r border-border/50 bg-card/30 flex-shrink-0 hidden md:block">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Table of Contents
                    </h3>
                    <nav className="space-y-1">
                      {currentDocument?.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                            activeSectionId === section.id
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{section.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </ScrollArea>
              </div>

              {/* Main Content */}
              <ScrollArea className="flex-1">
                <div className="p-6 max-w-4xl">
                  {currentDocument?.sections.map((section) => (
                    <div
                      key={section.id}
                      id={`sop-section-${section.id}`}
                      className="mb-8"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={cn(
                          'w-full flex items-center gap-3 mb-4 group text-left',
                          'hover:opacity-80 transition-opacity'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            expandedSections.has(section.id)
                              ? 'bg-cyan-500/15 text-cyan-400'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                      </button>

                      {expandedSections.has(section.id) && (
                        <div className="pl-11 animate-in slide-in-from-top-2 duration-200">
                          <SOPContent blocks={section.content} searchQuery={searchQuery} />
                        </div>
                      )}
                    </div>
                  ))}

                  {(!currentDocument || currentDocument.sections.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No content available for this tab.</p>
                      <p className="text-sm mt-2">Switch to Edit Mode to add content.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/50 bg-card/30 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {currentDocument?.lastUpdated && `Last updated: ${currentDocument.lastUpdated} • `}
            Created by Andrius Digital / CDL Agency
          </p>
          <p className="text-xs">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOPModal;
