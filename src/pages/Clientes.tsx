import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";

const clients = [
  "cliente-vencomatic.png",
  "cliente-asernet.png",
  "cliente-peluso-sperandio.png",
  "cliente-sobradao.png",
  "cliente-florestas-da-sao-vicente.png",
  "cliente-luxiluminacao.png",
  "cliente-sitio-dos-ipes.png",
  "cliente-villa-real-de-braganca.png",
  "cliente-lumaq.png",
  "cliente-ac-oliveira.png",
  "cliente-hgb.png",
  "cliente-eletricaapolo.png",
  "cliente-comandofox.png",
  "cliente-uaiveiculos.png",
  "cliente-logmov.png",
  "cliente-locagora.png",
];

const Clientes = () => (
  <main>
    <PageTitle title="Nossos clientes" backgroundImage="/images/title-clientes.jpg" />

    <section id="down-section" className="py-16">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <h5 className="font-alt font-semibold text-dark-gray text-xl md:text-2xl">
            Empresas que confiaram nos serviços da GuardianTech
          </h5>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {clients.map((c, i) => (
            <AnimatedSection key={c} delay={i * 0.05} className="flex items-center justify-center py-4">
              <img
                src={`/images/${c}`}
                alt=""
                className="h-[150px] w-[220px] object-contain opacity-70 hover:opacity-100 transition"
                loading="lazy"
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Clientes;
