import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientLogo {
  id: string;
  name: string;
  image_url: string;
  url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export function useClientLogos(onlyActive = true) {
  return useQuery({
    queryKey: ["client-logos", onlyActive],
    queryFn: async () => {
      let query = supabase
        .from("client_logos")
        .select("*")
        .order("sort_order", { ascending: true });

      if (onlyActive) {
        query = query.eq("active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ClientLogo[];
    },
  });
}
