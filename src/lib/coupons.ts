import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  code: string;
  install_discount_enabled: boolean;
  install_discount_mode: "percent" | "value";
  install_discount_value: number;
  monthly_discount_enabled: boolean;
  monthly_discount_mode: "percent" | "value";
  monthly_discount_value: number;
}

export async function findCoupon(rawCode: string): Promise<Coupon | null> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return null;

  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;

  return {
    code: data.code,
    install_discount_enabled: data.install_discount_enabled,
    install_discount_mode: data.install_discount_mode as "percent" | "value",
    install_discount_value: data.install_discount_value,
    monthly_discount_enabled: data.monthly_discount_enabled,
    monthly_discount_mode: data.monthly_discount_mode as "percent" | "value",
    monthly_discount_value: data.monthly_discount_value,
  };
}
