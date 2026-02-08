import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Coupon = Tables<"coupons">;

const emptyCoupon = {
  code: "",
  active: true,
  install_discount_enabled: false,
  install_discount_mode: "percent" as string,
  install_discount_value: 0,
  monthly_discount_enabled: false,
  monthly_discount_mode: "percent" as string,
  monthly_discount_value: 0,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

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
      install_discount_value: c.install_discount_value,
      monthly_discount_enabled: c.monthly_discount_enabled,
      monthly_discount_mode: c.monthly_discount_mode,
      monthly_discount_value: c.monthly_discount_value,
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
      install_discount_value: Number(form.install_discount_value) || 0,
      monthly_discount_enabled: form.monthly_discount_enabled,
      monthly_discount_mode: form.monthly_discount_mode,
      monthly_discount_value: Number(form.monthly_discount_value) || 0,
    };

    if (editing) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Cupom atualizado" });
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Cupom criado" });
    }
    setDialogOpen(false);
    fetchCoupons();
  };

  const handleToggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    fetchCoupons();
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Excluir o cupom "${c.code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", c.id);
    toast({ title: "Cupom excluído" });
    fetchCoupons();
  };

  const formatDiscount = (mode: string, value: number) => {
    return mode === "percent" ? `${value}%` : `R$ ${value.toFixed(2)}`;
  };

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
                <th className="text-center px-4 py-3 font-alt font-semibold text-foreground">Ativo</th>
                <th className="text-right px-4 py-3 font-alt font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum cupom cadastrado</td></tr>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-alt">{editing ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Código do cupom</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Ex: PROMO10"
                className="uppercase"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <span className="text-sm">Cupom ativo</span>
            </div>

            {/* Install discount */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.install_discount_enabled}
                  onCheckedChange={(v) => setForm({ ...form, install_discount_enabled: v })}
                />
                <span className="text-sm font-medium">Desconto na instalação</span>
              </div>
              {form.install_discount_enabled && (
                <div className="flex gap-3">
                  <Select
                    value={form.install_discount_mode}
                    onValueChange={(v) => setForm({ ...form, install_discount_mode: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentual</SelectItem>
                      <SelectItem value="fixed">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={form.install_discount_value}
                    onChange={(e) => setForm({ ...form, install_discount_value: Number(e.target.value) })}
                    placeholder={form.install_discount_mode === "percent" ? "Ex: 10" : "Ex: 50.00"}
                  />
                </div>
              )}
            </div>

            {/* Monthly discount */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.monthly_discount_enabled}
                  onCheckedChange={(v) => setForm({ ...form, monthly_discount_enabled: v })}
                />
                <span className="text-sm font-medium">Desconto na mensalidade</span>
              </div>
              {form.monthly_discount_enabled && (
                <div className="flex gap-3">
                  <Select
                    value={form.monthly_discount_mode}
                    onValueChange={(v) => setForm({ ...form, monthly_discount_mode: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentual</SelectItem>
                      <SelectItem value="fixed">Valor fixo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    value={form.monthly_discount_value}
                    onChange={(e) => setForm({ ...form, monthly_discount_value: Number(e.target.value) })}
                    placeholder={form.monthly_discount_mode === "percent" ? "Ex: 10" : "Ex: 15.00"}
                  />
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
