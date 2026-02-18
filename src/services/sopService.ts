import { supabase } from '@/integrations/supabase/client';
import { SOPTab, SOPDocument, SOPSection, SOPContentBlock, ChecklistItem } from '@/components/sop/types';

// Database types
export interface DbSOPTab {
  id: string;
  tab_id: string;
  label: string;
  icon: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSOPDocument {
  id: string;
  tab_id: string;
  title: string;
  description: string;
  version: string;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface DbSOPSection {
  id: string;
  document_id: string;
  section_id: string;
  parent_section_id: string | null;
  title: string;
  level: number;
  display_order: number;
  is_expanded: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSOPContentBlock {
  id: string;
  section_id: string;
  block_type: string;
  content: string | null;
  language: string | null;
  alert_type: string | null;
  is_ordered: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbSOPListItem {
  id: string;
  content_block_id: string;
  text: string;
  display_order: number;
}

export interface DbSOPChecklistItem {
  id: string;
  content_block_id: string;
  item_id: string;
  text: string;
  default_checked: boolean;
  display_order: number;
}

export interface DbSOPTableData {
  id: string;
  content_block_id: string;
  headers: string[];
  rows: string[][];
}

// =========================
// TAB OPERATIONS
// =========================

export async function fetchAllTabs(): Promise<SOPTab[]> {
  const { data, error } = await supabase
    .from('sop_tabs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching SOP tabs:', error);
    throw error;
  }

  return (data || []).map((tab: DbSOPTab) => ({
    id: tab.tab_id as SOPTab['id'],
    label: tab.label,
    icon: tab.icon,
    description: tab.description,
  }));
}

export async function createTab(tab: Omit<SOPTab, 'id'> & { id: string }): Promise<DbSOPTab> {
  const { data: maxOrder } = await supabase
    .from('sop_tabs')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('sop_tabs')
    .insert({
      tab_id: tab.id,
      label: tab.label,
      icon: tab.icon,
      description: tab.description,
      display_order: (maxOrder?.display_order || 0) + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating SOP tab:', error);
    throw error;
  }

  return data;
}

export async function updateTab(tabId: string, updates: Partial<SOPTab>): Promise<DbSOPTab> {
  const { data, error } = await supabase
    .from('sop_tabs')
    .update({
      label: updates.label,
      icon: updates.icon,
      description: updates.description,
    })
    .eq('tab_id', tabId)
    .select()
    .single();

  if (error) {
    console.error('Error updating SOP tab:', error);
    throw error;
  }

  return data;
}

export async function deleteTab(tabId: string): Promise<void> {
  const { error } = await supabase
    .from('sop_tabs')
    .delete()
    .eq('tab_id', tabId);

  if (error) {
    console.error('Error deleting SOP tab:', error);
    throw error;
  }
}

export async function reorderTabs(tabIds: string[]): Promise<void> {
  const updates = tabIds.map((tabId, index) =>
    supabase
      .from('sop_tabs')
      .update({ display_order: index })
      .eq('tab_id', tabId)
  );

  await Promise.all(updates);
}

// =========================
// DOCUMENT OPERATIONS
// =========================

export async function fetchDocumentByTabId(tabId: string): Promise<SOPDocument | null> {
  // First get the tab's UUID
  const { data: tabData, error: tabError } = await supabase
    .from('sop_tabs')
    .select('id')
    .eq('tab_id', tabId)
    .single();

  if (tabError || !tabData) {
    console.error('Tab not found:', tabError);
    return null;
  }

  // Get the document
  const { data: docData, error: docError } = await supabase
    .from('sop_documents')
    .select('*')
    .eq('tab_id', tabData.id)
    .single();

  if (docError || !docData) {
    return null;
  }

  // Get all sections for this document
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('sop_sections')
    .select('*')
    .eq('document_id', docData.id)
    .order('display_order', { ascending: true });

  if (sectionsError) {
    console.error('Error fetching sections:', sectionsError);
    throw sectionsError;
  }

  // Get all content blocks for these sections
  const sectionIds = (sectionsData || []).map((s: DbSOPSection) => s.id);

  const { data: blocksData, error: blocksError } = await supabase
    .from('sop_content_blocks')
    .select('*')
    .in('section_id', sectionIds.length ? sectionIds : [''])
    .order('display_order', { ascending: true });

  if (blocksError) {
    console.error('Error fetching content blocks:', blocksError);
    throw blocksError;
  }

  // Get list items, checklist items, and table data
  const blockIds = (blocksData || []).map((b: DbSOPContentBlock) => b.id);

  const [listItemsResult, checklistItemsResult, tableDataResult] = await Promise.all([
    supabase
      .from('sop_list_items')
      .select('*')
      .in('content_block_id', blockIds.length ? blockIds : [''])
      .order('display_order', { ascending: true }),
    supabase
      .from('sop_checklist_items')
      .select('*')
      .in('content_block_id', blockIds.length ? blockIds : [''])
      .order('display_order', { ascending: true }),
    supabase
      .from('sop_table_data')
      .select('*')
      .in('content_block_id', blockIds.length ? blockIds : ['']),
  ]);

  // Build content blocks with their associated data
  const buildContentBlock = (block: DbSOPContentBlock): SOPContentBlock => {
    const contentBlock: SOPContentBlock = {
      type: block.block_type as SOPContentBlock['type'],
    };

    if (block.content) contentBlock.content = block.content;
    if (block.language) contentBlock.language = block.language;
    if (block.alert_type) contentBlock.alertType = block.alert_type as SOPContentBlock['alertType'];

    if (block.block_type === 'list') {
      const items = (listItemsResult.data || [])
        .filter((item: DbSOPListItem) => item.content_block_id === block.id)
        .map((item: DbSOPListItem) => item.text);
      contentBlock.items = items;
      contentBlock.ordered = block.is_ordered;
    }

    if (block.block_type === 'checklist') {
      const items = (checklistItemsResult.data || [])
        .filter((item: DbSOPChecklistItem) => item.content_block_id === block.id)
        .map((item: DbSOPChecklistItem): ChecklistItem => ({
          id: item.item_id,
          text: item.text,
          defaultChecked: item.default_checked,
        }));
      contentBlock.checklistItems = items;
    }

    if (block.block_type === 'table') {
      const tableData = (tableDataResult.data || [])
        .find((t: DbSOPTableData) => t.content_block_id === block.id);
      if (tableData) {
        contentBlock.headers = tableData.headers;
        contentBlock.rows = tableData.rows;
      }
    }

    return contentBlock;
  };

  // Build sections with their content
  const buildSection = (section: DbSOPSection): SOPSection => {
    const sectionBlocks = (blocksData || [])
      .filter((b: DbSOPContentBlock) => b.section_id === section.id);

    const childSections = (sectionsData || [])
      .filter((s: DbSOPSection) => s.parent_section_id === section.id)
      .map(buildSection);

    return {
      id: section.section_id,
      title: section.title,
      level: section.level as 1 | 2 | 3,
      content: sectionBlocks.map(buildContentBlock),
      ...(childSections.length > 0 ? { subsections: childSections } : {}),
    };
  };

  // Build the document
  const topLevelSections = (sectionsData || [])
    .filter((s: DbSOPSection) => !s.parent_section_id)
    .map(buildSection);

  return {
    id: docData.id,
    tabId: tabId as SOPDocument['tabId'],
    title: docData.title,
    description: docData.description,
    lastUpdated: docData.last_updated,
    version: docData.version,
    sections: topLevelSections,
  };
}

export async function createDocument(
  tabId: string,
  doc: Omit<SOPDocument, 'id' | 'tabId' | 'sections'>
): Promise<DbSOPDocument> {
  // Get the tab's UUID
  const { data: tabData, error: tabError } = await supabase
    .from('sop_tabs')
    .select('id')
    .eq('tab_id', tabId)
    .single();

  if (tabError || !tabData) {
    throw new Error('Tab not found');
  }

  const { data, error } = await supabase
    .from('sop_documents')
    .insert({
      tab_id: tabData.id,
      title: doc.title,
      description: doc.description,
      version: doc.version,
      last_updated: doc.lastUpdated,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating SOP document:', error);
    throw error;
  }

  return data;
}

export async function updateDocument(
  documentId: string,
  updates: Partial<Omit<SOPDocument, 'id' | 'tabId' | 'sections'>>
): Promise<DbSOPDocument> {
  const { data, error } = await supabase
    .from('sop_documents')
    .update({
      title: updates.title,
      description: updates.description,
      version: updates.version,
      last_updated: updates.lastUpdated,
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating SOP document:', error);
    throw error;
  }

  return data;
}

// =========================
// SECTION OPERATIONS
// =========================

export async function createSection(
  documentId: string,
  section: Omit<SOPSection, 'content' | 'subsections'>,
  parentSectionId?: string
): Promise<DbSOPSection> {
  const { data: maxOrder } = await supabase
    .from('sop_sections')
    .select('display_order')
    .eq('document_id', documentId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('sop_sections')
    .insert({
      document_id: documentId,
      section_id: section.id,
      parent_section_id: parentSectionId || null,
      title: section.title,
      level: section.level,
      display_order: (maxOrder?.display_order || 0) + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating SOP section:', error);
    throw error;
  }

  return data;
}

export async function updateSection(
  sectionUuid: string,
  updates: Partial<Omit<SOPSection, 'content' | 'subsections'>>
): Promise<DbSOPSection> {
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.id !== undefined) updateData.section_id = updates.id;

  const { data, error } = await supabase
    .from('sop_sections')
    .update(updateData)
    .eq('id', sectionUuid)
    .select()
    .single();

  if (error) {
    console.error('Error updating SOP section:', error);
    throw error;
  }

  return data;
}

export async function deleteSection(sectionUuid: string): Promise<void> {
  const { error } = await supabase
    .from('sop_sections')
    .delete()
    .eq('id', sectionUuid);

  if (error) {
    console.error('Error deleting SOP section:', error);
    throw error;
  }
}

export async function reorderSections(documentId: string, sectionUuids: string[]): Promise<void> {
  const updates = sectionUuids.map((uuid, index) =>
    supabase
      .from('sop_sections')
      .update({ display_order: index })
      .eq('id', uuid)
  );

  await Promise.all(updates);
}

// =========================
// CONTENT BLOCK OPERATIONS
// =========================

export async function createContentBlock(
  sectionUuid: string,
  block: SOPContentBlock
): Promise<string> {
  // Get max display order
  const { data: maxOrder } = await supabase
    .from('sop_content_blocks')
    .select('display_order')
    .eq('section_id', sectionUuid)
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  // Insert the content block
  const { data: blockData, error: blockError } = await supabase
    .from('sop_content_blocks')
    .insert({
      section_id: sectionUuid,
      block_type: block.type,
      content: block.content || null,
      language: block.language || null,
      alert_type: block.alertType || null,
      is_ordered: block.ordered || false,
      display_order: (maxOrder?.display_order || 0) + 1,
    })
    .select()
    .single();

  if (blockError) {
    console.error('Error creating content block:', blockError);
    throw blockError;
  }

  // Insert related data based on block type
  if (block.type === 'list' && block.items) {
    const listItems = block.items.map((text, index) => ({
      content_block_id: blockData.id,
      text,
      display_order: index,
    }));

    const { error: listError } = await supabase
      .from('sop_list_items')
      .insert(listItems);

    if (listError) {
      console.error('Error creating list items:', listError);
      throw listError;
    }
  }

  if (block.type === 'checklist' && block.checklistItems) {
    const checklistItems = block.checklistItems.map((item, index) => ({
      content_block_id: blockData.id,
      item_id: item.id,
      text: item.text,
      default_checked: item.defaultChecked || false,
      display_order: index,
    }));

    const { error: checklistError } = await supabase
      .from('sop_checklist_items')
      .insert(checklistItems);

    if (checklistError) {
      console.error('Error creating checklist items:', checklistError);
      throw checklistError;
    }
  }

  if (block.type === 'table' && block.headers && block.rows) {
    const { error: tableError } = await supabase
      .from('sop_table_data')
      .insert({
        content_block_id: blockData.id,
        headers: block.headers,
        rows: block.rows,
      });

    if (tableError) {
      console.error('Error creating table data:', tableError);
      throw tableError;
    }
  }

  return blockData.id;
}

export async function updateContentBlock(
  blockUuid: string,
  block: Partial<SOPContentBlock>
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (block.type !== undefined) updateData.block_type = block.type;
  if (block.content !== undefined) updateData.content = block.content;
  if (block.language !== undefined) updateData.language = block.language;
  if (block.alertType !== undefined) updateData.alert_type = block.alertType;
  if (block.ordered !== undefined) updateData.is_ordered = block.ordered;

  const { error } = await supabase
    .from('sop_content_blocks')
    .update(updateData)
    .eq('id', blockUuid);

  if (error) {
    console.error('Error updating content block:', error);
    throw error;
  }

  // Update related data if provided
  if (block.items !== undefined) {
    // Delete existing list items and insert new ones
    await supabase.from('sop_list_items').delete().eq('content_block_id', blockUuid);

    if (block.items.length > 0) {
      const listItems = block.items.map((text, index) => ({
        content_block_id: blockUuid,
        text,
        display_order: index,
      }));
      await supabase.from('sop_list_items').insert(listItems);
    }
  }

  if (block.checklistItems !== undefined) {
    // Delete existing checklist items and insert new ones
    await supabase.from('sop_checklist_items').delete().eq('content_block_id', blockUuid);

    if (block.checklistItems.length > 0) {
      const checklistItems = block.checklistItems.map((item, index) => ({
        content_block_id: blockUuid,
        item_id: item.id,
        text: item.text,
        default_checked: item.defaultChecked || false,
        display_order: index,
      }));
      await supabase.from('sop_checklist_items').insert(checklistItems);
    }
  }

  if (block.headers !== undefined && block.rows !== undefined) {
    // Upsert table data
    await supabase.from('sop_table_data').delete().eq('content_block_id', blockUuid);
    await supabase.from('sop_table_data').insert({
      content_block_id: blockUuid,
      headers: block.headers,
      rows: block.rows,
    });
  }
}

export async function deleteContentBlock(blockUuid: string): Promise<void> {
  const { error } = await supabase
    .from('sop_content_blocks')
    .delete()
    .eq('id', blockUuid);

  if (error) {
    console.error('Error deleting content block:', error);
    throw error;
  }
}

export async function reorderContentBlocks(sectionUuid: string, blockUuids: string[]): Promise<void> {
  const updates = blockUuids.map((uuid, index) =>
    supabase
      .from('sop_content_blocks')
      .update({ display_order: index })
      .eq('id', uuid)
  );

  await Promise.all(updates);
}

// =========================
// SEED DATA FUNCTION
// =========================

export async function seedSOPData(
  tabs: SOPTab[],
  documents: SOPDocument[]
): Promise<void> {
  // Insert tabs
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const { data: existingTab } = await supabase
      .from('sop_tabs')
      .select('id')
      .eq('tab_id', tab.id)
      .single();

    if (existingTab) {
      console.log(`Tab ${tab.id} already exists, skipping...`);
      continue;
    }

    const { data: tabData, error: tabError } = await supabase
      .from('sop_tabs')
      .insert({
        tab_id: tab.id,
        label: tab.label,
        icon: tab.icon,
        description: tab.description,
        display_order: i,
      })
      .select()
      .single();

    if (tabError) {
      console.error(`Error seeding tab ${tab.id}:`, tabError);
      continue;
    }

    // Find corresponding document
    const doc = documents.find(d => d.tabId === tab.id);
    if (!doc) continue;

    // Insert document
    const { data: docData, error: docError } = await supabase
      .from('sop_documents')
      .insert({
        tab_id: tabData.id,
        title: doc.title,
        description: doc.description,
        version: doc.version,
        last_updated: doc.lastUpdated,
      })
      .select()
      .single();

    if (docError) {
      console.error(`Error seeding document for tab ${tab.id}:`, docError);
      continue;
    }

    // Insert sections recursively
    const insertSection = async (
      section: SOPSection,
      docId: string,
      parentId: string | null,
      order: number
    ): Promise<void> => {
      const { data: sectionData, error: sectionError } = await supabase
        .from('sop_sections')
        .insert({
          document_id: docId,
          section_id: section.id,
          parent_section_id: parentId,
          title: section.title,
          level: section.level,
          display_order: order,
        })
        .select()
        .single();

      if (sectionError) {
        console.error(`Error seeding section ${section.id}:`, sectionError);
        return;
      }

      // Insert content blocks
      for (let blockIdx = 0; blockIdx < section.content.length; blockIdx++) {
        const block = section.content[blockIdx];
        await createContentBlock(sectionData.id, block);
      }

      // Insert subsections
      if (section.subsections) {
        for (let subIdx = 0; subIdx < section.subsections.length; subIdx++) {
          await insertSection(section.subsections[subIdx], docId, sectionData.id, subIdx);
        }
      }
    };

    // Insert all top-level sections
    for (let sectionIdx = 0; sectionIdx < doc.sections.length; sectionIdx++) {
      await insertSection(doc.sections[sectionIdx], docData.id, null, sectionIdx);
    }

    console.log(`Successfully seeded tab ${tab.id} with document and sections`);
  }
}

// =========================
// CHECK IF DATA EXISTS
// =========================

export async function hasSOPData(): Promise<boolean> {
  const { data, error } = await supabase
    .from('sop_tabs')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking SOP data:', error);
    return false;
  }

  return (data || []).length > 0;
}
