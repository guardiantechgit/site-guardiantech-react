import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Representative {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  pix_key: string | null;
}

interface CouponWithRep {
  id: string;
  code: string;
  commission_mode: string;
  commission_value: number;
  representative_id: string | null;
}

interface Submission {
  id: string;
  full_name: string;
  coupon_code: string | null;
  install_value: string | null;
  installation_paid: boolean;
  status: string;
  created_at: string;
}

interface CommissionEntry {
  submissionName: string;
  commissionAmount: number;
  installValue: number;
  couponCode: string;
  date: string;
  rawDate: Date;
}

interface RepReport {
  rep: Representative;
  coupons: {
    code: string;
    entries: CommissionEntry[];
    total: number;
  }[];
  grandTotal: number;
}

type DateFilter = "current_month" | "last_month" | "custom";

function getMonthRange(offset: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const AdminCommissions = () => {
  const [reports, setReports] = useState<RepReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRep, setFilterRep] = useState<string>("all");
  const [allReps, setAllReps] = useState<Representative[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("current_month");
  const [customStart, setCustomStart] = useState(() => formatDateInput(getMonthRange(0).start));
  const [customEnd, setCustomEnd] = useState(() => formatDateInput(getMonthRange(0).end));
  const [copiedPix, setCopiedPix] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const getDateRange = (): { start: Date; end: Date } => {
    if (dateFilter === "last_month") return getMonthRange(-1);
    if (dateFilter === "current_month") return getMonthRange(0);
    return {
      start: new Date(customStart + "T00:00:00"),
      end: new Date(customEnd + "T23:59:59.999"),
    };
  };

  const fetchData = async () => {
    setLoading(true);

    const [repsRes, couponsRes, subsRes] = await Promise.all([
      supabase.from("representatives").select("*"),
      supabase.from("coupons").select("id, code, commission_mode, commission_value, representative_id"),
      supabase.from("form_submissions").select("id, full_name, coupon_code, install_value, installation_paid, status, created_at")
        .in("status", ["instalado", "confirmado"]),
    ]);

    const reps = (repsRes.data || []) as Representative[];
    const coupons = (couponsRes.data || []) as CouponWithRep[];
    const subs = (subsRes.data || []) as Submission[];

    setAllReps(reps);

    const repMap = new Map<string, RepReport>();

    for (const rep of reps) {
      const repCoupons = coupons.filter(c => c.representative_id === rep.id && c.commission_value > 0);
      if (repCoupons.length === 0) continue;

      const couponReports: RepReport["coupons"] = [];

      for (const coupon of repCoupons) {
        const eligibleSubs = subs.filter(
          s => s.coupon_code?.toUpperCase() === coupon.code.toUpperCase()
            && s.status === "instalado"
            && s.installation_paid
        );

        if (eligibleSubs.length === 0) continue;

        const entries: CommissionEntry[] = eligibleSubs.map(s => {
          const installVal = parseFloat((s.install_value || "0").replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
          const commissionAmount = coupon.commission_mode === "percent"
            ? installVal * (coupon.commission_value / 100)
            : coupon.commission_value;

          return {
            submissionName: s.full_name,
            commissionAmount,
            installValue: installVal,
            couponCode: coupon.code,
            date: new Date(s.created_at).toLocaleDateString("pt-BR"),
            rawDate: new Date(s.created_at),
          };
        });

        couponReports.push({
          code: coupon.code,
          entries,
          total: entries.reduce((sum, e) => sum + e.commissionAmount, 0),
        });
      }

      if (couponReports.length > 0) {
        repMap.set(rep.id, {
          rep,
          coupons: couponReports,
          grandTotal: couponReports.reduce((sum, c) => sum + c.total, 0),
        });
      }
    }

    setReports(Array.from(repMap.values()));
    setLoading(false);
  };

  // Apply date filter to reports
  const applyDateFilter = (reps: RepReport[]): RepReport[] => {
    const { start, end } = getDateRange();
    return reps.map(report => {
      const filteredCoupons = report.coupons
        .map(coupon => {
          const filteredEntries = coupon.entries.filter(e => e.rawDate >= start && e.rawDate <= end);
          return { ...coupon, entries: filteredEntries, total: filteredEntries.reduce((sum, e) => sum + e.commissionAmount, 0) };
        })
        .filter(c => c.entries.length > 0);

      return {
        ...report,
        coupons: filteredCoupons,
        grandTotal: filteredCoupons.reduce((sum, c) => sum + c.total, 0),
      };
    }).filter(r => r.coupons.length > 0);
  };

  const filteredByRep = filterRep === "all" ? reports : reports.filter(r => r.rep.id === filterRep);
  const filteredReports = applyDateFilter(filteredByRep);

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const copyPix = async (pixKey: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedPix(pixKey);
      toast({ title: "Chave PIX copiada!" });
      setTimeout(() => setCopiedPix(null), 2000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  const dateFilterLabel = (): string => {
    const { start, end } = getDateRange();
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${fmt(start)} — ${fmt(end)}`;
  };

  const handlePrint = async () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    let logoBase64 = "";
    try {
      const resp = await fetch("/images/logo-rastreamento-branco.png");
      const blob = await resp.blob();
      logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch { /* fallback: no logo */ }

    const win = window.open("", "_blank");
    if (!win) return;

    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const periodLabel = dateFilterLabel();

    win.document.write(`
      <html><head><title>Relatório de Comissões — GuardianTech</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Be Vietnam Pro', Arial, sans-serif; padding: 0; color: #333; font-size: 12px; }
        
        .print-header {
          border-bottom: 3px solid #AF985A;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .print-header img { height: 55px; }
        .print-header-info { text-align: right; font-size: 11px; color: #777; }
        .print-header-info strong { color: #AF985A; font-size: 14px; display: block; margin-bottom: 2px; }

        .print-title {
          border-bottom: 1px solid #e5e5e5;
          padding: 10px 28px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #AF985A;
          text-transform: uppercase;
        }
        .print-period {
          padding: 6px 28px;
          font-size: 11px;
          color: #777;
          border-bottom: 1px solid #e5e5e5;
        }

        .print-body { padding: 20px 28px; }

        .rep-block { margin-bottom: 22px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .rep-header { padding: 12px 16px; border-bottom: 2px solid #AF985A; }
        .rep-name { font-size: 15px; font-weight: 700; color: #1a1a1a; }
        .rep-info { font-size: 11px; color: #555; margin-top: 4px; display: flex; gap: 16px; flex-wrap: wrap; }
        .rep-info span { display: inline-flex; align-items: center; gap: 4px; }

        .coupon-block { padding: 10px 16px; }
        .coupon-title { 
          font-weight: 600; font-size: 12px; color: #AF985A; 
          margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px dashed #ddd; padding-bottom: 6px;
        }

        .entries-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .entries-table th { 
          text-align: left; padding: 6px 8px; font-weight: 600; font-size: 10px; 
          text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 1px solid #ddd;
        }
        .entries-table th:last-child { text-align: right; }
        .entries-table td { padding: 7px 8px; border-bottom: 1px solid #f0f0f0; }
        .entries-table td:last-child { text-align: right; font-weight: 600; color: #1a1a1a; }
        .entries-table tr:last-child td { border-bottom: none; }

        .subtotal-row { 
          display: flex; justify-content: space-between; 
          padding: 8px 16px; font-size: 12px; font-weight: 600;
          border-top: 1px solid #ddd;
        }

        .grand-total { 
          border-top: 2px solid #AF985A;
          padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
        }
        .grand-total-label { font-size: 14px; font-weight: 700; color: #1a1a1a; }
        .grand-total-value { font-size: 18px; font-weight: 700; color: #AF985A; }
        .grand-total-pix { font-size: 10px; color: #888; margin-top: 2px; }

        .print-footer {
          margin-top: 32px; padding: 16px 32px; border-top: 2px solid #ddd;
          font-size: 10px; color: #999; text-align: center;
        }
        .print-footer strong { color: #AF985A; }

        @media print {
          body { padding: 0; }
          .rep-block { break-inside: avoid; }
        }
      </style></head><body>

      <div class="print-header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="GuardianTech Rastreamento" />` : `<span style="font-size:18px;font-weight:700;color:#AF985A;">GuardianTech Rastreamento</span>`}
        <div class="print-header-info">
          <strong>Relatório de Comissões</strong>
          ${today}
        </div>
      </div>

      <div class="print-title">COMISSÕES POR REPRESENTANTE</div>
      <div class="print-period">Período: ${periodLabel}</div>

      <div class="print-body">
        ${filteredReports.map(report => `
          <div class="rep-block">
            <div class="rep-header">
              <div class="rep-name">${report.rep.full_name}</div>
              <div class="rep-info">
                ${report.rep.cpf ? `<span>CPF: ${report.rep.cpf}</span>` : ""}
                ${report.rep.email ? `<span>✉ ${report.rep.email}</span>` : ""}
                ${report.rep.phone ? `<span>☎ ${report.rep.phone}</span>` : ""}
                ${report.rep.pix_key ? `<span>◈ PIX: ${report.rep.pix_key}</span>` : ""}
              </div>
            </div>
            ${report.coupons.map(coupon => `
              <div class="coupon-block">
                <div class="coupon-title">Cupom: ${coupon.code}</div>
                <table class="entries-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Valor Instalação</th>
                      <th>Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${coupon.entries.map(entry => `
                      <tr>
                        <td>${entry.submissionName}</td>
                        <td>${entry.date}</td>
                        <td>${formatCurrency(entry.installValue)}</td>
                        <td>${formatCurrency(entry.commissionAmount)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
              <div class="subtotal-row">
                <span>Subtotal</span>
                <span>${formatCurrency(coupon.total)}</span>
              </div>
            `).join("")}
            <div class="grand-total">
              <div>
                <div class="grand-total-label">Total a Pagar</div>
                ${report.rep.pix_key ? `<div class="grand-total-pix">Chave PIX: ${report.rep.pix_key}</div>` : ""}
              </div>
              <div class="grand-total-value">${formatCurrency(report.grandTotal)}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="print-footer">
        <strong>GuardianTech</strong> — Segurança, Tecnologia e Rastreamento<br/>
        Documento gerado em ${today} • Este relatório é de uso interno.
      </div>

      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterRep} onValueChange={setFilterRep}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por representante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os representantes</SelectItem>
              {allReps.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês atual</SelectItem>
              <SelectItem value="last_month">Mês anterior</SelectItem>
              <SelectItem value="custom">Intervalo personalizado</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-40"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-40"
              />
            </div>
          )}
        </div>
        <Button onClick={handlePrint} variant="outline" className="font-alt" disabled={filteredReports.length === 0}>
          <Printer size={16} className="mr-2" /> Imprimir / PDF
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Período: {dateFilterLabel()}
      </p>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-muted-foreground">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhuma comissão encontrada.</p>
          <p className="text-xs mt-1">Comissões são geradas quando um cliente usa um cupom, instala e paga a instalação.</p>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6">
          {filteredReports.map((report) => (
            <div key={report.rep.id} className="rep-block bg-white rounded-xl border overflow-hidden">
              <div className="rep-header bg-muted/50 p-4 border-b">
                <p className="rep-name font-alt font-semibold text-foreground text-lg">{report.rep.full_name}</p>
                <div className="rep-info flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-1">
                  {report.rep.email && <span>E-mail: {report.rep.email}</span>}
                  {report.rep.phone && <span>Telefone: {report.rep.phone}</span>}
                  {report.rep.pix_key && (
                    <span className="inline-flex items-center gap-1">
                      PIX: {report.rep.pix_key}
                      <button
                        type="button"
                        onClick={() => copyPix(report.rep.pix_key!)}
                        className="text-muted-foreground hover:text-foreground transition p-0.5"
                        title="Copiar chave PIX"
                      >
                        {copiedPix === report.rep.pix_key ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {report.coupons.map((coupon) => (
                  <div key={coupon.code} className="coupon-block">
                    <p className="coupon-title text-sm font-semibold text-foreground mb-2">
                      Cupom: {coupon.code}
                    </p>
                    {coupon.entries.map((entry, i) => (
                      <div key={i} className="entry flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">
                          {formatCurrency(entry.commissionAmount)} — instalação de <span className="text-foreground font-medium">{entry.submissionName}</span> ({entry.date})
                        </span>
                      </div>
                    ))}
                    <div className="subtotal flex justify-between text-sm font-semibold border-t pt-2 mt-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(coupon.total)}</span>
                    </div>
                  </div>
                ))}

                <div className="grand-total bg-muted/50 rounded-lg p-4 flex justify-between items-center">
                  <span className="font-alt font-bold text-foreground">Total a ser pago:</span>
                  <div className="text-right">
                    <span className="font-alt font-bold text-lg text-foreground">{formatCurrency(report.grandTotal)}</span>
                    {report.rep.pix_key && (
                      <p className="text-xs text-muted-foreground mt-0.5">Chave PIX: {report.rep.pix_key}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommissions;
