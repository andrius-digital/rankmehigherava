import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
}

// Fetch all profiles (for assignee dropdown)
export function useProfiles() {
    return useQuery({
        queryKey: ["profiles"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, user_id, full_name, email, avatar_url")
                .order("full_name", { ascending: true });

            if (error) throw error;
            return data as Profile[];
        },
    });
}
