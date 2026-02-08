import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tag, FileText, ScrollText, Users, BarChart3, TrendingUp,
  CheckCircle, XCircle, Truck, CreditCard, Clock, Eye, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

interface Submission {
  id: string;
  status: string;
  form_type: string;
  created_at: string;
  full_name: string;
  vehicle_plate: string | null;
  plan_name: string | null;
  installation_paid: boolean;
  coupon_code: string | null;
  install_value: string | null;
}

interface Coupon {
  id: string;
  code: string;
  active: boolean;
  commission_mode: string;
  commission_value: number;
  representative_id: string | null;
}

interface Representative {
  id: string;
  full_name: string;
  active: boolean;
}

const COLORS = ["#AF985A", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  novo: { label: "Novo", color: "#3b82f6", icon: AlertCircle },
  recebido: { label: "Recebido", color: "#3b82f6", icon: Eye },
  lido: { label: "Lido", color: "#6366f1", icon: Eye },
  confirmado: { label: "Confirmado", color: "#f59e0b", icon: CheckCircle },
  instalado: { label: "Instalado", color: "#8b5cf6", icon: Truck },
  cancelado: { label: "Cancelado", color: "#ef4444", icon: XCircle },
};

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [subRes, coupRes, repRes] = await Promise.all([
        supabase.from("form_submissions").select("id, status, form_type, created_at, full_name, vehicle_plate, plan_name, installation_paid, coupon_code, install_value"),
        supabase.from("coupons").select("id, code, active, commission_mode, commission_value, representative_id"),
        supabase.from("representatives").select("id, full_name, active"),
      ]);
      setSubmissions((subRes.data || []) as Submission[]);
      setCoupons((coupRes.data || []) as Coupon[]);
      setReps((repRes.data || []) as Representative[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    submissions.forEach((s) => {
      const st = s.status === "recebido" || s.status === "novo" ? "recebido" : s.status;
      byStatus[st] = (byStatus[st] || 0) + 1;
    });

    const pf = submissions.filter((s) => (s.form_type || "pf") === "pf").length;
    const pj = submissions.filter((s) => s.form_type === "pj").length;
    const installedPaid = submissions.filter((s) => s.status === "instalado" && s.installation_paid).length;
    const installedPending = submissions.filter((s) => s.status === "instalado" && !s.installation_paid).length;
    const activeCoupons = coupons.filter((c) => c.active).length;
    const couponsWithRep = coupons.filter((c) => c.representative_id).length;
    const activeReps = reps.filter((r) => r.active).length;

    return { byStatus, pf, pj, installedPaid, installedPending, activeCoupons, couponsWithRep, activeReps };
  }, [submissions, coupons, reps]);

  // Chart: submissions by status for pie
  const statusPieData = useMemo(() => {
    return Object.entries(stats.byStatus).map(([key, value]) => ({
      name: statusConfig[key]?.label || key,
      value,
      color: statusConfig[key]?.color || "#999",
    }));
  }, [stats.byStatus]);

  // Chart: submissions over last 30 days
  const timelineData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    submissions.forEach((s) => {
      const day = s.created_at.slice(0, 10);
      if (days[day] !== undefined) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5).replace("-", "/"),
      formulários: count,
    }));
  }, [submissions]);

  // Chart: PF vs PJ bar
  const typeData = useMemo(() => [
    { name: "Pessoa Física", valor: stats.pf },
    { name: "Pessoa Jurídica", valor: stats.pj },
  ], [stats.pf, stats.pj]);

  // Top coupons by usage
  const topCoupons = useMemo(() => {
    const usage: Record<string, number> = {};
    submissions.forEach((s) => {
      if (s.coupon_code) usage[s.coupon_code] = (usage[s.coupon_code] || 0) + 1;
    });
    return Object.entries(usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([code, count]) => ({ code, count }));
  }, [submissions]);

  // Recent submissions
  const recent = useMemo(() => submissions.slice(0, 5), [submissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AF985A]" />
      </div>
    );
  }

  const StatCard = ({ label, value, subtitle, icon: Icon, color, link }: {
    label: string; value: string | number; subtitle?: string; icon: React.ElementType; color: string; link: string;
  }) => (
    <Link to={link} className="bg-white rounded-xl p-5 border hover:shadow-lg transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 ${color} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs uppercase tracking-wide font-medium">{label}</p>
          <p className="font-alt text-2xl font-bold text-foreground leading-tight">{value}</p>
          {subtitle && <p className="text-muted-foreground text-xs mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );

  const getDisplayStatus = (s: Submission) => {
    if (s.status === "instalado" && s.installation_paid) return "Instalado e Pago";
    if (s.status === "instalado") return "Instalado — Pgto Pendente";
    return statusConfig[s.status]?.label || s.status;
  };

  const getStatusColor = (s: Submission) => {
    if (s.status === "instalado" && s.installation_paid) return "bg-emerald-100 text-emerald-700";
    if (s.status === "instalado") return "bg-purple-100 text-purple-700";
    if (s.status === "cancelado") return "bg-red-100 text-red-700";
    if (s.status === "confirmado") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Formulários" value={submissions.length} subtitle={`PF: ${stats.pf} · PJ: ${stats.pj}`} icon={FileText} color="bg-blue-500" link="/admin/formularios" />
        <StatCard label="Novos / Recebidos" value={stats.byStatus.recebido || 0} subtitle="Aguardando análise" icon={Clock} color="bg-amber-500" link="/admin/formularios" />
        <StatCard label="Instalados" value={(stats.installedPaid + stats.installedPending)} subtitle={`${stats.installedPaid} pagos · ${stats.installedPending} pendentes`} icon={Truck} color="bg-emerald-500" link="/admin/formularios" />
        <StatCard label="Cancelados" value={stats.byStatus.cancelado || 0} subtitle="Formulários cancelados" icon={XCircle} color="bg-red-500" link="/admin/formularios" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Cupons Ativos" value={stats.activeCoupons} subtitle={`${coupons.length} total · ${stats.couponsWithRep} com representante`} icon={Tag} color="bg-[#AF985A]" link="/admin/cupons" />
        <StatCard label="Representantes" value={stats.activeReps} subtitle={`${reps.length} total`} icon={Users} color="bg-indigo-500" link="/admin/representantes" />
        <StatCard label="Comissões" value="Ver" subtitle="Relatório detalhado" icon={BarChart3} color="bg-violet-500" link="/admin/comissoes" />
        <StatCard label="Contratos" value={2} subtitle="PF e PJ" icon={ScrollText} color="bg-cyan-600" link="/admin/contratos" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-alt font-semibold text-foreground text-sm">Formulários — Últimos 30 dias</h3>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorForms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AF985A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#AF985A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }} />
                <Area type="monotone" dataKey="formulários" stroke="#AF985A" strokeWidth={2} fill="url(#colorForms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status pie */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-alt font-semibold text-foreground text-sm mb-2">Status dos Formulários</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PF vs PJ */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-alt font-semibold text-foreground text-sm mb-4">Pessoa Física vs Jurídica</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  <Cell fill="#AF985A" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top coupons */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-alt font-semibold text-foreground text-sm mb-4">Cupons Mais Utilizados</h3>
          {topCoupons.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum cupom utilizado</p>
          ) : (
            <div className="space-y-3">
              {topCoupons.map((c, i) => (
                <div key={c.code} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#AF985A]/10 text-[#AF985A] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.code}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full bg-[#AF985A]" style={{ width: `${Math.min(100, (c.count / (topCoupons[0]?.count || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{c.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-alt font-semibold text-foreground text-sm">Últimos Formulários</h3>
            <Link to="/admin/formularios" className="text-xs text-[#AF985A] hover:underline font-medium">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {s.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.vehicle_plate || s.plan_name || "—"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusColor(s)}`}>
                  {getDisplayStatus(s)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status detail cards */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-alt font-semibold text-foreground text-sm mb-4">Detalhamento por Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = key === "recebido"
              ? (stats.byStatus.recebido || 0) + (stats.byStatus.novo || 0)
              : stats.byStatus[key] || 0;
            const Icon = cfg.icon;
            return (
              <div key={key} className="rounded-lg p-4 text-center" style={{ backgroundColor: `${cfg.color}10` }}>
                <Icon size={20} className="mx-auto mb-1" style={{ color: cfg.color }} />
                <p className="text-2xl font-bold font-alt" style={{ color: cfg.color }}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
