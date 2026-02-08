export interface Coupon {
  code: string;
  install_discount_enabled: boolean;
  install_discount_mode: "percent" | "value";
  install_discount_value: number;
  monthly_discount_enabled: boolean;
  monthly_discount_mode: "percent" | "value";
  monthly_discount_value: number;
}

export const GT_COUPONS: Coupon[] = [
  {
    code: "WESLAO",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "TRIPZERO19",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "DEMATEI",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "GARAGE62",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "MARCELINHO",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "NEICRAVEIRO",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
  {
    code: "EDSON",
    install_discount_enabled: true,
    install_discount_mode: "percent",
    install_discount_value: 10,
    monthly_discount_enabled: false,
    monthly_discount_mode: "percent",
    monthly_discount_value: 0,
  },
];

export function findCoupon(rawCode: string): Coupon | null {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return null;
  return GT_COUPONS.find((c) => c.code.toUpperCase() === code) || null;
}
