import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import ClientsCarousel from "@/components/ClientsCarousel";
import PageSEO from "@/components/PageSEO";

const timeline = [
  { year: "2006", title: "Começando a carreira", desc: "Um dos fundadores começa a trabalhar no ramo da tecnologia." },
  { year: "2019", title: "O início da GuardianTech", desc: "A empresa é fundada e projetos começam a ser realizados." },
  { year: "2021", title: "Novas soluções", desc: "Além da atuação na área de informática e tecnologia, focamos na área de segurança." },
  { year: "2024", title: "Grandes clientes", desc: "A GuardianTech se especializa em atender empresas e condomínios residenciais." },
  { year: "2025", title: "Rastreamento veicular", desc: "Focamos nossa atuação na área de rastreamento veicular com alta tecnologia." },
  { year: "2026", title: "Crescimento constante", desc: "Aumentando a frota protegida, o rastreamento se torna nosso carro chefe." },
];

const Sobre = () => {
  const yearsOfExperience = new Date().getFullYear() - 2006;

  return (
    <main>
      <PageSEO
        title="Sobre a GuardianTech"
        description="Conheça a história da GuardianTech: especialista em segurança eletrônica e rastreamento veicular, atuando desde 2006 na região de Bragança Paulista."
        ogImage="/images/title-sobre.jpg"
        path="/sobre"
      />
      <PageTitle title="Sobre a GuardianTech" backgroundImage="/images/title-sobre.jpg" />

      {/* About */}
      <section id="down-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="relative">
                <img src="/images/bar-about.jpg" alt="GuardianTech" className="rounded-lg w-full" loading="lazy" />
                <VideoModal videoUrl="https://www.youtube.com/watch?v=RWWOdX-rn2E">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-auto lg:-translate-x-0 lg:-right-8 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition group">
                    <Play size={20} className="text-base-color ml-1" />
                    <span className="absolute w-20 h-20 rounded-full border-2 border-base-color animate-ping opacity-30" />
                  </span>
                </VideoModal>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="text-center lg:text-left">
                <span className="inline-block bg-solitude-blue text-base-color text-xs font-semibold uppercase px-6 py-2 rounded-full mb-6 font-alt">A Empresa GuardianTech</span>
                <h5 className="text-2xl md:text-3xl font-alt font-semibold text-dark-gray mb-5 leading-tight">Provendo soluções em segurança, tecnologia e rastreamento.</h5>
                <p className="text-medium-gray mb-4">Especializados em rastreamento veicular, vigilância patrimonial e serviços de portaria, oferecemos proteção completa com as melhores soluções em segurança para empresas e condomínios.</p>
                <p className="text-medium-gray mb-6">Na área de rastreamento, possuímos solução para rastreamento e bloqueio em tempo real de motos, carros, caminhonetes, tratores, máquinas, embarcações e aeronaves.</p>
                <Link to="/servicos" className="inline-flex items-center gap-2 bg-dark-gray text-white px-6 py-3 rounded-full font-medium hover:bg-dark-gray/90 transition text-sm">
                  Saiba mais sobre os serviços <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <AnimatedSection className="flex items-center gap-4 justify-center">
              <span className="text-7xl md:text-8xl font-alt font-semibold text-dark-gray">{yearsOfExperience}</span>
              <h6 className="font-alt font-medium text-dark-gray text-lg">anos de<br />know how</h6>
            </AnimatedSection>
            <AnimatedSection delay={0.1} className="text-center">
              <h3 className="text-3xl font-alt font-bold text-dark-gray mb-1">22+</h3>
              <span className="font-alt font-medium text-dark-gray">cidades</span>
              <p className="text-medium-gray text-sm mt-1">na área de atuação</p>
            </AnimatedSection>
            <AnimatedSection delay={0.2} className="text-center">
              <h3 className="text-3xl font-alt font-bold text-dark-gray mb-1">Inúmeros</h3>
              <span className="font-alt font-medium text-dark-gray">serviços</span>
              <p className="text-medium-gray text-sm mt-1">prestados</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-solitude-blue py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-block bg-white text-base-color text-xs font-semibold uppercase px-6 py-2 rounded-full mb-4 font-alt">Linha do tempo</span>
            <h3 className="text-3xl font-alt font-semibold text-dark-gray">Conheça um pouco mais sobre nossa história</h3>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {timeline.map((item, i) => (
              <AnimatedSection key={item.year} delay={i * 0.1}>
                <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition group overflow-hidden relative">
                  <div className="flex items-center gap-6">
                    <h2 className="text-3xl font-alt font-bold text-dark-gray flex-shrink-0 group-hover:text-white relative z-10 transition">{item.year}</h2>
                    <div className="border-l border-extra-medium-gray pl-6 relative z-10">
                      <span className="font-alt font-medium text-dark-gray group-hover:text-white transition">{item.title}</span>
                      <p className="text-medium-gray text-sm mt-1 group-hover:text-white/70 transition">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-base-color transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Carousel */}
      <ClientsCarousel />
    </main>
  );
};

export default Sobre;
