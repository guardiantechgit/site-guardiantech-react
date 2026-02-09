import { useEffect, useRef, useState } from "react";
import AnimatedSection from "@/components/AnimatedSection";
import { useClientLogos } from "@/hooks/useClientLogos";

const ClientsCarousel = () => {
  const { data: logos = [] } = useClientLogos(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (logos.length === 0) return;
    const interval = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 30);
    return () => clearInterval(interval);
  }, [logos.length]);

  if (logos.length === 0) return null;

  const doubled = [...logos, ...logos];

  const renderLogo = (logo: typeof logos[0], i: number) => {
    const img = (
      <img
        src={logo.image_url}
        alt={logo.name}
        className="h-[120px] object-contain opacity-70 hover:opacity-100 transition"
        loading="lazy"
      />
    );

    return (
      <div key={`${logo.id}-${i}`} className="flex-shrink-0 flex items-center justify-center" style={{ width: 180 }}>
        {logo.url ? (
          <a href={logo.url} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  };

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
              transform: `translateX(-${offset % (logos.length * 200)}px)`,
              transition: "none",
              width: `${logos.length * 2 * 200}px`,
            }}
          >
            {doubled.map((logo, i) => renderLogo(logo, i))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsCarousel;
