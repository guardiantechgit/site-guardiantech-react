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

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-coupon`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ code }),
      }
    );

    if (!res.ok) return null;

    const { coupon } = await res.json();
    if (!coupon) return null;

    return {
      code: coupon.code,
      install_discount_enabled: coupon.install_discount_enabled,
      install_discount_mode: coupon.install_discount_mode as "percent" | "value",
      install_discount_value: coupon.install_discount_value,
      monthly_discount_enabled: coupon.monthly_discount_enabled,
      monthly_discount_mode: coupon.monthly_discount_mode as "percent" | "value",
      monthly_discount_value: coupon.monthly_discount_value,
    };
  } catch {
    return null;
  }
}
