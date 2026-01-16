import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ContentStatus = 'draft' | 'in_progress' | 'review' | 'published';
export type ContentType = 'blog' | 'social' | 'email' | 'video' | 'other';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  assignee: string | null;
  due_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContentInput {
  title: string;
  type: ContentType;
  status: ContentStatus;
  assignee?: string;
  due_date?: string;
  description?: string;
}

export const useContentItems = () => {
  return useQuery({
    queryKey: ['content-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentItem[];
    },
  });
};

export const useCreateContentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContentInput) => {
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          title: input.title,
          type: input.type,
          status: input.status,
          assignee: input.assignee || null,
          due_date: input.due_date || null,
          description: input.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast.success('Content item created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create content: ' + error.message);
    },
  });
};

export const useUpdateContentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast.success('Content item updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update content: ' + error.message);
    },
  });
};

export const useDeleteContentItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast.success('Content item deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete content: ' + error.message);
    },
  });
};
