import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export const useTaskComments = (taskId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task_comments_${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['task_comments', taskId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, queryClient]);

  return useQuery({
    queryKey: ['task_comments', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          profile:profiles!task_comments_user_id_fkey(full_name, email, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { task_id: string; user_id: string; content: string; mentions?: string[] }) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: comment.task_id,
          user_id: comment.user_id,
          content: comment.content,
          mentions: comment.mentions || [],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_comments', variables.task_id] });
    },
    onError: (error) => {
      toast({ title: 'Error adding comment', description: error.message, variant: 'destructive' });
    },
  });
};
