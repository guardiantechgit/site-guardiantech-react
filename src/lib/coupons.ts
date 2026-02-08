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

  const { data, error } = await supabase.rpc("validate_coupon", { coupon_code: code });

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  return {
    code: row.code,
    install_discount_enabled: row.install_discount_enabled,
    install_discount_mode: row.install_discount_mode as "percent" | "value",
    install_discount_value: row.install_discount_value,
    monthly_discount_enabled: row.monthly_discount_enabled,
    monthly_discount_mode: row.monthly_discount_mode as "percent" | "value",
    monthly_discount_value: row.monthly_discount_value,
  };
}
