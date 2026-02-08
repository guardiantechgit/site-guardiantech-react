import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tag, FileText, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ coupons: 0, activeCoupons: 0, submissions: 0, newSubmissions: 0, pfSubmissions: 0, pjSubmissions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [couponsRes, submissionsRes] = await Promise.all([
        supabase.from("coupons").select("id, active"),
        supabase.from("form_submissions").select("id, status, form_type"),
      ]);
      const coupons = couponsRes.data || [];
      const subs = submissionsRes.data || [];
      setStats({
        coupons: coupons.length,
        activeCoupons: coupons.filter((c) => c.active).length,
        submissions: subs.length,
        newSubmissions: subs.filter((s) => s.status === "novo").length,
        pfSubmissions: subs.filter((s) => (s.form_type || "pf") === "pf").length,
        pjSubmissions: subs.filter((s) => s.form_type === "pj").length,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Cupons ativos", value: stats.activeCoupons, total: stats.coupons, icon: Tag, color: "bg-base-color", link: "/admin/cupons" },
    { label: "Novos formulários", value: stats.newSubmissions, total: stats.submissions, icon: FileText, color: "bg-emerald-500", link: "/admin/formularios", subtitle: `PF: ${stats.pfSubmissions} · PJ: ${stats.pjSubmissions}` },
    { label: "Contratos", value: 2, total: 2, icon: ScrollText, color: "bg-blue-500", link: "/admin/contratos", subtitle: "Pessoa Física e Jurídica" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <p className="font-alt text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-muted-foreground text-xs">{(card as any).subtitle || `${card.total} total`}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
