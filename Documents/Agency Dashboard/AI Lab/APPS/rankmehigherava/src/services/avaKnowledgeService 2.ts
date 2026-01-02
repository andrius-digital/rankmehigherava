import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeItem {
  id: string;
  category: 'company' | 'vsl' | 'reel' | 'style' | 'faq';
  title: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  is_active: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  use_count: number;
  training_status?: 'pending' | 'trained';
}

export interface DashboardSummary {
  total_items: number;
  last_updated: string;
  coverage_score: number;
  performance_rating: number;
  pending_queue_items: number;
}

export interface CategoryStats {
  category: string;
  item_count: number;
  last_updated: string;
  avg_use_count: number;
  needs_attention_count: number;
}

export interface TrainingQueueItem {
  id: string;
  knowledge_id: string;
  action_type: 'update' | 'review' | 'verify' | 'expand';
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  ava_knowledge?: KnowledgeItem;
}

// Generate embeddings using OpenAI API
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Returning mock embedding.');
    // Return a mock embedding for development
    return Array(1536).fill(0).map(() => Math.random());
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return mock embedding on error
    return Array(1536).fill(0).map(() => Math.random());
  }
}

// Add new knowledge
export async function addKnowledge(data: {
  category: string;
  title: string;
  content: string;
  tags?: string[];
  priority?: string;
}): Promise<KnowledgeItem> {
  console.log('addKnowledge called with:', data);
  
  // Skip embedding for now to simplify
  const insertData = {
    category: data.category,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    priority: data.priority || 'medium',
    is_active: true,
    use_count: 0,
    metadata: {
      training_status: 'pending',
      pending_since: new Date().toISOString(),
    },
  };
  
  console.log('Inserting:', insertData);

  const { data: knowledge, error } = await (supabase as any)
    .from('ava_knowledge')
    .insert(insertData)
    .select()
    .single();

  console.log('Supabase response:', { knowledge, error });

  if (error) {
    console.error('Error adding knowledge:', error);
    throw error;
  }

  return knowledge as KnowledgeItem;
}

// Get all knowledge items
export async function getAllKnowledge(category?: string): Promise<KnowledgeItem[]> {
  console.log('getAllKnowledge called, category:', category);
  
  let query = (supabase as any)
    .from('ava_knowledge')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  
  console.log('getAllKnowledge response:', { data, error });

  if (error) {
    console.error('Error fetching knowledge:', error);
    throw error;
  }

  return (data || []) as KnowledgeItem[];
}

// Update knowledge
export async function updateKnowledge(
  id: string,
  updates: Partial<Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<KnowledgeItem> {
  const updateData: any = { ...updates };

  // If content or title changed, regenerate embedding
  if (updates.content || updates.title) {
    const current = await supabase
      .from('ava_knowledge')
      .select('title, content')
      .eq('id', id)
      .single();

    if (current.data) {
      const text = `${updates.title || current.data.title}\n${updates.content || current.data.content}`;
      const embedding = await generateEmbedding(text);
      updateData.embedding = JSON.stringify(embedding);
    }
  }

  const { data, error } = await supabase
    .from('ava_knowledge')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating knowledge:', error);
    throw error;
  }

  return data as KnowledgeItem;
}

// Delete knowledge
export async function deleteKnowledge(id: string): Promise<void> {
  const { error } = await supabase
    .from('ava_knowledge')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting knowledge:', error);
    throw error;
  }
}

// Get dashboard data
export async function getDashboardData(): Promise<{
  summary: DashboardSummary | null;
  categories: CategoryStats[];
  trainingQueue: TrainingQueueItem[];
}> {
  console.log('getDashboardData called');
  
  // Get all knowledge items to calculate stats
  const { data: allKnowledge, error: knowledgeError } = await (supabase as any)
    .from('ava_knowledge')
    .select('*')
    .eq('is_active', true);

  if (knowledgeError) {
    console.error('Error fetching knowledge for dashboard:', knowledgeError);
  }

  const knowledge = allKnowledge || [];
  
  // Get pending queue items
  const { data: queueData, error: queueError } = await (supabase as any)
    .from('ava_training_queue')
    .select('*, ava_knowledge(*)')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(10);

  if (queueError) {
    console.error('Error fetching queue:', queueError);
  }

  // Calculate summary
  const summary: DashboardSummary = {
    total_items: knowledge.length,
    last_updated: knowledge.length > 0 
      ? knowledge.reduce((latest: string, item: any) => 
          item.updated_at > latest ? item.updated_at : latest, 
          knowledge[0]?.updated_at || new Date().toISOString()
        )
      : new Date().toISOString(),
    coverage_score: Math.min(100, knowledge.length * 10),
    performance_rating: 4.5,
    pending_queue_items: (queueData || []).length,
  };

  // Calculate category stats
  const categoryNames = ['company', 'vsl', 'reel', 'style', 'faq'];
  const categories: CategoryStats[] = categoryNames.map(cat => {
    const items = knowledge.filter((k: any) => k.category === cat);
    return {
      category: cat,
      item_count: items.length,
      last_updated: items.length > 0 
        ? items.reduce((latest: string, item: any) => 
            item.updated_at > latest ? item.updated_at : latest, 
            items[0]?.updated_at || new Date().toISOString()
          )
        : new Date().toISOString(),
      avg_use_count: items.length > 0 
        ? items.reduce((sum: number, item: any) => sum + (item.use_count || 0), 0) / items.length 
        : 0,
      needs_attention_count: items.filter((i: any) => 
        i.metadata?.training_status === 'pending'
      ).length,
    };
  });

  console.log('Dashboard data:', { summary, categories, trainingQueue: queueData || [] });

  return {
    summary,
    categories,
    trainingQueue: (queueData || []) as TrainingQueueItem[],
  };
}

// Retrieve relevant knowledge (RAG - Retrieval Augmented Generation)
export async function retrieveKnowledge(
  query: string,
  category?: string,
  limit = 5
): Promise<Array<KnowledgeItem & { similarity: number }>> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Call the match_knowledge function
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.7,
    match_count: limit,
    filter_category: category || null,
  });

  if (error) {
    console.error('Error retrieving knowledge:', error);
    throw error;
  }

  // Update usage stats for matched items
  if (data && data.length > 0) {
    for (const item of data) {
      await supabase
        .from('ava_knowledge')
        .update({
          last_used_at: new Date().toISOString(),
          use_count: item.use_count + 1,
        })
        .eq('id', item.id);
    }
  }

  return data || [];
}

// Build system prompt for AVA with retrieved knowledge
export function buildAVAPrompt(knowledgeItems: Array<KnowledgeItem & { similarity?: number }>): string {
  const knowledge = knowledgeItems
    .map((item) => `[${item.category.toUpperCase()}] ${item.title}\n${item.content}`)
    .join('\n\n---\n\n');

  return `You are AVA, an AI assistant for Rank Me Higher agency. Use this knowledge to help:

${knowledge}

Instructions:
- Use the knowledge above to provide accurate responses
- For VSL scripts, follow the patterns in VSL knowledge
- For reel scripts, keep them 30-60 seconds, engaging, and hook-driven
- Maintain our brand voice from the style guide
- Be conversational, helpful, and professional
- Always prioritize client success and results
- Explain technical concepts in simple terms`;
}

// Track knowledge usage
export async function trackUsage(
  knowledgeId: string,
  query: string,
  relevanceScore: number,
  wasHelpful?: boolean,
  feedback?: string
): Promise<void> {
  await supabase.from('ava_usage_analytics').insert({
    knowledge_id: knowledgeId,
    query,
    relevance_score: relevanceScore,
    was_helpful: wasHelpful,
    user_feedback: feedback,
  });
}

// Add to training queue
export async function addToTrainingQueue(
  knowledgeId: string,
  actionType: 'update' | 'review' | 'verify' | 'expand',
  reason?: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void> {
  await supabase.from('ava_training_queue').insert({
    knowledge_id: knowledgeId,
    action_type: actionType,
    reason,
    priority,
    status: 'pending',
  });
}

// Complete training queue item
export async function completeTrainingQueueItem(id: string): Promise<void> {
  await supabase
    .from('ava_training_queue')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id);
}

// Dismiss training queue item
export async function dismissTrainingQueueItem(id: string): Promise<void> {
  await supabase
    .from('ava_training_queue')
    .update({ status: 'dismissed' })
    .eq('id', id);
}

// Mark knowledge as trained
export async function markKnowledgeAsTrained(id: string): Promise<void> {
  const { data: current } = await (supabase as any)
    .from('ava_knowledge')
    .select('metadata')
    .eq('id', id)
    .single();

  const metadata = current?.metadata || {};
  
  const { error } = await (supabase as any)
    .from('ava_knowledge')
    .update({
      metadata: {
        ...metadata,
        training_status: 'trained',
        trained_at: new Date().toISOString(),
      },
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking knowledge as trained:', error);
    throw error;
  }
}

// Get training status from knowledge item
export function getTrainingStatus(item: KnowledgeItem): 'pending' | 'trained' {
  return (item.metadata?.training_status as 'pending' | 'trained') || 'pending';
}

// Search knowledge (simple text search)
export async function searchKnowledge(searchTerm: string): Promise<KnowledgeItem[]> {
  const { data, error } = await supabase
    .from('ava_knowledge')
    .select('*')
    .eq('is_active', true)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }

  return data as KnowledgeItem[];
}

