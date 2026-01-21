import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TaskStatus = "todo" | "in_progress" | "in_qa" | "issues_found" | "blocker";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority | null;
    assignee_id: string | null;
    due_date: string | null;
    subtasks_count: number | null;
    order_index: number | null;
    created_at: string;
    updated_at: string;
    // Joined data
    assignee?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string;
    due_date?: string;
}

export interface UpdateTaskInput {
    id: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string | null;
    due_date?: string | null;
    order_index?: number;
}

// Fetch all tasks with assignee info
export function useTasks(filters?: { priority?: TaskPriority; assignee_id?: string }) {
    return useQuery({
        queryKey: ["tasks", filters],
        queryFn: async () => {
            let query = supabase
                .from("tasks")
                .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
                .order("order_index", { ascending: true, nullsFirst: false })
                .order("created_at", { ascending: false });

            if (filters?.priority) {
                query = query.eq("priority", filters.priority);
            }
            if (filters?.assignee_id) {
                query = query.eq("assignee_id", filters.assignee_id);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Task[];
        },
    });
}

// Create a new task
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateTaskInput) => {
            const { data, error } = await supabase
                .from("tasks")
                .insert({
                    title: input.title,
                    description: input.description || null,
                    status: input.status || "todo",
                    priority: input.priority || "normal",
                    assignee_id: input.assignee_id || null,
                    due_date: input.due_date || null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}

// Update an existing task
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateTaskInput) => {
            const { id, ...updates } = input;
            const { data, error } = await supabase
                .from("tasks")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}

// Delete a task
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("tasks").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });
}
