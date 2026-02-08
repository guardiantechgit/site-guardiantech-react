import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const trimmed = (code || "").trim().toUpperCase();

    if (!trimmed) {
      return new Response(JSON.stringify({ coupon: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("coupons")
      .select("code, install_discount_enabled, install_discount_mode, install_discount_value, monthly_discount_enabled, monthly_discount_mode, monthly_discount_value")
      .eq("code", trimmed)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ coupon: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ coupon: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("validate-coupon error:", e);
    return new Response(JSON.stringify({ coupon: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
