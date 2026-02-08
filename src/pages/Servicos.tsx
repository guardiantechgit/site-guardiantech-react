import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import PageSEO from "@/components/PageSEO";

const services = [
  {
    image: "/images/service-title-rastreamento.jpg",
    title: "Rastreamento Veicular",
    desc: "Monitore seus veículos em tempo real com o melhor serviço de rastreamento do mercado.",
    link: "/rastreamento",
    external: false,
  },
  {
    image: "/images/service-title-acesso.jpg",
    title: "Controle de Acesso",
    desc: "Automatize entradas e saídas com sistemas integrados, tags, biometria e softwares de controle.",
    link: "/controle-de-acesso",
    external: false,
  },
  {
    image: "/images/service-title-portaria.jpg",
    title: "Portaria e Vigilância",
    desc: "Serviços de portaria física e vigilância patrimonial, com rondas e equipe treinada sob demanda.",
    link: "/portaria-e-vigilancia",
    external: false,
  },
];

const Servicos = () => (
  <main>
    <PageSEO
      title="Serviços - GuardianTech"
      description="Conheça os serviços da GuardianTech: rastreamento veicular, controle de acesso, portaria e vigilância patrimonial para empresas e condomínios."
      ogImage="/images/title-servicos.jpg"
      path="/servicos"
    />
    <PageTitle title="Serviços oferecidos" backgroundImage="/images/title-servicos.jpg" />

    <section id="down-section" className="bg-solitude-blue py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
          <AnimatedSection>
            <h3 className="text-3xl md:text-4xl font-alt font-semibold text-dark-gray leading-tight">
              Soluções integradas em segurança, tecnologia e rastreamento.
            </h3>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-medium-gray leading-relaxed">
              Atuamos com soluções completas para empresas, frotas e condomínios. Nossa expertise abrange desde rastreamento veicular até sistemas de segurança avançados, com os melhores equipamentos e tecnologia de ponta.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.15}>
              {service.external ? (
                <a href={service.link} target="_blank" rel="noreferrer" className="block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group">
                  <div className="relative overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-dark-gray/0 group-hover:bg-dark-gray/40 transition flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <ArrowRight size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="font-alt font-medium text-dark-gray text-lg mb-2">{service.title}</h4>
                    <p className="text-medium-gray text-sm">{service.desc}</p>
                  </div>
                </a>
              ) : (
                <Link to={service.link} className="block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group">
                  <div className="relative overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-dark-gray/0 group-hover:bg-dark-gray/40 transition flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <ArrowRight size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="font-alt font-medium text-dark-gray text-lg mb-2">{service.title}</h4>
                    <p className="text-medium-gray text-sm">{service.desc}</p>
                  </div>
                </Link>
              )}
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Servicos;
