import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Submission = Tables<"form_submissions">;

/* ── Helpers ────────────────────────────────────────────── */

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

async function fetchDocBlob(storagePath: string): Promise<Blob | null> {
  try {
    const path = storagePath.replace(/^documents\//, "");
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (!data?.signedUrl) return null;
    const resp = await fetch(data.signedUrl);
    return await resp.blob();
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/** Convert a PDF data-URL into an array of JPEG image data-URLs (one per page) */
async function pdfToImages(dataUrl: string): Promise<string[]> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const raw = atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const images: string[] = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const vp = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.92));
    }
    return images;
  } catch {
    return [];
  }
}

/** Returns an array of image data-URLs ready for rendering (works for both image and PDF docs) */
async function prepareDocImages(storagePath: string | null): Promise<string[]> {
  if (!storagePath) return [];
  const blob = await fetchDocBlob(storagePath);
  if (!blob) return [];

  if (blob.type.startsWith("image/")) {
    return [await blobToDataUrl(blob)];
  }
  if (blob.type === "application/pdf") {
    const dataUrl = await blobToDataUrl(blob);
    return await pdfToImages(dataUrl);
  }
  return [];
}

/* ── Formatters ─────────────────────────────────────────── */

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

/* ── Maps ───────────────────────────────────────────────── */

const vehicleTypeMap: Record<string, string> = {
  carro: "Carro", moto: "Moto", caminhao: "Caminhão", onibus: "Ônibus",
  van: "Van", trator: "Trator", barco: "Barco", outro: "Outro",
};
const installChoiceMap: Record<string, string> = { same: "O mesmo endereço", other: "Outro endereço" };
const maxDaysMap: Record<string, string> = {
  nenhum_dia: "Nenhum dia", "De 1 a 3 dias": "De 1 a 3 dias",
  "De 3 a 7 dias": "De 3 a 7 dias", "De 7 a 15 dias": "De 7 a 15 dias",
  "Mais de 15 dias": "Mais de 15 dias",
};
const blockingMap: Record<string, string> = { sim: "Sim", nao: "Não" };
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

/* ── Main ───────────────────────────────────────────────── */

export async function generateSubmissionPDF(s: Submission) {
  // Fetch everything in parallel
  const [logoBase64, doc1Images, doc2Images] = await Promise.all([
    getLogoBase64(),
    prepareDocImages(s.doc1_url),
    prepareDocImages(s.doc2_url),
  ]);

  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const isPJ = s.form_type === "pj";

  /* ── Build form sections ── */
  const personalSection = isPJ
    ? section("Dados da Empresa", [
        field("Razão Social", s.razao_social), field("Nome Fantasia", s.nome_fantasia),
        field("CNPJ", s.cnpj), field("Inscrição Estadual", s.ie_isento ? "Isento" : s.ie),
        field("E-mail", s.email), field("Telefone", s.phone_primary),
        field("Telefone 2", s.phone_secondary), field("Usuário Plataforma", s.platform_username),
      ].join(""))
    : section("Dados Pessoais", [
        field("Nome Completo", s.full_name), field("CPF", s.cpf),
        field("RG", s.rg), field("Data de Nascimento", s.birth_date),
        field("E-mail", s.email), field("Telefone", s.phone_primary),
        field("Telefone 2", s.phone_secondary), field("Usuário Plataforma", s.platform_username),
      ].join(""));

  const addressSection = section("Endereço", [
    field("CEP", s.address_cep), field("Rua", s.address_street),
    field("Nº", s.address_number), field("Complemento", s.address_complement),
    field("Bairro", s.address_neighborhood), field("Cidade", s.address_city),
    field("UF", s.address_uf), field("Observação", s.address_note),
  ].join(""));

  const emergencySection = section("Contato de Emergência", [
    field("Nome", s.emergency_name), field("Telefone", s.emergency_phone),
    field("Parentesco", s.emergency_relationship),
  ].join(""));

  const financialContactSection = isPJ && (s.financial_name || s.financial_phone || s.financial_email)
    ? section("Contato do Financeiro", [
        field("Nome", s.financial_name), field("Telefone", s.financial_phone),
        field("E-mail", s.financial_email),
      ].join(""))
    : "";

  const vehicleSection = section("Veículo", [
    field("Tipo", vehicleTypeMap[s.vehicle_type || ""] || s.vehicle_type),
    field("Marca", s.vehicle_brand), field("Modelo", s.vehicle_model),
    field("Ano", s.vehicle_year), field("Cor", s.vehicle_color),
    field("Combustível", s.vehicle_fuel), field("Placa", s.vehicle_plate),
    field("Dias máx. parado", maxDaysMap[s.vehicle_max_days || ""] || s.vehicle_max_days),
    field("Bloqueio remoto", blockingMap[s.remote_blocking || ""] || s.remote_blocking),
  ].join(""));

  const installSection = section("Instalação", [
    field("Local", installChoiceMap[s.install_address_choice || ""] || s.install_address_choice),
    field("CEP", s.install_cep), field("Rua", s.install_street),
    field("Nº", s.install_number), field("Complemento", s.install_complement),
    field("Bairro", s.install_neighborhood), field("Cidade", s.install_city),
    field("UF", s.install_uf), field("Observação", s.install_note),
    field("Períodos", s.install_periods),
  ].join(""));

  const financeSection = section("Financeiro", [
    field("Plano", s.plan_name), field("Mensalidade", s.monthly_value),
    field("Pagamento Mensalidade", s.monthly_payment), field("Dia Vencimento", s.monthly_due_day),
    field("Instalação", s.install_value), field("Pagamento Instalação", s.installation_payment),
    field("Cupom", s.coupon_code), field("Descrição Cupom", s.coupon_description),
  ].join(""));

  const metaSection = section("Dados Coletados", [
    field("IP", s.ip_address), field("Navegador/SO", s.user_agent_friendly),
    field("Data/Hora", s.collected_at ? formatDate(s.collected_at) : null),
    field("Localização", s.geolocation),
  ].join(""));

  const cancellationBlock = s.status === "cancelado" && s.cancellation_reason
    ? `<div class="cancellation-block"><span class="cancellation-label">Motivo do Cancelamento</span><p>${s.cancellation_reason}</p></div>`
    : "";

  /* ── Build document images section ── */
  function renderDocGroup(images: string[], name: string): string {
    if (!images.length) return "";
    return images.map((src, i) =>
      `<div class="doc-page">
        <div class="doc-label">${name}${images.length > 1 ? ` — Página ${i + 1}/${images.length}` : ""}</div>
        <img src="${src}" class="doc-img" />
      </div>`
    ).join("");
  }

  const hasDocuments = doc1Images.length > 0 || doc2Images.length > 0;
  const docSection = hasDocuments
    ? `<div class="page-break"></div>
       ${renderDocGroup(doc1Images, s.doc1_name || "Documento 1")}
       ${renderDocGroup(doc2Images, s.doc2_name || "Documento 2")}`
    : "";

  /* ── Render ── */
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html><head><title>Formulário — ${s.razao_social || s.full_name} — GuardianTech</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Be Vietnam Pro', Arial, sans-serif; color: #333; font-size: 10px; }

      .print-header {
        border-bottom: 3px solid #AF985A;
        padding: 10px 20px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .print-header img { height: 40px; }
      .print-header-info { text-align: right; font-size: 9px; color: #777; }
      .print-header-info strong { color: #AF985A; font-size: 11px; display: block; margin-bottom: 1px; }

      .print-title {
        border-bottom: 1px solid #e5e5e5;
        padding: 5px 20px; font-size: 11px; font-weight: 700;
        letter-spacing: .5px; color: #AF985A; text-transform: uppercase;
      }

      .status-bar {
        padding: 3px 20px; border-bottom: 1px solid #e5e5e5;
        font-size: 9px; color: #555;
        display: flex; justify-content: space-between; align-items: center;
      }
      .status-badge {
        display: inline-block; padding: 2px 8px; border-radius: 10px;
        font-size: 8px; font-weight: 600; text-transform: uppercase;
        letter-spacing: .3px; background: #f0f0f0; color: #555;
      }

      .print-body { padding: 4px 20px; }

      .section {
        margin-bottom: 3px; border: 1px solid #e5e5e5;
        border-radius: 4px; overflow: hidden;
      }
      .section-title {
        padding: 2px 8px; font-size: 7px; font-weight: 700;
        color: #AF985A; text-transform: uppercase; letter-spacing: .5px;
        border-bottom: 2px solid #AF985A; background: #fafafa;
      }
      .fields { display: grid; grid-template-columns: 1fr 1fr; }
      .field { padding: 1px 8px; border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0; }
      .field:nth-child(2n) { border-right: none; }
      .field-label {
        display: block; font-size: 6.5px; font-weight: 600;
        text-transform: uppercase; letter-spacing: .3px; color: #999; line-height: 1.1;
      }
      .field-value { display: block; font-size: 9px; font-weight: 500; color: #1a1a1a; line-height: 1.15; }

      .cancellation-block {
        margin: 4px 0; padding: 5px 10px;
        border: 1px solid #f5c6cb; border-left: 4px solid #dc3545;
        border-radius: 5px; background: #fff5f5;
      }
      .cancellation-label { display: block; font-size: 7px; font-weight: 700; text-transform: uppercase; color: #dc3545; margin-bottom: 2px; }
      .cancellation-block p { font-size: 10px; color: #721c24; }

      /* Documents */
      .doc-page {
        border: 1px solid #e5e5e5; border-radius: 5px; overflow: hidden;
        margin: 0 20px 8px 20px; max-height: 96vh;
      }
      .doc-label {
        padding: 3px 10px; font-size: 8px; font-weight: 700;
        color: #AF985A; text-transform: uppercase; letter-spacing: .5px;
        border-bottom: 2px solid #AF985A; background: #fafafa;
      }
      .doc-img {
        display: block; width: 100%; max-height: 90vh;
        padding: 4px; object-fit: contain;
      }

      .print-footer {
        margin-top: 8px; padding: 6px 20px;
        border-top: 2px solid #ddd; font-size: 8px; color: #999; text-align: center;
      }
      .print-footer strong { color: #AF985A; }

      .page-break { page-break-before: always; }

      @media print {
        body { padding: 0; }
        .section { break-inside: avoid; }
        .doc-page { break-inside: avoid; }
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

    ${docSection}

    <div class="print-footer">
      <strong>GuardianTech</strong> — Segurança, Tecnologia e Rastreamento<br/>
      Documento gerado em ${today} • Este documento é de uso interno.
    </div>

    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 600);
}
