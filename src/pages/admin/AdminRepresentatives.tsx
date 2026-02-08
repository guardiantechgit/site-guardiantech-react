import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCPF, formatPhoneBR, onlyDigits } from "@/lib/masks";

interface Representative {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  pix_key: string | null;
  active: boolean;
  created_at: string;
}

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  cpf: "",
  pix_key: "",
  active: true,
};

const AdminRepresentatives = () => {
  const [reps, setReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Representative | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchReps = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("representatives")
      .select("*")
      .order("full_name");
    setReps((data as Representative[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReps(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: Representative) => {
    setEditing(r);
    setForm({
      full_name: r.full_name,
      email: r.email || "",
      phone: r.phone || "",
      cpf: r.cpf || "",
      pix_key: r.pix_key || "",
      active: r.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      cpf: form.cpf.trim() || null,
      pix_key: form.pix_key.trim() || null,
      active: form.active,
    };

    if (editing) {
      const { error } = await supabase.from("representatives").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Representante atualizado" });
    } else {
      const { error } = await supabase.from("representatives").insert(payload);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Representante criado" });
    }
    setDialogOpen(false);
    fetchReps();
  };

  const handleDelete = async (r: Representative) => {
    if (!confirm(`Excluir "${r.full_name}"?`)) return;
    await supabase.from("representatives").delete().eq("id", r.id);
    toast({ title: "Representante excluído" });
    fetchReps();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{reps.length} representante(s)</p>
        <Button onClick={openNew} className="bg-base-color hover:bg-base-color/90 text-white font-alt">
          <Plus size={16} className="mr-2" /> Novo Representante
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Nome</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">E-mail</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Telefone</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Chave PIX</th>
                <th className="text-center px-4 py-3 font-alt font-semibold text-foreground">Ativo</th>
                <th className="text-right px-4 py-3 font-alt font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
              ) : reps.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum representante cadastrado</td></tr>
              ) : (
                reps.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.pix_key || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${r.active ? "bg-emerald-500" : "bg-gray-300"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r)}>
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
            <DialogTitle className="font-alt">{editing ? "Editar Representante" : "Novo Representante"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome completo *</label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nome do representante" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">E-mail</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Telefone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhoneBR(onlyDigits(e.target.value)) })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">CPF</label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: formatCPF(onlyDigits(e.target.value)) })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Chave PIX</label>
              <Input value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} placeholder="CPF, e-mail, telefone ou chave aleatória" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <span className="text-sm">Representante ativo</span>
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

export default AdminRepresentatives;
