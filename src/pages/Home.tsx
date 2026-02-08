import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Hourglass, Award, Briefcase, ArrowRight, MapPin, Shield, Eye, Play, Star } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import AnimatedSection from "@/components/AnimatedSection";
import ClientsCarousel from "@/components/ClientsCarousel";
import PageSEO from "@/components/PageSEO";


const slides = [
  {
    bg: "/images/background-rastreamento.jpg",
    subtitle: "Tecnologia de ponta em",
    title: "Rastreamento de",
    highlight: "veículos.",
    link: "/rastreamento",
    linkText: "Conheça o serviço",
  },
  {
    bg: "/images/background-seguranca.jpg",
    subtitle: "Soluções completas para",
    title: "Empresas e",
    highlight: "condomínios.",
    link: "/servicos",
    linkText: "Conheça o serviço",
  },
];

const features = [
  { icon: ShieldCheck, text: "Segurança comprovada" },
  { icon: Hourglass, text: "Agilidade na execução" },
  { icon: Award, text: "Equipe capacitada" },
  { icon: Briefcase, text: "Parceria com empresas" },
];

const services = [
  {
    id: "rastreamento",
    icon: MapPin,
    label: "Rastreamento",
    image: "/images/service-rastreamento.jpg",
    title: "Rastreamento",
    titleSuffix: " de veículos em tempo real",
    desc: "Monitoramos seu veículo com a mais alta tecnologia, incluindo motocicletas, carros, caminhões, tratores, cargas e máquinas.",
    link: "/rastreamento",
    external: false,
  },
  {
    id: "acesso",
    icon: Shield,
    label: "Controle de Acesso",
    image: "/images/service-acesso.jpg",
    title: "Soluções",
    titleSuffix: " de acesso personalizadas",
    desc: "Controle o acesso do seu condomínio ou empresa com leitores faciais, biométricos, senha e tag de aproximação, com catracas e cancelas.",
    link: "/servicos",
    external: false,
  },
  {
    id: "portaria",
    icon: Eye,
    label: "Portaria e Vigilância",
    image: "/images/service-portaria.jpg",
    title: "Portaria",
    titleSuffix: " e rondas motorizadas",
    desc: "Porteiros treinados e vigilância com rondas periódicas para total segurança do condomínio.",
    link: "/servicos",
    external: false,
  },
];

const vehicleImages = [
  "/images/circle-car.jpg",
  "/images/circle-bike.jpg",
  "/images/circle-tractor.jpg",
  "/images/circle-truck.jpg",
  "/images/circle-boat.jpg",
];

const rotatingWords = ["carros", "motos", "caminhões", "tratores", "máquinas", "cargas", "barcos"];
const ctaWords = ["rastreamento!", "segurança!", "tecnologia!", "acesso!", "vigilância!", "portaria!"];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeService, setActiveService] = useState("rastreamento");
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [ctaIdx, setCtaIdx] = useState(0);

  // Preload all service images so tab switch is instant
  useEffect(() => {
    services.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setVehicleIdx((p) => (p + 1) % vehicleImages.length), 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWordIdx((p) => (p + 1) % rotatingWords.length), 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCtaIdx((p) => (p + 1) % ctaWords.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const activeServiceData = services.find((s) => s.id === activeService)!;
  const slide = slides[currentSlide];

  return (
    <main>
      <PageSEO
        title="GuardianTech - Segurança, Tecnologia e Rastreamento"
        description="Especializada em rastreamento veicular e segurança eletrônica, a GuardianTech protege seu patrimônio com tecnologia de ponta para carros, motos, caminhões, cargas, barcos e tratores."
        ogImage="/images/og-index.jpg"
        path="/"
      />
      {/* Hero Slider */}
      <section className="relative h-screen md:h-[600px] sm:h-[500px] bg-dark-gray overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.bg})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-4 h-full relative z-10 flex items-center">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white text-center md:text-left"
          >
            <span className="text-lg md:text-xl opacity-60 font-light mb-4 block">{slide.subtitle}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-alt leading-tight">
              {slide.title} <span className="font-semibold">{slide.highlight}</span>
            </h1>
            <Link to={slide.link} className="inline-flex items-center gap-3 mt-8 bg-base-color text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition text-sm md:text-base">
                {slide.linkText}
                <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <ArrowRight size={14} className="text-base-color" />
                </span>
              </Link>
          </motion.div>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition ${i === currentSlide ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-extra-medium-gray py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <f.icon size={24} className="text-base-color flex-shrink-0" />
                  <span className="font-alt font-medium text-dark-gray">{f.text}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="text-center lg:text-left">
                <span className="inline-block bg-solitude-blue text-base-color text-xs font-semibold uppercase px-6 py-2 rounded-full mb-6 font-alt">Sobre a GuardianTech</span>
                <h3 className="text-3xl md:text-4xl font-alt font-semibold text-dark-gray leading-tight mb-5">Especialista em soluções de segurança</h3>
                <p className="text-medium-gray leading-relaxed mb-8">Oferecemos soluções completas na área de segurança para pessoas físicas, condomínios e empresas, incluindo um eficiente sistema de rastreamento veicular.</p>
                <span className="text-lg text-dark-gray font-alt font-medium">
                  Este é o momento de investir{" "}
                  <span className="font-semibold text-base-color underline decoration-2 underline-offset-4">em sua tranquilidade.</span>
                </span>
              </div>
            </AnimatedSection>
            <div className="relative">
              <div className="text-right w-4/5 ml-auto">
                <img src="/images/about-home-01.jpg" alt="Segurança" className="rounded-lg shadow-lg" loading="lazy" />
              </div>
              <div className="absolute left-0 -bottom-12 w-3/5">
                <img src="/images/about-home-02.jpg" alt="Rastreamento" className="rounded-lg shadow-2xl" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="bg-solitude-blue py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-alt font-semibold text-dark-gray">Serviços de excelência para todas as suas demandas</h3>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-3">
              <div className="flex flex-row lg:flex-col gap-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveService(s.id)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-lg text-left font-alt font-medium text-sm transition w-full ${activeService === s.id ? "bg-white shadow-lg text-dark-gray" : "text-medium-gray hover:text-dark-gray"}`}
                  >
                    <s.icon size={20} />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <img src={activeServiceData.image} alt={activeServiceData.label} className="rounded-lg w-full" loading="lazy" />
                  <div className="text-center md:text-left">
                    <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                      <span className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center">
                        <activeServiceData.icon size={22} className="text-dark-gray" />
                      </span>
                      <span className="font-alt font-semibold text-base-color text-lg">{activeServiceData.label}</span>
                    </div>
                    <h5 className="text-2xl font-alt text-dark-gray mb-4">
                      <span className="font-semibold">{activeServiceData.title}</span>{activeServiceData.titleSuffix}
                    </h5>
                    <p className="text-medium-gray mb-6">{activeServiceData.desc}</p>
                    {activeServiceData.external ? (
                      <a href={activeServiceData.link} target="_blank" rel="noreferrer" className="inline-block bg-base-color text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition">
                        Conheça o serviço
                      </a>
                    ) : (
                      <Link to={activeServiceData.link} className="inline-block bg-base-color text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition">
                        Conheça o serviço
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Video Banner */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div
            className="relative rounded-lg h-[350px] md:h-[500px] bg-cover bg-center flex items-end justify-center pb-12 overflow-hidden"
            style={{ backgroundImage: "url(/images/background-video-rastreamento.jpg)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full px-8">
              <div className="text-center md:text-left flex-1">
                <h5 className="text-white text-xl md:text-2xl font-alt font-light">
                  As melhores opções em rastreadores para{" "}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-semibold inline-block"
                    >
                      {rotatingWords[wordIdx]}
                    </motion.span>
                  </AnimatePresence>
                </h5>
              </div>
              <VideoModal videoUrl="https://www.youtube.com/watch?v=14xXieeVy3c">
                <span className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white/10 transition">
                  <Play size={28} className="text-white ml-1" />
                </span>
              </VideoModal>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-solitude-blue to-transparent py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            <AnimatedSection>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
                <img src={vehicleImages[vehicleIdx]} alt="Veículo" className="w-full h-full object-cover transition-all duration-500" />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <h5 className="text-dark-gray font-alt font-medium text-lg md:text-xl text-center lg:text-left max-w-sm">
                Nossa plataforma possui mais de <span className="font-bold text-base-color">1.200.000</span> veículos monitorados.
              </h5>
            </AnimatedSection>
            <AnimatedSection delay={0.3} className="text-center lg:text-left">
              <h3 className="text-dark-gray font-alt font-bold text-3xl">1.500+</h3>
              <span className="text-dark-gray font-medium text-sm">clientes em território nacional</span>
            </AnimatedSection>
            <AnimatedSection delay={0.4} className="text-center lg:text-left">
              <div className="flex gap-1 text-base-color mb-2 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-dark-gray font-medium text-sm">Equipamentos de última geração</span>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="relative py-16 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/background-cybersecurity.jpg)" }}
      >
        <div className="absolute inset-0 bg-dark-slate-blue/80" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h4 className="text-white text-2xl md:text-3xl font-alt font-light">
            Nós somos a solução que você buscava em{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={ctaIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="font-semibold inline-block"
              >
                {ctaWords[ctaIdx]}
              </motion.span>
            </AnimatePresence>
          </h4>
        </div>
      </section>


      {/* Clients */}
      <ClientsCarousel />
    </main>
  );
};

export default Home;
