import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "—";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function section(title: string, rows: [string, string | null | undefined][]): string {
  const filtered = rows.filter(([_, v]) => v && v.trim());
  if (filtered.length === 0) return "";
  const rowsHtml = filtered
    .map(([label, val]) => `<tr><td style="padding:4px 12px 4px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(val)}</td></tr>`)
    .join("");
  return `<h3 style="margin:24px 0 8px;color:#AF985A;font-size:15px;border-bottom:1px solid #eee;padding-bottom:4px;">${title}</h3><table style="border-collapse:collapse;">${rowsHtml}</table>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const d = body.submission;
    const attachments: { filename: string; content: string }[] = [];

    // Download attachments from storage if URLs exist
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    for (const doc of [
      { url: d.doc1_url, name: d.doc1_name },
      { url: d.doc2_url, name: d.doc2_name },
    ]) {
      if (!doc.url) continue;
      try {
        // Extract path from full URL: after /storage/v1/object/public/documents/
        const pathMatch = doc.url.match(/\/documents\/(.+)$/);
        if (pathMatch) {
          const { data, error } = await supabase.storage
            .from("documents")
            .download(pathMatch[1]);
          if (data && !error) {
            const arrayBuf = await data.arrayBuffer();
            const base64 = btoa(
              new Uint8Array(arrayBuf).reduce((s, b) => s + String.fromCharCode(b), "")
            );
            attachments.push({
              filename: doc.name || "documento",
              content: base64,
            });
          }
        }
      } catch (e) {
        console.error("Error downloading attachment:", e);
      }
    }

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#333;max-width:700px;margin:0 auto;padding:20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#AF985A;font-size:20px;margin:0;">Nova Contratação — Pessoa Física</h1>
    <p style="color:#888;font-size:13px;margin:4px 0 0;">Formulário enviado em ${escapeHtml(d.collected_at ? new Date(d.collected_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR"))}</p>
  </div>

  ${section("Dados Pessoais", [
    ["Nome", d.full_name],
    ["E-mail", d.email],
    ["CPF", d.cpf],
    ["RG", d.rg],
    ["Nascimento", d.birth_date],
    ["Celular", d.phone_primary],
    ["Telefone 2", d.phone_secondary],
    ["Usuário Plataforma", d.platform_username],
  ])}

  ${section("Endereço", [
    ["CEP", d.address_cep],
    ["Rua", d.address_street],
    ["Nº", d.address_number],
    ["Complemento", d.address_complement],
    ["Bairro", d.address_neighborhood],
    ["Cidade", d.address_city],
    ["UF", d.address_uf],
    ["Observação", d.address_note],
  ])}

  ${section("Contato de Emergência", [
    ["Nome", d.emergency_name],
    ["Telefone", d.emergency_phone],
    ["Parentesco", d.emergency_relationship],
  ])}

  ${section("Veículo", [
    ["Tipo", d.vehicle_type],
    ["Marca", d.vehicle_brand],
    ["Modelo", d.vehicle_model],
    ["Ano", d.vehicle_year],
    ["Cor", d.vehicle_color],
    ["Combustível", d.vehicle_fuel],
    ["Placa", d.vehicle_plate],
    ["Dias máx. parado", d.vehicle_max_days],
    ["Bloqueio remoto", d.remote_blocking],
  ])}

  ${section("Instalação", [
    ["Local", d.install_address_choice],
    ["CEP", d.install_cep],
    ["Rua", d.install_street],
    ["Nº", d.install_number],
    ["Complemento", d.install_complement],
    ["Bairro", d.install_neighborhood],
    ["Cidade", d.install_city],
    ["UF", d.install_uf],
    ["Observação", d.install_note],
    ["Períodos", d.install_periods],
  ])}

  ${section("Financeiro", [
    ["Plano", d.plan_name],
    ["Mensalidade", d.monthly_value],
    ["Pgto Mensalidade", d.monthly_payment],
    ["Dia Vencimento", d.monthly_due_day],
    ["Instalação", d.install_value],
    ["Pgto Instalação", d.installation_payment],
    ["Cupom", d.coupon_code],
    ["Desc. Cupom", d.coupon_description],
  ])}

  ${section("Dados Coletados", [
    ["IP", d.ip_address],
    ["Navegador/SO", d.user_agent_friendly],
    ["Data/Hora", d.collected_at],
    ["Localização", d.geolocation],
    ["User Agent", d.user_agent],
  ])}

  <p style="margin-top:32px;font-size:12px;color:#aaa;text-align:center;">
    Este e-mail foi enviado automaticamente pelo formulário de contratação — GuardianTech
  </p>
</body>
</html>`;

    const emailPayload: any = {
      from: "GuardianTech <onboarding@resend.dev>",
      to: ["contato.guardiantech@gmail.com", "rastreamento@guardiantech.site"],
      subject: `Nova contratação: ${d.full_name} — ${d.vehicle_plate || "Sem placa"}`,
      html,
    };

    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const emailResponse = await resend.emails.send(emailPayload);
    console.log("Email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-form-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
