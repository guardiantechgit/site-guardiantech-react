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

    win.document.write(`
      <html><head><title>Relatório de Comissões</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 20px; margin-bottom: 20px; }
        .rep-block { margin-bottom: 30px; page-break-inside: avoid; }
        .rep-header { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
        .rep-name { font-size: 16px; font-weight: bold; }
        .rep-info { font-size: 12px; color: #666; }
        .coupon-block { margin-left: 16px; margin-bottom: 12px; }
        .coupon-title { font-weight: bold; font-size: 14px; margin-bottom: 6px; }
        .entry { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
        .subtotal { font-weight: bold; border-top: 1px solid #ddd; padding-top: 4px; margin-top: 4px; }
        .grand-total { font-size: 16px; font-weight: bold; background: #e0f2fe; padding: 10px; border-radius: 6px; margin-top: 10px; }
        .pix { font-size: 13px; color: #666; }
      </style></head><body>
      <h1>Relatório de Comissões — ${new Date().toLocaleDateString("pt-BR")}</h1>
      ${printContent.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
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
