import { onlyDigits } from "./masks";

export function isValidCPF(value: string): boolean {
  const c = onlyDigits(value);
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c.charAt(i), 10) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c.charAt(i), 10) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;

  return d2 === parseInt(c.charAt(10), 10);
}

export function isValidPhoneBR(value: string): boolean {
  const d = onlyDigits(value);
  if (!(d.length === 10 || d.length === 11)) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  if (!(ddd >= 11 && ddd <= 99)) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  return true;
}

export function isValidPlate(value: string): boolean {
  const v = (value || "").toUpperCase().trim();
  return /^[A-Z]{3}-(\d{4}|\d[A-Z]\d{2})$/.test(v);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
