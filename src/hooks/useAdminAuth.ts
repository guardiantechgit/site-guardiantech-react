import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAuthenticated(!!data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    checkAuth();
    return () => subscription.unsubscribe();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: "Preencha o e-mail e a senha." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      let translated = "Credenciais inválidas.";
      if (msg.includes("invalid login")) translated = "E-mail ou senha incorretos.";
      else if (msg.includes("email not confirmed")) translated = "E-mail ainda não confirmado.";
      else if (msg.includes("rate limit") || msg.includes("too many")) translated = "Muitas tentativas. Aguarde um momento.";
      else if (msg.includes("network") || msg.includes("fetch")) translated = "Erro de conexão. Verifique sua internet.";
      return { success: false, error: translated };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, loading, login, logout };
}
