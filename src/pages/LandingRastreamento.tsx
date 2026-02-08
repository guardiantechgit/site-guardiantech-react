import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Smartphone, Signal, CheckCircle, User, Briefcase, MessageCircle, ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import VideoModal from "@/components/VideoModal";

const plans = [
  {
    name: "GuardianEssential",
    price: "58,90",
    features: ["Motos, carros, pickups, vans e caminhonetes", "Aplicativo e Plataforma Web", "Sem bloqueio remoto", "Instalação de R$ 120,00"],
    popular: false,
  },
  {
    name: "GuardianSecure",
    price: "64,90",
    features: ["Motos, carros, pickups, vans e caminhonetes", "Aplicativo e Plataforma Web", "Inclui bloqueio remoto", "Instalação de R$ 120,00"],
    popular: true,
  },
  {
    name: "GuardianHeavy",
    price: "68,90",
    features: ["Caminhões, tratores, máquinas, embarcações e aeronaves", "Aplicativo e Plataforma Web", "Com ou sem bloqueio remoto", "Instalação a partir de R$ 150,00"],
    popular: false,
  },
];

const benefits = [
  { icon: Car, title: "Muito mais barato que seguro", desc: "Rastreamento e alertas por um valor mensal acessível, sem burocracia." },
  { icon: Smartphone, title: "Tranquilidade no seu dia a dia", desc: "Acompanhe seu veículo pelo app e receba avisos em tempo real, onde estiver." },
  { icon: Signal, title: "Ampla cobertura nacional", desc: "Mais estabilidade de conexão com chip multioperadora em todo o Brasil." },
  { icon: CheckCircle, title: "Equipamentos homologados", desc: "Rastreadores 4G dentro das normas, com instalação discreta e segura." },
];

const contactWords = ["preços", "planos", "equipamentos", "promoções", "dúvidas", "contratação", "parcerias"];

const LandingRastreamento = () => {
  const [contactIdx, setContactIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setContactIdx((p) => (p + 1) % contactWords.length), 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url(/images/title-landingr.jpg)" }}
      >
        <div className="absolute inset-0 bg-dark-slate-blue/70" />
        <div className="container mx-auto px-4 relative z-10 text-center py-32">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-3xl md:text-5xl lg:text-6xl font-medium font-alt leading-tight"
          >
            Conheça mais a<br /><br />GuardianTech Rastreamento
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
            <a href="#video" className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-2xl hover:bg-white/10 transition">
              <ChevronDown size={30} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Video */}
      <section id="video" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <VideoModal videoUrl="https://www.youtube.com/watch?v=14xXieeVy3c">
            <img src="/images/bar-presentation.jpg" alt="Apresentação" className="rounded-lg w-full max-w-4xl mx-auto shadow-lg hover:shadow-xl transition" loading="lazy" />
          </VideoModal>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="bg-solitude-blue py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-alt font-semibold text-dark-gray">Conheça nossos planos</h3>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 0.15}>
                <div className={`text-center p-8 md:p-10 rounded-lg ${plan.popular ? "bg-white shadow-xl scale-105" : "bg-transparent"}`}>
                  <span className="font-alt font-medium text-base-color">{plan.name}</span>
                  <h3 className="text-4xl font-alt font-medium text-dark-gray my-2">
                    <sup className="text-lg opacity-50">R$ </sup>{plan.price}
                  </h3>
                  <div className="text-sm text-medium-gray mb-6">por mês</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="text-sm text-medium-gray py-2 border-b border-extra-medium-gray/30 last:border-0" dangerouslySetInnerHTML={{ __html: f.replace("Inclui", "<strong>Inclui</strong>") }} />
                    ))}
                  </ul>
                  <a href="#contrate-agora" className={`inline-block px-8 py-3 rounded-full font-medium text-sm transition ${plan.popular ? "bg-base-color text-white hover:bg-base-color/90" : "bg-dark-gray text-white hover:bg-dark-gray/90"}`}>
                    Tenho interesse
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-12">
            <span className="font-alt text-lg font-medium text-dark-gray">Buscando planos para sua empresa?</span>
            <br />
            <a href="#contato-whatsapp" className="text-dark-gray font-medium underline underline-offset-4">Entre em contato</a>
            <span className="text-medium-gray"> para receber opções personalizados.</span>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <AnimatedSection key={b.title} delay={i * 0.1} className="text-center">
                <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-6 group hover:bg-base-color transition">
                  <b.icon size={28} className="text-base-color group-hover:text-white transition" />
                </div>
                <h4 className="font-alt font-medium text-dark-gray text-lg mb-2">{b.title}</h4>
                <p className="text-medium-gray text-sm">{b.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contrate-agora"
        className="relative py-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url(/images/title-landingr.jpg)" }}
      >
        <div className="absolute inset-0 bg-slate-blue/80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="text-center xl:text-left">
              <h3 className="text-white text-2xl md:text-3xl font-alt font-medium mb-1 -tracking-[1px]">Contrate agora mesmo!</h3>
              <span className="text-white/70 font-light text-lg">Preencha nossa ficha para efetuar seu cadastro.</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contrate-fisica" className="inline-flex items-center gap-2 bg-base-color text-dark-gray px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition text-base">
                <User size={18} /> Pessoa Física
              </Link>
              <Link to="/contrate-juridica" className="inline-flex items-center gap-2 bg-base-color text-dark-gray px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition text-base">
                <Briefcase size={18} /> Pessoa Jurídica
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Contact */}
      <section
        id="contato-whatsapp"
        className="relative py-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background-rastreamento.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/85" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-white text-2xl md:text-3xl font-alt font-medium">
                Entre em contato para saber sobre{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={contactIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-semibold inline-block"
                  >
                    {contactWords[contactIdx]}
                  </motion.span>
                </AnimatePresence>
              </h2>
            </div>
            <a
              href="https://wa.me/5511930309090"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-5 text-white group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-base-color flex items-center justify-center group-hover:scale-105 transition">
                <MessageCircle size={32} className="text-white" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-semibold block">WhatsApp</span>
                <span className="text-lg opacity-90">(11) 93030-9090</span>
                <p className="text-white/70 text-sm mt-1">Clique para iniciar a conversa.</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingRastreamento;
