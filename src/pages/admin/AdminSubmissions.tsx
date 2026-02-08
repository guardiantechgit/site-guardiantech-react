import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Search, Download } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Submission = Tables<"form_submissions">;

const statusColors: Record<string, string> = {
  novo: "bg-blue-100 text-blue-700",
  em_analise: "bg-yellow-100 text-yellow-700",
  aprovado: "bg-emerald-100 text-emerald-700",
  recusado: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  novo: "Novo",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [tab, setTab] = useState<"pf" | "pj">("pf");

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = submissions
    .filter((s) => (s.form_type || "pf") === tab)
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.cpf.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.vehicle_plate || "").toLowerCase().includes(q) ||
        (s.cnpj || "").includes(q)
      );
    });

  const pfCount = submissions.filter((s) => (s.form_type || "pf") === "pf").length;
  const pjCount = submissions.filter((s) => s.form_type === "pj").length;

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("form_submissions").update({ status }).eq("id", id);
    if (selected && selected.id === id) setSelected({ ...selected, status });
    fetchSubmissions();
  };

  const openDocument = async (storagePath: string) => {
    const path = storagePath.replace(/^documents\//, "");
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    );
  };

  const isPJ = selected?.form_type === "pj";

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("pf")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "pf" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pessoa Física ({pfCount})
        </button>
        <button
          onClick={() => setTab("pj")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "pj" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pessoa Jurídica ({pjCount})
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "pf" ? "Buscar por nome, CPF, e-mail ou placa..." : "Buscar por razão social, CNPJ, e-mail ou placa..."}
            className="pl-9"
          />
        </div>
        <p className="text-muted-foreground text-sm">{filtered.length} resultado(s)</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">
                  {tab === "pf" ? "Nome" : "Razão Social"}
                </th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Veículo</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Plano</th>
                <th className="text-left px-4 py-3 font-alt font-semibold text-foreground">Data</th>
                <th className="text-center px-4 py-3 font-alt font-semibold text-foreground">Status</th>
                <th className="text-right px-4 py-3 font-alt font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum formulário encontrado</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{s.razao_social || s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.vehicle_plate || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.plan_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(s)}>
                        <Eye size={14} className="mr-1" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-alt">{selected.razao_social || selected.full_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {(["novo", "em_analise", "aprovado", "recusado"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(selected.id, st)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selected.status === st
                          ? statusColors[st]
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {statusLabels[st]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 text-sm">
                {/* Dados */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">
                    {isPJ ? "Dados da Empresa" : "Dados Pessoais"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {isPJ ? (
                      <>
                        <Field label="Razão Social" value={selected.razao_social} />
                        <Field label="Nome Fantasia" value={selected.nome_fantasia} />
                        <Field label="CNPJ" value={selected.cnpj} />
                        <Field label="Inscrição Estadual" value={selected.ie} />
                      </>
                    ) : (
                      <>
                        <Field label="Nome" value={selected.full_name} />
                        <Field label="CPF" value={selected.cpf} />
                        <Field label="RG" value={selected.rg} />
                        <Field label="Nascimento" value={selected.birth_date} />
                      </>
                    )}
                    <Field label="E-mail" value={selected.email} />
                    <Field label="Telefone" value={selected.phone_primary} />
                    <Field label="Telefone 2" value={selected.phone_secondary} />
                    <Field label="Usuário Plataforma" value={selected.platform_username} />
                  </div>
                </section>

                {/* Endereço */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Endereço</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="CEP" value={selected.address_cep} />
                    <Field label="Rua" value={selected.address_street} />
                    <Field label="Nº" value={selected.address_number} />
                    <Field label="Complemento" value={selected.address_complement} />
                    <Field label="Bairro" value={selected.address_neighborhood} />
                    <Field label="Cidade" value={selected.address_city} />
                    <Field label="UF" value={selected.address_uf} />
                    <Field label="Observação" value={selected.address_note} />
                  </div>
                </section>

                {/* Contato de emergência */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Contato de Emergência</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nome" value={selected.emergency_name} />
                    <Field label="Telefone" value={selected.emergency_phone} />
                    <Field label="Parentesco" value={selected.emergency_relationship} />
                  </div>
                </section>

                {/* Contato Financeiro (PJ only) */}
                {isPJ && (selected.financial_name || selected.financial_phone || selected.financial_email) && (
                  <section>
                    <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Contato do Financeiro</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Nome" value={selected.financial_name} />
                      <Field label="Telefone" value={selected.financial_phone} />
                      <Field label="E-mail" value={selected.financial_email} />
                    </div>
                  </section>
                )}

                {/* Veículo */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Veículo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Tipo" value={selected.vehicle_type} />
                    <Field label="Marca" value={selected.vehicle_brand} />
                    <Field label="Modelo" value={selected.vehicle_model} />
                    <Field label="Ano" value={selected.vehicle_year} />
                    <Field label="Cor" value={selected.vehicle_color} />
                    <Field label="Combustível" value={selected.vehicle_fuel} />
                    <Field label="Placa" value={selected.vehicle_plate} />
                    <Field label="Dias máx. parado" value={selected.vehicle_max_days} />
                    <Field label="Bloqueio remoto" value={selected.remote_blocking} />
                  </div>
                </section>

                {/* Instalação */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Instalação</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Local" value={selected.install_address_choice} />
                    <Field label="CEP" value={selected.install_cep} />
                    <Field label="Rua" value={selected.install_street} />
                    <Field label="Nº" value={selected.install_number} />
                    <Field label="Complemento" value={selected.install_complement} />
                    <Field label="Bairro" value={selected.install_neighborhood} />
                    <Field label="Cidade" value={selected.install_city} />
                    <Field label="UF" value={selected.install_uf} />
                    <Field label="Observação" value={selected.install_note} />
                    <Field label="Períodos" value={selected.install_periods} />
                  </div>
                </section>

                {/* Financeiro */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Financeiro</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Plano" value={selected.plan_name} />
                    <Field label="Mensalidade" value={selected.monthly_value} />
                    <Field label="Pgto Mensalidade" value={selected.monthly_payment} />
                    <Field label="Dia Vencimento" value={selected.monthly_due_day} />
                    <Field label="Instalação" value={selected.install_value} />
                    <Field label="Pgto Instalação" value={selected.installation_payment} />
                    <Field label="Cupom" value={selected.coupon_code} />
                    <Field label="Desc. Cupom" value={selected.coupon_description} />
                  </div>
                </section>

                {/* Documentos */}
                {(selected.doc1_url || selected.doc2_url) && (
                  <section>
                    <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Documentos</h3>
                    <div className="flex gap-4 flex-wrap">
                      {selected.doc1_url && (
                        <button onClick={() => openDocument(selected.doc1_url!)} className="flex items-center gap-2 text-base-color hover:underline text-sm">
                          <Download size={14} /> {selected.doc1_name || "Documento 1"}
                        </button>
                      )}
                      {selected.doc2_url && (
                        <button onClick={() => openDocument(selected.doc2_url!)} className="flex items-center gap-2 text-base-color hover:underline text-sm">
                          <Download size={14} /> {selected.doc2_name || "Documento 2"}
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* Dados coletados */}
                <section>
                  <h3 className="font-alt font-semibold text-foreground border-b pb-1 mb-3">Dados Coletados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="IP" value={selected.ip_address} />
                    <Field label="Navegador/SO" value={selected.user_agent_friendly} />
                    <Field label="Data/Hora" value={selected.collected_at ? formatDate(selected.collected_at) : null} />
                    <Field label="Localização" value={selected.geolocation} />
                  </div>
                  {selected.user_agent && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">User Agent completo</span>
                      <p className="text-xs text-muted-foreground mt-0.5 break-all">{selected.user_agent}</p>
                    </div>
                  )}
                </section>

                <Field label="Observações" value={selected.notes} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;
