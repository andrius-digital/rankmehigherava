import React, { useState } from 'react';
import { Plus, Save, Edit2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SOPDocument, SOPSection } from '../types';
import SOPSectionEditor from './SOPSectionEditor';

interface SOPDocumentEditorProps {
  document: SOPDocument | null;
  onUpdate: (document: SOPDocument) => void;
  onCreate: (document: Omit<SOPDocument, 'id' | 'sections'>) => void;
  tabId: string;
  tabLabel: string;
}

const SOPDocumentEditor: React.FC<SOPDocumentEditorProps> = ({
  document,
  onUpdate,
  onCreate,
  tabId,
  tabLabel,
}) => {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [newDocMeta, setNewDocMeta] = useState({
    title: '',
    description: '',
    version: '1.0',
  });

  // Handle creating a new document for this tab
  const handleCreateDocument = () => {
    onCreate({
      tabId: tabId as SOPDocument['tabId'],
      title: newDocMeta.title || `${tabLabel} Documentation`,
      description: newDocMeta.description || '',
      version: newDocMeta.version || '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  // Handle section operations
  const handleSectionUpdate = (index: number, updatedSection: SOPSection) => {
    if (!document) return;
    const newSections = [...document.sections];
    newSections[index] = updatedSection;
    onUpdate({ ...document, sections: newSections });
  };

  const handleSectionDelete = (index: number) => {
    if (!document) return;
    const newSections = document.sections.filter((_, i) => i !== index);
    onUpdate({ ...document, sections: newSections });
  };

  const handleSectionMoveUp = (index: number) => {
    if (!document || index === 0) return;
    const newSections = [...document.sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    onUpdate({ ...document, sections: newSections });
  };

  const handleSectionMoveDown = (index: number) => {
    if (!document || index >= document.sections.length - 1) return;
    const newSections = [...document.sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    onUpdate({ ...document, sections: newSections });
  };

  const addNewSection = () => {
    if (!document) return;

    const newSection: SOPSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      level: 1,
      content: [],
    };

    onUpdate({
      ...document,
      sections: [...document.sections, newSection],
    });
  };

  const handleMetaUpdate = (field: string, value: string) => {
    if (!document) return;
    onUpdate({
      ...document,
      [field]: value,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  // No document exists for this tab
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Document Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create a document for the "{tabLabel}" tab to start adding sections and content.
        </p>

        <div className="w-full max-w-md space-y-4 p-6 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
          <Input
            value={newDocMeta.title}
            onChange={(e) => setNewDocMeta({ ...newDocMeta, title: e.target.value })}
            placeholder={`${tabLabel} Documentation`}
            className="bg-background/50"
          />
          <Textarea
            value={newDocMeta.description}
            onChange={(e) => setNewDocMeta({ ...newDocMeta, description: e.target.value })}
            placeholder="Description (optional)"
            className="bg-background/50"
          />
          <div className="flex gap-3">
            <Input
              value={newDocMeta.version}
              onChange={(e) => setNewDocMeta({ ...newDocMeta, version: e.target.value })}
              placeholder="Version"
              className="w-24 bg-background/50"
            />
            <Button
              onClick={handleCreateDocument}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Metadata */}
      <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
        {isEditingMeta ? (
          <div className="space-y-3">
            <Input
              value={document.title}
              onChange={(e) => handleMetaUpdate('title', e.target.value)}
              placeholder="Document Title"
              className="text-lg font-semibold bg-background/50"
            />
            <Textarea
              value={document.description}
              onChange={(e) => handleMetaUpdate('description', e.target.value)}
              placeholder="Description"
              className="bg-background/50"
            />
            <div className="flex items-center gap-3">
              <Input
                value={document.version}
                onChange={(e) => handleMetaUpdate('version', e.target.value)}
                placeholder="Version"
                className="w-24 bg-background/50"
              />
              <span className="text-sm text-muted-foreground">
                Last updated: {document.lastUpdated}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingMeta(false)}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-1" />
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{document.title}</h2>
              {document.description && (
                <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>Version {document.version}</span>
                <span>•</span>
                <span>Last updated: {document.lastUpdated}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditingMeta(true)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sections ({document.sections.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addNewSection}
            className="text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>

        {document.sections.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border/50 rounded-lg">
            <p className="text-muted-foreground mb-3">No sections yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={addNewSection}
              className="text-cyan-400 border-cyan-500/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Section
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {document.sections.map((section, index) => (
              <SOPSectionEditor
                key={section.id}
                section={section}
                sectionIndex={index}
                onUpdate={(updated) => handleSectionUpdate(index, updated)}
                onDelete={() => handleSectionDelete(index)}
                onMoveUp={() => handleSectionMoveUp(index)}
                onMoveDown={() => handleSectionMoveDown(index)}
                canMoveUp={index > 0}
                canMoveDown={index < document.sections.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SOPDocumentEditor;
