import { useState } from "react";
import { Smile, Phone, Mail, MessageSquare } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";

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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome";
    if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX";
    if (!isValidEmail(form.email)) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const msg = `Olá, meu nome é ${form.nome.trim()}. ${form.mensagem.trim()}`;
    window.open(`https://wa.me/5519999722280?text=${encodeURIComponent(msg)}`, "_blank");
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
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        placeholder="Seu telefone* (XX) XXXXX-XXXX"
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
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-4 top-4 text-medium-gray" />
                    <textarea
                      placeholder="Sua mensagem"
                      rows={3}
                      value={form.mensagem}
                      onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-extra-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-base-color text-sm"
                    />
                  </div>
                  <button type="submit" className="bg-dark-gray text-white px-8 py-3 rounded-lg font-medium hover:bg-dark-gray/90 transition text-sm">
                    Enviar mensagem
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contato;
