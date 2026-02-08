import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RECAPTCHA_SECRET = Deno.env.get("RECAPTCHA_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "—";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, telefone, email, mensagem, recaptchaToken } = await req.json();

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: "CAPTCHA não enviado." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    });
    const captchaData = await captchaRes.json();

    if (!captchaData.success || (captchaData.score !== undefined && captchaData.score < 0.3)) {
      console.log("reCAPTCHA failed:", captchaData);
      return new Response(JSON.stringify({ error: "Verificação CAPTCHA falhou. Tente novamente." }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate inputs
    if (!nome?.trim() || !email?.trim() || !mensagem?.trim()) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios não preenchidos." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#AF985A;font-size:20px;margin:0;">Nova mensagem de contato</h1>
    <p style="color:#888;font-size:13px;margin:4px 0 0;">Recebida em ${new Date().toLocaleString("pt-BR")}</p>
  </div>
  <table style="border-collapse:collapse;width:100%;">
    <tr><td style="padding:8px 12px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">Nome</td><td style="padding:8px 0;font-size:13px;">${escapeHtml(nome)}</td></tr>
    <tr><td style="padding:8px 12px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">Telefone</td><td style="padding:8px 0;font-size:13px;">${escapeHtml(telefone)}</td></tr>
    <tr><td style="padding:8px 12px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">E-mail</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding:8px 12px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">Mensagem</td><td style="padding:8px 0;font-size:13px;white-space:pre-wrap;">${escapeHtml(mensagem)}</td></tr>
  </table>
  <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
  <p style="font-size:11px;color:#aaa;text-align:center;">reCAPTCHA score: ${captchaData.score ?? "N/A"}</p>
  <p style="font-size:11px;color:#aaa;text-align:center;">Enviado automaticamente pelo site — GuardianTech</p>
</body>
</html>`;

    const emailResponse = await resend.emails.send({
      from: "GuardianTech <noreply@guardiantech.site>",
      to: ["contato.guardiantech@gmail.com", "rastreamento@guardiantech.site"],
      subject: `Contato: ${nome.trim()}`,
      html,
      reply_to: email.trim(),
    });

    console.log("Contact email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
