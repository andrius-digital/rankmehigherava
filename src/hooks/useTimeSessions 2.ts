
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TimeSession {
    id: string;
    team_member_id: string;
    clock_in: string;
    clock_out: string | null;
    total_work_seconds: number;
    total_break_seconds: number;
    status: 'active' | 'completed';
}

export const useTimeSessions = () => {
    const queryClient = useQueryClient();

    const { data: activeSessions = [], isLoading } = useQuery({
        queryKey: ["time_sessions", "active"],
        queryFn: async () => {
            // Get all active sessions
            const { data, error } = await supabase
                .from("time_sessions")
                .select("*, team_members(name)")
                .eq("status", "active")
                .order("clock_in", { ascending: false });

            if (error) {
                console.error("Error loading sessions", error);
                return [];
            }
            return data;
        },
        // Refetch often to keep timers roughly validated? Or just local.
        // simpler to just fetch once for now.
    });

    const clockIn = useMutation({
        mutationFn: async (teamMemberId: string) => {
            // Check if already active? (Optional safety)

            const { data, error } = await supabase
                .from("time_sessions")
                .insert({
                    team_member_id: teamMemberId,
                    status: "active",
                    clock_in: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_sessions"] });
            toast.success("Clocked in successfully");
        },
        onError: (err: any) => {
            toast.error("Failed to clock in: " + err.message);
        },
    });

    const clockOut = useMutation({
        mutationFn: async ({ sessionId }: { sessionId: string }) => {
            const now = new Date();
            // We rely on backend or client to calc total seconds. 
            // For simplicity, we just mark out time. Real app would calc diff.
            const { error } = await supabase
                .from("time_sessions")
                .update({
                    clock_out: now.toISOString(),
                    status: "completed"
                    // We aren't calculating total_work_seconds here yet for brevity, 
                    // usually done via Database Trigger or Edge Function for accuracy.
                })
                .eq("id", sessionId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_sessions"] });
            toast.success("Clocked out");
        },
        onError: (err: any) => toast.error(err.message)
    });

    return {
        activeSessions,
        isLoading,
        clockIn,
        clockOut
    };
};
