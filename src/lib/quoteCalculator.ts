import type { Coupon } from "./coupons";

export interface QuoteResult {
  plan: string;
  monthlyLabel: string;
  installLabel: string;
  couponLine: string | null;
}

function brl(value: number): string {
  return value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function applyDiscount(
  amount: number,
  enabled: boolean,
  mode: string,
  value: number
): { final: number; label: string | null } {
  if (!enabled) return { final: amount, label: null };

  let final = amount;
  let label: string | null = null;

  if (mode === "percent") {
    final = amount * (1 - value / 100);
    const valStr = value.toString();
    label = (valStr.includes(".") ? valStr.replace(".", ",").replace(/,?0+$/, "") : valStr) + "%";
  } else if (mode === "value") {
    final = amount - value;
    label = "R$ " + brl(value);
  }

  if (final < 0) final = 0;
  return { final, label };
}

const HEAVY_TYPES = ["caminhao", "trator_maquina", "embarcacao", "aeronave"];

export function computeQuote(
  vehicleType: string,
  remoteBlocking: string,
  coupon: Coupon | null
): QuoteResult {
  if (!vehicleType) {
    return { plan: "—", monthlyLabel: "—", installLabel: "—", couponLine: null };
  }

  let plan = "—";
  let monthlyLabel = "—";
  let installAmountBase: number;
  let installPrefix = "";

  const rb = !HEAVY_TYPES.includes(vehicleType) && !remoteBlocking ? "sim" : remoteBlocking;

  if (HEAVY_TYPES.includes(vehicleType)) {
    plan = "GuardianHeavy";
    monthlyLabel = "R$ " + brl(68.9);
    installAmountBase = 150;
    installPrefix = "A partir de ";
  } else {
    if (rb === "sim") {
      plan = "GuardianSecure";
      monthlyLabel = "R$ " + brl(64.9);
    } else if (rb === "nao") {
      plan = "GuardianEssential";
      monthlyLabel = "R$ " + brl(58.9);
    }
    installAmountBase = 120;
  }

  let installFinal = installAmountBase;
  let couponLine: string | null = null;

  if (coupon && coupon.install_discount_enabled) {
    const { final, label } = applyDiscount(
      installAmountBase,
      coupon.install_discount_enabled,
      coupon.install_discount_mode,
      coupon.install_discount_value
    );
    installFinal = final;
    if (label) {
      couponLine = `${coupon.code} — desconto na instalação de ${label}.`;
    }
  }

  const installLabel = installPrefix + "R$ " + brl(installFinal);

  return { plan, monthlyLabel, installLabel, couponLine };
}
