import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

interface Contract {
  id: string;
  type: string;
  content: string;
  updated_at: string;
}

const AdminContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchContracts = async () => {
    setLoading(true);
    const { data } = await supabase.from("contracts").select("*").order("type");
    const items = (data || []) as Contract[];
    setContracts(items);
    const initial: Record<string, string> = {};
    items.forEach((c) => { initial[c.type] = c.content; });
    setEditedContent(initial);
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleSave = async (contract: Contract) => {
    const newContent = editedContent[contract.type];
    if (newContent === contract.content) {
      toast({ title: "Nenhuma alteração detectada" });
      return;
    }
    setSaving(contract.type);
    const { error } = await supabase
      .from("contracts")
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq("id", contract.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contrato salvo com sucesso!" });
      fetchContracts();
    }
    setSaving(null);
  };

  const labels: Record<string, string> = {
    pf: "Pessoa Física",
    pj: "Pessoa Jurídica",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground text-sm">
        Edite os textos dos contratos de prestação de serviço. As alterações serão refletidas automaticamente nos formulários de contratação.
      </p>

      {contracts.map((contract) => (
        <div key={contract.id} className="bg-white rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/50">
            <div>
              <h3 className="font-alt font-semibold text-foreground">
                Contrato — {labels[contract.type] || contract.type}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Última atualização: {new Date(contract.updated_at).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <Button
              onClick={() => handleSave(contract)}
              disabled={saving === contract.type}
              className="bg-base-color hover:bg-base-color/90 text-white font-alt"
            >
              {saving === contract.type ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Salvar
            </Button>
          </div>
          <div className="p-5">
            <textarea
              value={editedContent[contract.type] || ""}
              onChange={(e) =>
                setEditedContent((prev) => ({ ...prev, [contract.type]: e.target.value }))
              }
              className="w-full min-h-[400px] p-4 border border-extra-medium-gray rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-base-color resize-y font-mono"
              placeholder="Digite o texto do contrato..."
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminContracts;
