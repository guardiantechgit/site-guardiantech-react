import { useEffect, useRef, useState } from "react";
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
];

const ClientsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-6">
          <span className="font-alt font-semibold text-lg text-dark-gray border-b-2 border-extra-medium-gray pb-1">
            Venha crescer junto com a GuardianTech!
          </span>
        </AnimatedSection>

        <div className="overflow-hidden mt-6">
          <div
            ref={scrollRef}
            className="flex items-center gap-10"
            style={{
              transform: `translateX(-${offset % (clients.length * 200)}px)`,
              transition: "none",
              width: `${clients.length * 2 * 200}px`,
            }}
          >
            {[...clients, ...clients].map((c, i) => (
              <div key={i} className="flex-shrink-0 flex items-center justify-center" style={{ width: 180 }}>
                <img
                  src={`/images/${c}`}
                  alt=""
                  className="h-[120px] object-contain opacity-70 hover:opacity-100 transition"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
