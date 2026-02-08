import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Representative {
  id: string;
  full_name: string;
}

interface Coupon {
  id: string;
  code: string;
  active: boolean;
  install_discount_enabled: boolean;
  install_discount_mode: string;
  install_discount_value: number;
  monthly_discount_enabled: boolean;
  monthly_discount_mode: string;
  monthly_discount_value: number;
  representative_id: string | null;
  commission_mode: string;
  commission_value: number;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  active: true,
  install_discount_enabled: false,
  install_discount_mode: "percent",
  install_discount_value: "",
  monthly_discount_enabled: false,
  monthly_discount_mode: "percent",
  monthly_discount_value: "",
  representative_id: "" as string,
  commission_mode: "fixed",
  commission_value: "",
};

// Mask: currency 0,01–999,99 or percent 0–100
const formatMaskedValue = (raw: string, mode: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (mode === "percent") {
    const num = parseInt(digits, 10);
    if (num > 100) return "100";
    return String(num);
  }
  // fixed: treat as cents, max 99999 (999,99)
  let cents = parseInt(digits, 10);
  if (cents > 99999) cents = 99999;
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  return `${reais},${String(centavos).padStart(2, "0")}`;
};

const parseMaskedToNumber = (value: string, mode: string): number => {
  if (!value) return 0;
  if (mode === "percent") return parseInt(value, 10) || 0;
  return parseFloat(value.replace(",", ".")) || 0;
};

const numberToMasked = (value: number, mode: string): string => {
  if (!value) return "";
  if (mode === "percent") return String(Math.min(Math.round(value), 100));
  return value.toFixed(2).replace(".", ",");
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [couponsRes, repsRes] = await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("representatives").select("id, full_name").eq("active", true).order("full_name"),
    ]);
    setCoupons((couponsRes.data || []) as Coupon[]);
    setReps((repsRes.data || []) as Representative[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const repName = (id: string | null) => {
    if (!id) return "—";
    return reps.find(r => r.id === id)?.full_name || "—";
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      active: c.active,
      install_discount_enabled: c.install_discount_enabled,
      install_discount_mode: c.install_discount_mode,
      install_discount_value: numberToMasked(c.install_discount_value, c.install_discount_mode),
      monthly_discount_enabled: c.monthly_discount_enabled,
      monthly_discount_mode: c.monthly_discount_mode,
      monthly_discount_value: numberToMasked(c.monthly_discount_value, c.monthly_discount_mode),
      representative_id: c.representative_id || "",
      commission_mode: c.commission_mode || "fixed",
      commission_value: numberToMasked(c.commission_value || 0, c.commission_mode || "fixed"),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      toast({ title: "Erro", description: "O código do cupom é obrigatório.", variant: "destructive" });
      return;
    }

    const payload = {
      code,
      active: form.active,
      install_discount_enabled: form.install_discount_enabled,
      install_discount_mode: form.install_discount_mode,
      install_discount_value: parseMaskedToNumber(form.install_discount_value, form.install_discount_mode),
      monthly_discount_enabled: form.monthly_discount_enabled,
      monthly_discount_mode: form.monthly_discount_mode,
      monthly_discount_value: parseMaskedToNumber(form.monthly_discount_value, form.monthly_discount_mode),
      representative_id: form.representative_id || null,
      commission_mode: form.commission_mode,
      commission_value: parseMaskedToNumber(form.commission_value, form.commission_mode),
    };

    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cupom atualizado" });
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cupom criado" });
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleToggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    fetchData();
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Excluir o cupom "${c.code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", c.id);
    toast({ title: "Cupom excluído" });
    fetchData();
  };

  const formatDiscount = (mode: string, value: number) =>
    mode === "percent" ? `${value}%` : `R$ ${value.toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{coupons.length} cupom(s) cadastrado(s)</p>
        <Button onClick={openNew} className="bg-base-color hover:bg-base-color/90 text-white font-alt">
          <Plus size={16} className="mr-2" /> Novo Cupom
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Código</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Instalação</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Mensalidade</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Representante</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Comissão</th>
                <th className="text-center px-4 py-3 font-alt font-semibold text-foreground">Ativo</th>
                <th className="text-right px-4 py-3 font-alt font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum cupom cadastrado</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">{c.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.install_discount_enabled ? formatDiscount(c.install_discount_mode, c.install_discount_value) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.monthly_discount_enabled ? formatDiscount(c.monthly_discount_mode, c.monthly_discount_value) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{repName(c.representative_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.commission_value > 0 ? formatDiscount(c.commission_mode, c.commission_value) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={c.active} onCheckedChange={() => handleToggle(c)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(c)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-alt">{editing ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Código do cupom</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ex: PROMO10" className="uppercase" />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm">Cupom ativo</span>
            </div>

            {/* Representante */}
            <div className="border rounded-lg p-4 space-y-3">
              <span className="text-sm font-medium">Representante vinculado</span>
              <Select value={form.representative_id || "none"} onValueChange={(v) => setForm({ ...form, representative_id: v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um representante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {reps.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.representative_id && form.representative_id !== "none" && (
                <>
                  <label className="text-xs text-muted-foreground">Comissão sob instalação</label>
                  <div className="flex gap-3 items-center">
                    <Select value={form.commission_mode} onValueChange={(v) => setForm({ ...form, commission_mode: v, commission_value: "" })}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Valor fixo</SelectItem>
                        <SelectItem value="percent">Percentual</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      {form.commission_mode === "fixed" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>}
                      <Input
                        type="text" inputMode="numeric"
                        value={form.commission_value}
                        onChange={(e) => setForm({ ...form, commission_value: formatMaskedValue(e.target.value, form.commission_mode) })}
                        placeholder={form.commission_mode === "percent" ? "10" : "50,00"}
                        className={`${form.commission_mode === "fixed" ? "pl-10" : ""} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                      {form.commission_mode === "percent" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Install discount */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={form.install_discount_enabled} onCheckedChange={(v) => setForm({ ...form, install_discount_enabled: v })} />
                <span className="text-sm font-medium">Desconto na instalação</span>
              </div>
              {form.install_discount_enabled && (
                <div className="flex gap-3 items-center">
                  <Select value={form.install_discount_mode} onValueChange={(v) => setForm({ ...form, install_discount_mode: v, install_discount_value: "" })}>
                    <SelectTrigger className="w-[120px] shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentual</SelectItem>
                      <SelectItem value="fixed">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    {form.install_discount_mode === "fixed" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>}
                    <Input
                      type="text" inputMode="numeric"
                      value={form.install_discount_value}
                      onChange={(e) => setForm({ ...form, install_discount_value: formatMaskedValue(e.target.value, form.install_discount_mode) })}
                      placeholder={form.install_discount_mode === "percent" ? "10" : "50,00"}
                      className={`${form.install_discount_mode === "fixed" ? "pl-10" : ""} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                    {form.install_discount_mode === "percent" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Monthly discount */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={form.monthly_discount_enabled} onCheckedChange={(v) => setForm({ ...form, monthly_discount_enabled: v })} />
                <span className="text-sm font-medium">Desconto na mensalidade</span>
              </div>
              {form.monthly_discount_enabled && (
                <div className="flex gap-3 items-center">
                  <Select value={form.monthly_discount_mode} onValueChange={(v) => setForm({ ...form, monthly_discount_mode: v, monthly_discount_value: "" })}>
                    <SelectTrigger className="w-[120px] shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentual</SelectItem>
                      <SelectItem value="fixed">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    {form.monthly_discount_mode === "fixed" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>}
                    <Input
                      type="text" inputMode="numeric"
                      value={form.monthly_discount_value}
                      onChange={(e) => setForm({ ...form, monthly_discount_value: formatMaskedValue(e.target.value, form.monthly_discount_mode) })}
                      placeholder={form.monthly_discount_mode === "percent" ? "10" : "15,00"}
                      className={`${form.monthly_discount_mode === "fixed" ? "pl-10" : ""} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                    {form.monthly_discount_mode === "percent" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-base-color hover:bg-base-color/90 text-white font-alt">
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
