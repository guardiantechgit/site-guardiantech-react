import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer } from "lucide-react";

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

const AdminCommissions = () => {
  const [reports, setReports] = useState<RepReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRep, setFilterRep] = useState<string>("all");
  const [allReps, setAllReps] = useState<Representative[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

    // Build map: rep -> coupons -> eligible submissions
    const repMap = new Map<string, RepReport>();

    for (const rep of reps) {
      const repCoupons = coupons.filter(c => c.representative_id === rep.id && c.commission_value > 0);
      if (repCoupons.length === 0) continue;

      const couponReports: RepReport["coupons"] = [];

      for (const coupon of repCoupons) {
        // Only paid+installed submissions count for commission
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

  const filteredReports = filterRep === "all" ? reports : reports.filter(r => r.rep.id === filterRep);

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const win = window.open("", "_blank");
    if (!win) return;

    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    win.document.write(`
      <html><head><title>Relatório de Comissões — GuardianTech</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Be Vietnam Pro', Arial, sans-serif; padding: 0; color: #333; font-size: 15px; }
        
        .print-header {
          border-bottom: 3px solid #AF985A;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .print-header img { height: 70px; }
        .print-header-info { text-align: right; font-size: 14px; color: #777; }
        .print-header-info strong { color: #AF985A; font-size: 17px; display: block; margin-bottom: 2px; }

        .print-title {
          border-bottom: 1px solid #e5e5e5;
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #AF985A;
          text-transform: uppercase;
        }

        .print-body { padding: 24px 32px; }

        .rep-block { margin-bottom: 28px; page-break-inside: avoid; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .rep-header { padding: 16px 20px; border-bottom: 2px solid #AF985A; }
        .rep-name { font-size: 20px; font-weight: 700; color: #1a1a1a; }
        .rep-info { font-size: 14px; color: #555; margin-top: 6px; display: flex; gap: 20px; flex-wrap: wrap; }
        .rep-info span { display: inline-flex; align-items: center; gap: 4px; }

        .coupon-block { padding: 14px 20px; }
        .coupon-title { 
          font-weight: 600; font-size: 16px; color: #AF985A; 
          margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px dashed #ddd; padding-bottom: 8px;
        }

        .entries-table { width: 100%; border-collapse: collapse; font-size: 15px; }
        .entries-table th { 
          text-align: left; padding: 8px 10px; font-weight: 600; font-size: 13px; 
          text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 1px solid #ddd;
        }
        .entries-table th:last-child { text-align: right; }
        .entries-table td { padding: 9px 10px; border-bottom: 1px solid #f0f0f0; }
        .entries-table td:last-child { text-align: right; font-weight: 600; color: #1a1a1a; }
        .entries-table tr:last-child td { border-bottom: none; }

        .subtotal-row { 
          display: flex; justify-content: space-between; 
          padding: 10px 20px; font-size: 16px; font-weight: 600;
          border-top: 1px solid #ddd;
        }

        .grand-total { 
          border-top: 2px solid #AF985A;
          padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
        }
        .grand-total-label { font-size: 18px; font-weight: 700; color: #1a1a1a; }
        .grand-total-value { font-size: 24px; font-weight: 700; color: #AF985A; }
        .grand-total-pix { font-size: 13px; color: #888; margin-top: 2px; }

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
        <img src="/images/logo-rastreamento-branco.png" alt="GuardianTech Rastreamento" />
        <div class="print-header-info">
          <strong>Relatório de Comissões</strong>
          ${today}
        </div>
      </div>

      <div class="print-title">COMISSÕES POR REPRESENTANTE</div>

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
                <span>Subtotal ${coupon.code}</span>
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
        <div className="flex items-center gap-3">
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
        </div>
        <Button onClick={handlePrint} variant="outline" className="font-alt" disabled={filteredReports.length === 0}>
          <Printer size={16} className="mr-2" /> Imprimir / PDF
        </Button>
      </div>

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
                  {report.rep.pix_key && <span className="pix">PIX: {report.rep.pix_key}</span>}
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
                      <span>Subtotal {coupon.code}:</span>
                      <span>{formatCurrency(coupon.total)}</span>
                    </div>
                  </div>
                ))}

                <div className="grand-total bg-blue-50 rounded-lg p-4 flex justify-between items-center">
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
