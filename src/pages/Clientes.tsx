import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import PageSEO from "@/components/PageSEO";
import { useClientLogos } from "@/hooks/useClientLogos";
import { Loader2 } from "lucide-react";

const Clientes = () => {
  const { data: logos = [], isLoading } = useClientLogos(true);

  return (
    <main>
      <PageSEO
        title="Clientes - GuardianTech"
        description="Conheça as empresas que confiam na GuardianTech para soluções de segurança, tecnologia e rastreamento veicular."
        ogImage="/images/title-clientes.jpg"
        path="/clientes"
      />
      <PageTitle title="Nossos clientes" backgroundImage="/images/title-clientes.jpg" />

      <section id="down-section" className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-10">
            <h5 className="font-alt font-semibold text-dark-gray text-xl md:text-2xl">
              Empresas que confiaram nos serviços da GuardianTech
            </h5>
          </AnimatedSection>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {logos.map((logo, i) => (
                <AnimatedSection key={logo.id} delay={i * 0.05} className="flex items-center justify-center py-4">
                  <img
                    src={logo.image_url}
                    alt={logo.name}
                    className="h-[150px] w-[220px] object-contain opacity-70 hover:opacity-100 transition"
                    loading="lazy"
                  />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Clientes;
