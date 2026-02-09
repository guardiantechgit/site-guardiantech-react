import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageTitle from "@/components/PageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import PageSEO from "@/components/PageSEO";
import { useClientLogos } from "@/hooks/useClientLogos";
import { Loader2 } from "lucide-react";

const Clientes = () => {
  const { data: logos = [], isLoading } = useClientLogos(true);
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    // Detect when the SiteLoader finishes (blur removed from content)
    const observer = new MutationObserver(() => {
      const wrapper = document.querySelector('[style*="blur(0px)"]');
      if (wrapper) {
        setLoaderDone(true);
        observer.disconnect();
      }
    });
    // Check immediately
    if (document.querySelector('[style*="blur(0px)"]')) {
      setLoaderDone(true);
    } else {
      observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["style"] });
    }
    return () => observer.disconnect();
  }, []);

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
                <motion.div
                  key={logo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={loaderDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  className="flex items-center justify-center py-4"
                >
                  <img
                    src={logo.image_url}
                    alt={logo.name}
                    className="h-[150px] w-[220px] object-contain hover:opacity-70 transition"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Clientes;
