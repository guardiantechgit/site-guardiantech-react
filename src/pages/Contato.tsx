import { useState } from "react";
import { Smile, Phone, Mail, MessageSquare, Loader2 } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { supabase } from "@/integrations/supabase/client";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const Contato = () => {
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", mensagem: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { getToken } = useRecaptcha();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome";
    if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido";
    if (!isValidEmail(form.email)) e.email = "E-mail inválido";
    if (form.mensagem.trim().length < 30) e.mensagem = "A mensagem deve ter pelo menos 30 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const recaptchaToken = await getToken("contact_form");

      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          nome: form.nome.trim(),
          telefone: form.telefone,
          email: form.email.trim(),
          mensagem: form.mensagem.trim(),
          recaptchaToken,
        },
      });

      if (error) throw new Error("Erro ao enviar mensagem.");

      const result = typeof data === "string" ? JSON.parse(data) : data;
      if (result?.error) throw new Error(result.error);

      setSuccess(true);
      setForm({ nome: "", telefone: "", email: "", mensagem: "" });
    } catch (err: any) {
      setErrors({ form: err.message || "Erro ao enviar. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageTitle title="Entre em contato" backgroundImage="/images/title-contato.jpg" />

      <section id="down-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <AnimatedSection>
              <div className="bg-base-color rounded-lg p-8 md:p-10 h-full text-white">
                <div className="mb-8">
                  <span className="underline decoration-white/50 underline-offset-4 font-medium mb-3 block">Onde atuamos?</span>
                  <p className="text-white/60 text-sm">Atendemos toda região de Bragança Paulista e do Circuito das Águas. Os rastreadores veiculares funcionam em todo país.</p>
                </div>
                <div className="mb-8">
                  <span className="underline decoration-white/50 underline-offset-4 font-medium mb-3 block">Precisa falar conosco?</span>
                  <a href="https://wa.me/5519999722280?text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20do%20Site%20da%20Guardiantech" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">(19) 9 9972-2280</a>
                </div>
                <div className="mb-8">
                  <span className="underline decoration-white/50 underline-offset-4 font-medium mb-3 block">Prefere enviar um e-mail?</span>
                  <a href="mailto:contato@guardiantech.site" className="text-white/60 text-sm hover:text-white transition">contato@guardiantech.site</a>
                </div>
                <div>
                  <span className="underline decoration-white/50 underline-offset-4 font-medium mb-3 block">Falar sobre rastreamento?</span>
                  <a href="https://wa.me/5511930309090?text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20do%20Site%20da%20Guardiantech" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition block">(11) 9 3030-9090</a>
                  <a href="mailto:rastreamento@guardiantech.site" className="text-white/60 text-sm hover:text-white transition">rastreamento@guardiantech.site</a>
                </div>
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={0.2}>
              <div className="pt-4">
                <h4 className="text-2xl font-alt font-semibold text-dark-gray mb-8">Fique a vontade para tirar suas dúvidas.</h4>

                {success ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
                    <p className="font-medium text-lg mb-1">Mensagem enviada com sucesso!</p>
                    <p className="text-sm text-green-600">Em breve entraremos em contato.</p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-4 text-sm underline text-green-700 hover:text-green-900"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errors.form && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{errors.form}</div>
                    )}
                    <div>
                      <div className="relative">
                        <Smile size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray" />
                        <input
                          type="text"
                          placeholder="Seu nome*"
                          value={form.nome}
                          onChange={(e) => { setForm({ ...form, nome: e.target.value }); setErrors({ ...errors, nome: "" }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm ${errors.nome ? "border-red-500" : "border-extra-medium-gray"}`}
                        />
                      </div>
                      {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray" />
                        <input
                          type="tel"
                          placeholder="Seu telefone*"
                          value={form.telefone}
                          onChange={(e) => { setForm({ ...form, telefone: formatPhone(e.target.value) }); setErrors({ ...errors, telefone: "" }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm ${errors.telefone ? "border-red-500" : "border-extra-medium-gray"}`}
                        />
                      </div>
                      {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray" />
                        <input
                          type="email"
                          placeholder="Seu melhor email*"
                          value={form.email}
                          onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm ${errors.email ? "border-red-500" : "border-extra-medium-gray"}`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <div className="relative">
                        <MessageSquare size={18} className="absolute left-4 top-4 text-medium-gray" />
                        <textarea
                          placeholder="Sua mensagem* (mínimo 30 caracteres)"
                          rows={3}
                          value={form.mensagem}
                          onChange={(e) => { setForm({ ...form, mensagem: e.target.value }); setErrors({ ...errors, mensagem: "" }); }}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm ${errors.mensagem ? "border-red-500" : "border-extra-medium-gray"}`}
                        />
                      </div>
                      {errors.mensagem && <p className="text-red-500 text-xs mt-1">{errors.mensagem}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-dark-gray text-white px-8 py-3 rounded-lg font-medium hover:bg-dark-gray/90 transition text-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : "Enviar mensagem"}
                    </button>
                    <p className="text-xs text-medium-gray mt-2">
                      Este formulário é protegido pelo reCAPTCHA do Google.
                    </p>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contato;
