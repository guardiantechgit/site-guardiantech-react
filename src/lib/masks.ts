// Input masks for Brazilian formats

export function onlyDigits(v: string): string {
  return (v || "").replace(/\D+/g, "");
}

export function formatPhoneBR(digits: string): string {
  const d = (digits || "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

export function formatCPF(digits: string): string {
  let d = (digits || "").slice(0, 11);
  d = d.replace(/(\d{3})(\d)/, "$1.$2");
  d = d.replace(/(\d{3})(\d)/, "$1.$2");
  d = d.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d;
}

export function formatCEP(digits: string): string {
  const d = (digits || "").slice(0, 8);
  return d.length <= 5 ? d : d.slice(0, 5) + "-" + d.slice(5);
}

export function formatPlate(raw: string): string {
  const alnum = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (alnum.length <= 3) return alnum;
  return alnum.slice(0, 3) + "-" + alnum.slice(3);
}

export function sanitizeUsername(value: string): string {
  return (value || "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 30);
}
