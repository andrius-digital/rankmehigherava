
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TimeBreak {
    id: string;
    session_id: string;
    break_start: string;
    break_end: string | null;
    duration_seconds: number;
}

export const useTimeBreaks = (sessionId?: string) => {
    const queryClient = useQueryClient();

    const { data: breaks = [] } = useQuery({
        queryKey: ["time_breaks", sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const { data, error } = await supabase
                .from("time_breaks")
                .select("*")
                .eq("session_id", sessionId)
                .order("break_start", { ascending: true });

            if (error) throw error;
            return data as TimeBreak[];
        },
        enabled: !!sessionId
    });

    const startBreak = useMutation({
        mutationFn: async (sessionId: string) => {
            const { error } = await supabase
                .from("time_breaks")
                .insert({
                    session_id: sessionId,
                    break_start: new Date().toISOString()
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_breaks"] });
            toast.success("Break started");
        },
        onError: (e: any) => toast.error(e.message)
    });

    const endBreak = useMutation({
        mutationFn: async (breakId: string) => {
            const { error } = await supabase
                .from("time_breaks")
                .update({
                    break_end: new Date().toISOString()
                    // duration calculation would happen here or backend
                })
                .eq("id", breakId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_breaks"] });
            toast.success("Break ended");
        },
        onError: (e: any) => toast.error(e.message)
    });

    return {
        breaks,
        startBreak,
        endBreak
    };
};
