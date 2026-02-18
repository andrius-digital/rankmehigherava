import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { X, Search, Printer, ChevronRight, ChevronDown, Wrench, Palette, Zap, Bug, BookOpen, Edit3, Eye, Loader2, Settings2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { SOPTab, SOPSection, SOPSearchResult, SOPDocument } from './types';
import { SOP_TABS, ALL_SOP_DOCUMENTS, getSopByTabId } from './sopData';
import * as sopService from '@/services/sopService';

// Lazy load heavy components
const SOPContent = lazy(() => import('./SOPContent'));
const SOPTabEditor = lazy(() => import('./editor/SOPTabEditor'));
const SOPDocumentEditor = lazy(() => import('./editor/SOPDocumentEditor'));

// Loading fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
  </div>
);

interface SOPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_ICONS: Record<string, React.ElementType> = {
  Wrench, Palette, Zap, Bug,
  FileText: BookOpen, BookOpen,
  Settings: Settings2, HelpCircle: BookOpen,
};

// Memoized section item for sidebar
const SidebarSection = memo(({
  section,
  isActive,
  isExpanded,
  onClick
}: {
  section: SOPSection;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
      isActive ? 'bg-cyan-500/15 text-cyan-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    )}
  >
    {isExpanded ? (
      <ChevronDown className="w-4 h-4 flex-shrink-0" />
    ) : (
      <ChevronRight className="w-4 h-4 flex-shrink-0" />
    )}
    <span className="truncate">{section.title}</span>
  </button>
));
SidebarSection.displayName = 'SidebarSection';

// Memoized section content
const SectionContent = memo(({
  section,
  isExpanded,
  onToggle,
  searchQuery
}: {
  section: SOPSection;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}) => (
  <div id={`sop-section-${section.id}`} className="mb-6">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 mb-3 group text-left hover:opacity-80 transition-opacity"
    >
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center',
        isExpanded ? 'bg-cyan-500/15 text-cyan-400' : 'bg-muted/50 text-muted-foreground'
      )}>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
      <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
    </button>

    {isExpanded && (
      <div className="pl-10">
        <Suspense fallback={<LoadingSpinner />}>
          <SOPContent blocks={section.content} searchQuery={searchQuery} />
        </Suspense>
      </div>
    )}
  </div>
));
SectionContent.displayName = 'SectionContent';

// Memoized tab button
const TabButton = memo(({
  tab,
  isActive,
  onClick
}: {
  tab: SOPTab;
  isActive: boolean;
  onClick: () => void;
}) => {
  const IconComponent = TAB_ICONS[tab.icon] || BookOpen;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
        isActive
          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <IconComponent className="w-4 h-4" />
      {tab.label}
    </button>
  );
});
TabButton.displayName = 'TabButton';

const SOPModalOptimized: React.FC<SOPModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('technical');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);

  // Database state - lazy loaded per tab
  const [dbTabs, setDbTabs] = useState<SOPTab[]>([]);
  const [loadedDocuments, setLoadedDocuments] = useState<Map<string, SOPDocument>>(new Map());
  const [hasDbData, setHasDbData] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get current tabs
  const currentTabs = useMemo(() => {
    return useDatabase && hasDbData ? dbTabs : SOP_TABS;
  }, [useDatabase, hasDbData, dbTabs]);

  // Get current document - lazy load from cache or static
  const currentDocument = useMemo(() => {
    if (useDatabase && hasDbData) {
      return loadedDocuments.get(activeTab) || null;
    }
    return getSopByTabId(activeTab) || null;
  }, [activeTab, useDatabase, hasDbData, loadedDocuments]);

  // Check for database data on mount
  useEffect(() => {
    if (!isOpen) return;

    const checkDbData = async () => {
      try {
        const hasData = await sopService.hasSOPData();
        setHasDbData(hasData);
        if (hasData) {
          setUseDatabase(true);
          // Only load tabs initially, not all documents
          const tabs = await sopService.fetchAllTabs();
          setDbTabs(tabs);
        }
      } catch (error) {
        console.error('Error checking database:', error);
      }
    };

    checkDbData();
  }, [isOpen]);

  // Lazy load document when tab changes (database mode)
  useEffect(() => {
    if (!useDatabase || !hasDbData || loadedDocuments.has(activeTab)) return;

    const loadDocument = async () => {
      setIsLoading(true);
      try {
        const doc = await sopService.fetchDocumentByTabId(activeTab);
        if (doc) {
          setLoadedDocuments(prev => new Map(prev).set(activeTab, doc));
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [activeTab, useDatabase, hasDbData, loadedDocuments]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Auto-expand first section on tab change
  useEffect(() => {
    if (currentDocument?.sections[0]) {
      setExpandedSections(new Set([currentDocument.sections[0].id]));
      setActiveSectionId(currentDocument.sections[0].id);
    }
  }, [currentDocument]);

  // Toggle section - memoized
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
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

  // Search functionality - uses debounced value
  const searchResults = useMemo((): SOPSearchResult[] => {
    if (!debouncedSearch.trim()) return [];

    const results: SOPSearchResult[] = [];
    const query = debouncedSearch.toLowerCase();
    const docsToSearch = useDatabase && hasDbData ? Array.from(loadedDocuments.values()) : ALL_SOP_DOCUMENTS;

    for (const doc of docsToSearch) {
      for (const section of doc.sections) {
        if (section.title.toLowerCase().includes(query)) {
          results.push({
            sectionId: section.id,
            sectionTitle: section.title,
            matchedText: section.title,
            tabId: doc.tabId,
          });
          if (results.length >= 10) return results;
        }

        for (const block of section.content) {
          if (block.content?.toLowerCase().includes(query)) {
            if (!results.some(r => r.sectionId === section.id)) {
              const idx = block.content.toLowerCase().indexOf(query);
              const start = Math.max(0, idx - 20);
              const end = Math.min(block.content.length, idx + query.length + 20);
              results.push({
                sectionId: section.id,
                sectionTitle: section.title,
                matchedText: '...' + block.content.slice(start, end) + '...',
                tabId: doc.tabId,
              });
              if (results.length >= 10) return results;
            }
          }
        }
      }
    }

    return results;
  }, [debouncedSearch, useDatabase, hasDbData, loadedDocuments]);

  // Navigate to search result
  const navigateToResult = useCallback((result: SOPSearchResult) => {
    setActiveTab(result.tabId);
    setExpandedSections(prev => new Set([...prev, result.sectionId]));
    setActiveSectionId(result.sectionId);
    setSearchQuery('');

    setTimeout(() => {
      document.getElementById(`sop-section-${result.sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // Seed database
  const seedDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      await sopService.seedSOPData(SOP_TABS, ALL_SOP_DOCUMENTS);
      const tabs = await sopService.fetchAllTabs();
      setDbTabs(tabs);
      setLoadedDocuments(new Map());
      setHasDbData(true);
      setUseDatabase(true);
      toast({ title: 'Success', description: 'Database initialized.' });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({ title: 'Error', description: 'Failed to initialize.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Tab handlers
  const handleTabSelect = useCallback((tabId: string) => setActiveTab(tabId), []);

  const handleTabCreate = useCallback(async (tab: SOPTab) => {
    if (!useDatabase) return;
    setIsSaving(true);
    try {
      await sopService.createTab({ ...tab, id: tab.id });
      const tabs = await sopService.fetchAllTabs();
      setDbTabs(tabs);
      setActiveTab(tab.id);
      toast({ title: 'Success', description: 'Tab created.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create tab.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [useDatabase, toast]);

  const handleTabUpdate = useCallback(async (tabId: string, updates: Partial<SOPTab>) => {
    if (!useDatabase) return;
    setIsSaving(true);
    try {
      await sopService.updateTab(tabId, updates);
      const tabs = await sopService.fetchAllTabs();
      setDbTabs(tabs);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [useDatabase, toast]);

  const handleTabDelete = useCallback(async (tabId: string) => {
    if (!useDatabase) return;
    setIsSaving(true);
    try {
      await sopService.deleteTab(tabId);
      const tabs = await sopService.fetchAllTabs();
      setDbTabs(tabs);
      setLoadedDocuments(prev => {
        const newMap = new Map(prev);
        newMap.delete(tabId);
        return newMap;
      });
      if (activeTab === tabId && tabs.length > 0) {
        setActiveTab(tabs[0].id);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [useDatabase, activeTab, toast]);

  const handleTabReorder = useCallback(async (tabs: SOPTab[]) => {
    if (!useDatabase) return;
    setDbTabs(tabs);
    try {
      await sopService.reorderTabs(tabs.map(t => t.id));
    } catch (error) {
      const freshTabs = await sopService.fetchAllTabs();
      setDbTabs(freshTabs);
    }
  }, [useDatabase]);

  const handleDocumentCreate = useCallback(async (doc: Omit<SOPDocument, 'id' | 'sections'>) => {
    if (!useDatabase) return;
    setIsSaving(true);
    try {
      await sopService.createDocument(activeTab, doc);
      const freshDoc = await sopService.fetchDocumentByTabId(activeTab);
      if (freshDoc) {
        setLoadedDocuments(prev => new Map(prev).set(activeTab, freshDoc));
      }
      toast({ title: 'Success', description: 'Document created.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create document.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [useDatabase, activeTab, toast]);

  const handleDocumentUpdate = useCallback(async (doc: SOPDocument) => {
    // Optimistic update
    setLoadedDocuments(prev => new Map(prev).set(doc.tabId, doc));

    if (!useDatabase) return;

    setIsSaving(true);
    try {
      await sopService.updateDocument(doc.id, {
        title: doc.title,
        description: doc.description,
        version: doc.version,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
      // Reload on error
      const freshDoc = await sopService.fetchDocumentByTabId(doc.tabId);
      if (freshDoc) {
        setLoadedDocuments(prev => new Map(prev).set(doc.tabId, freshDoc));
      }
    } finally {
      setIsSaving(false);
    }
  }, [useDatabase, toast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={cn(
        'relative z-10 w-[95vw] h-[90vh] max-w-7xl',
        'bg-background border border-border/50 rounded-xl shadow-2xl',
        'flex flex-col overflow-hidden'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Standard Operating Procedures</h2>
              <p className="text-sm text-muted-foreground">
                {currentDocument?.title || 'Select a tab'}
                {isEditMode && <span className="text-amber-400 ml-2">• Edit Mode</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isLoading || isSaving) && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}

            {!isEditMode && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 bg-card/50 border-border/50"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={`${result.tabId}-${result.sectionId}-${idx}`}
                        onClick={() => navigateToResult(result)}
                        className="w-full px-3 py-2 text-left hover:bg-muted/50 border-b border-border/30 last:border-0"
                      >
                        <p className="text-sm font-medium">{result.sectionTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.matchedText}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isEditMode && !hasDbData && (
              <Button variant="outline" size="sm" onClick={seedDatabase} disabled={isLoading} className="text-cyan-400 border-cyan-500/30">
                <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                Initialize DB
              </Button>
            )}

            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className={isEditMode ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-muted-foreground"}
            >
              {isEditMode ? <><Eye className="w-4 h-4 mr-1" />View</> : <><Edit3 className="w-4 h-4 mr-1" />Edit</>}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => window.print()}>
              <Printer className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isEditMode ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 border-r border-border/50 bg-card/30 flex-shrink-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Manage Tabs</h3>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SOPTabEditor
                      tabs={currentTabs}
                      activeTab={activeTab}
                      onTabSelect={handleTabSelect}
                      onTabCreate={handleTabCreate}
                      onTabUpdate={handleTabUpdate}
                      onTabDelete={handleTabDelete}
                      onTabReorder={handleTabReorder}
                    />
                  </Suspense>
                </div>
              </ScrollArea>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <SOPDocumentEditor
                    document={currentDocument}
                    onUpdate={handleDocumentUpdate}
                    onCreate={handleDocumentCreate}
                    tabId={activeTab}
                    tabLabel={currentTabs.find(t => t.id === activeTab)?.label || activeTab}
                  />
                </Suspense>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50 bg-card/30 overflow-x-auto">
              {currentTabs.map(tab => (
                <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => handleTabSelect(tab.id)} />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-56 border-r border-border/50 bg-card/30 flex-shrink-0 hidden md:block">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3">Contents</h3>
                    <nav className="space-y-1">
                      {currentDocument?.sections.map(section => (
                        <SidebarSection
                          key={section.id}
                          section={section}
                          isActive={activeSectionId === section.id}
                          isExpanded={expandedSections.has(section.id)}
                          onClick={() => toggleSection(section.id)}
                        />
                      ))}
                    </nav>
                  </div>
                </ScrollArea>
              </div>

              {/* Main */}
              <ScrollArea className="flex-1">
                <div className="p-6 max-w-4xl">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : currentDocument?.sections.map(section => (
                    <SectionContent
                      key={section.id}
                      section={section}
                      isExpanded={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      searchQuery={debouncedSearch}
                    />
                  ))}

                  {!isLoading && (!currentDocument || currentDocument.sections.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No content available.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-2 border-t border-border/50 bg-card/30 flex items-center justify-between text-xs text-muted-foreground">
          <p>{currentDocument?.lastUpdated && `Updated: ${currentDocument.lastUpdated}`}</p>
          <p>Press <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  );
};

export default memo(SOPModalOptimized);
