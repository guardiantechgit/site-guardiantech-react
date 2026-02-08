import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Submission = Tables<"form_submissions">;

async function getLogoBase64(): Promise<string> {
  try {
    const resp = await fetch("/images/logo-rastreamento-branco.png");
    const blob = await resp.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

async function getDocBase64(storagePath: string): Promise<{ dataUrl: string; mimeType: string } | null> {
  try {
    const path = storagePath.replace(/^documents\//, "");
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (!data?.signedUrl) return null;
    const resp = await fetch(data.signedUrl);
    const blob = await resp.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return { dataUrl, mimeType: blob.type };
  } catch {
    return null;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function field(label: string, value: string | null | undefined | boolean): string {
  if (value === null || value === undefined || value === "") return "";
  const display = typeof value === "boolean" ? (value ? "Sim" : "Não") : value;
  return `<div class="field"><span class="field-label">${label}</span><span class="field-value">${display}</span></div>`;
}

function section(title: string, fields: string): string {
  const filtered = fields.trim();
  if (!filtered) return "";
  return `<div class="section"><div class="section-title">${title}</div><div class="fields">${filtered}</div></div>`;
}

const vehicleTypeMap: Record<string, string> = {
  carro: "Carro", moto: "Moto", caminhao: "Caminhão", onibus: "Ônibus",
  van: "Van", trator: "Trator", barco: "Barco", outro: "Outro",
};

const installChoiceMap: Record<string, string> = {
  same: "O mesmo endereço", other: "Outro endereço",
};

const maxDaysMap: Record<string, string> = {
  nenhum_dia: "Nenhum dia", "De 1 a 3 dias": "De 1 a 3 dias",
  "De 3 a 7 dias": "De 3 a 7 dias", "De 7 a 15 dias": "De 7 a 15 dias",
  "Mais de 15 dias": "Mais de 15 dias",
};

const blockingMap: Record<string, string> = {
  sim: "Sim", nao: "Não",
};

const statusLabels: Record<string, string> = {
  novo: "Novo", recebido: "Recebido", lido: "Recebido",
  confirmado: "Confirmado — Instalação Pendente",
  instalado: "Instalado", cancelado: "Cancelado",
};

function getStatusLabel(s: Submission): string {
  if (s.status === "instalado" && s.installation_paid) return "Instalado e Pago";
  if (s.status === "instalado") return "Instalado — Pagamento Pendente";
  return statusLabels[s.status] || s.status;
}

export async function generateSubmissionPDF(s: Submission) {
  const logoBase64 = await getLogoBase64();
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const isPJ = s.form_type === "pj";

  // Fetch doc images
  let doc1Data: { dataUrl: string; mimeType: string } | null = null;
  let doc2Data: { dataUrl: string; mimeType: string } | null = null;

  if (s.doc1_url) doc1Data = await getDocBase64(s.doc1_url);
  if (s.doc2_url) doc2Data = await getDocBase64(s.doc2_url);

  const hasDocPage = doc1Data || doc2Data;

  const personalSection = isPJ
    ? section("Dados da Empresa", [
        field("Razão Social", s.razao_social),
        field("Nome Fantasia", s.nome_fantasia),
        field("CNPJ", s.cnpj),
        field("Inscrição Estadual", s.ie_isento ? "Isento" : s.ie),
        field("E-mail", s.email),
        field("Telefone", s.phone_primary),
        field("Telefone 2", s.phone_secondary),
        field("Usuário Plataforma", s.platform_username),
      ].join(""))
    : section("Dados Pessoais", [
        field("Nome Completo", s.full_name),
        field("CPF", s.cpf),
        field("RG", s.rg),
        field("Data de Nascimento", s.birth_date),
        field("E-mail", s.email),
        field("Telefone", s.phone_primary),
        field("Telefone 2", s.phone_secondary),
        field("Usuário Plataforma", s.platform_username),
      ].join(""));

  const addressSection = section("Endereço", [
    field("CEP", s.address_cep),
    field("Rua", s.address_street),
    field("Nº", s.address_number),
    field("Complemento", s.address_complement),
    field("Bairro", s.address_neighborhood),
    field("Cidade", s.address_city),
    field("UF", s.address_uf),
    field("Observação", s.address_note),
  ].join(""));

  const emergencySection = section("Contato de Emergência", [
    field("Nome", s.emergency_name),
    field("Telefone", s.emergency_phone),
    field("Parentesco", s.emergency_relationship),
  ].join(""));

  const financialContactSection = isPJ && (s.financial_name || s.financial_phone || s.financial_email)
    ? section("Contato do Financeiro", [
        field("Nome", s.financial_name),
        field("Telefone", s.financial_phone),
        field("E-mail", s.financial_email),
      ].join(""))
    : "";

  const vehicleSection = section("Veículo", [
    field("Tipo", vehicleTypeMap[s.vehicle_type || ""] || s.vehicle_type),
    field("Marca", s.vehicle_brand),
    field("Modelo", s.vehicle_model),
    field("Ano", s.vehicle_year),
    field("Cor", s.vehicle_color),
    field("Combustível", s.vehicle_fuel),
    field("Placa", s.vehicle_plate),
    field("Dias máx. parado", maxDaysMap[s.vehicle_max_days || ""] || s.vehicle_max_days),
    field("Bloqueio remoto", blockingMap[s.remote_blocking || ""] || s.remote_blocking),
  ].join(""));

  const installSection = section("Instalação", [
    field("Local", installChoiceMap[s.install_address_choice || ""] || s.install_address_choice),
    field("CEP", s.install_cep),
    field("Rua", s.install_street),
    field("Nº", s.install_number),
    field("Complemento", s.install_complement),
    field("Bairro", s.install_neighborhood),
    field("Cidade", s.install_city),
    field("UF", s.install_uf),
    field("Observação", s.install_note),
    field("Períodos", s.install_periods),
  ].join(""));

  const financeSection = section("Financeiro", [
    field("Plano", s.plan_name),
    field("Mensalidade", s.monthly_value),
    field("Pagamento Mensalidade", s.monthly_payment),
    field("Dia Vencimento", s.monthly_due_day),
    field("Instalação", s.install_value),
    field("Pagamento Instalação", s.installation_payment),
    field("Cupom", s.coupon_code),
    field("Descrição Cupom", s.coupon_description),
  ].join(""));

  const metaSection = section("Dados Coletados", [
    field("IP", s.ip_address),
    field("Navegador/SO", s.user_agent_friendly),
    field("Data/Hora", s.collected_at ? formatDate(s.collected_at) : null),
    field("Localização", s.geolocation),
  ].join(""));

  const cancellationBlock = s.status === "cancelado" && s.cancellation_reason
    ? `<div class="cancellation-block"><span class="cancellation-label">Motivo do Cancelamento</span><p>${s.cancellation_reason}</p></div>`
    : "";

  function renderDocEmbed(data: { dataUrl: string; mimeType: string }, name: string): string {
    if (data.mimeType.startsWith("image/")) {
      return `<div class="doc-item"><p class="doc-name">${name}</p><img src="${data.dataUrl}" class="doc-image" /></div>`;
    }
    if (data.mimeType === "application/pdf") {
      return `<div class="doc-item doc-item-pdf"><p class="doc-name">${name}</p><iframe src="${data.dataUrl}" class="doc-pdf"></iframe></div>`;
    }
    return `<div class="doc-item"><p class="doc-name">${name}</p><p class="doc-note">Documento disponível para download na plataforma.</p></div>`;
  }

  const docPage = hasDocPage
    ? `
      <div class="page-break"></div>
      <div class="print-header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="GuardianTech" />` : `<span style="font-size:18px;font-weight:700;color:#AF985A;">GuardianTech Rastreamento</span>`}
        <div class="print-header-info">
          <strong>Documentos Anexados</strong>
          ${s.razao_social || s.full_name}
        </div>
      </div>
      <div class="print-title">DOCUMENTOS</div>
      <div class="print-body docs-body">
        ${doc1Data ? renderDocEmbed(doc1Data, s.doc1_name || "Documento 1") : ""}
        ${doc2Data ? renderDocEmbed(doc2Data, s.doc2_name || "Documento 2") : ""}
      </div>
    `
    : "";

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html><head><title>Formulário — ${s.razao_social || s.full_name} — GuardianTech</title>
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

      .status-bar {
        padding: 8px 28px;
        border-bottom: 1px solid #e5e5e5;
        font-size: 11px;
        color: #555;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        background: #f0f0f0;
        color: #555;
      }

      .print-body { padding: 16px 28px; }

      .section {
        margin-bottom: 16px;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        overflow: hidden;
        page-break-inside: avoid;
      }
      .section-title {
        padding: 8px 14px;
        font-size: 11px;
        font-weight: 700;
        color: #AF985A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #AF985A;
        background: #fafafa;
      }
      .fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
      }
      .field {
        padding: 8px 14px;
        border-bottom: 1px solid #f0f0f0;
        border-right: 1px solid #f0f0f0;
      }
      .field:nth-child(2n) { border-right: none; }
      .field-label {
        display: block;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #999;
        margin-bottom: 2px;
      }
      .field-value {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #1a1a1a;
      }

      .cancellation-block {
        margin: 12px 0;
        padding: 10px 14px;
        border: 1px solid #f5c6cb;
        border-left: 4px solid #dc3545;
        border-radius: 6px;
        background: #fff5f5;
        page-break-inside: avoid;
      }
      .cancellation-label {
        display: block;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        color: #dc3545;
        margin-bottom: 4px;
      }
      .cancellation-block p { font-size: 12px; color: #721c24; }

      .page-break { page-break-before: always; }

      .docs-body { padding: 20px 28px; }
      .doc-item { 
        margin-bottom: 20px; 
        border: 1px solid #e5e5e5; 
        border-radius: 8px; 
        overflow: hidden;
        page-break-inside: avoid;
      }
      .doc-name {
        padding: 8px 14px;
        font-size: 11px;
        font-weight: 700;
        color: #AF985A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #AF985A;
        background: #fafafa;
      }
      .doc-image { 
        display: block; 
        max-width: 100%; 
        margin: 16px auto; 
        padding: 0 16px;
      }
      .doc-pdf {
        width: 100%;
        height: 80vh;
        border: none;
        display: block;
      }
      .doc-item-pdf {
        page-break-before: always;
      }
      .doc-note {
        padding: 16px;
        text-align: center;
        color: #888;
        font-style: italic;
      }

      .print-footer {
        margin-top: 32px;
        padding: 16px 32px;
        border-top: 2px solid #ddd;
        font-size: 10px;
        color: #999;
        text-align: center;
      }
      .print-footer strong { color: #AF985A; }

      @media print {
        body { padding: 0; }
        .section { break-inside: avoid; }
        .page-break { break-before: page; }
      }
    </style></head><body>

    <div class="print-header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="GuardianTech Rastreamento" />` : `<span style="font-size:18px;font-weight:700;color:#AF985A;">GuardianTech Rastreamento</span>`}
      <div class="print-header-info">
        <strong>Formulário de Contratação</strong>
        ${isPJ ? "Pessoa Jurídica" : "Pessoa Física"}
      </div>
    </div>

    <div class="print-title">${s.razao_social || s.full_name}</div>

    <div class="status-bar">
      <span>Recebido em: ${formatDate(s.created_at)}</span>
      <span class="status-badge">${getStatusLabel(s)}</span>
    </div>

    <div class="print-body">
      ${cancellationBlock}
      ${personalSection}
      ${addressSection}
      ${emergencySection}
      ${financialContactSection}
      ${vehicleSection}
      ${installSection}
      ${financeSection}
      ${metaSection}
    </div>

    <div class="print-footer">
      <strong>GuardianTech</strong> — Segurança, Tecnologia e Rastreamento<br/>
      Documento gerado em ${today} • Este documento é de uso interno.
    </div>

    ${docPage}

    ${hasDocPage ? `
    <div class="print-footer">
      <strong>GuardianTech</strong> — Segurança, Tecnologia e Rastreamento<br/>
      Documento gerado em ${today} • Este documento é de uso interno.
    </div>
    ` : ""}

    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
