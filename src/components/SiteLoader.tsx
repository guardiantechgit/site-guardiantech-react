import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const SiteLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const forceLoader = location.pathname === "/carregando";

  const waitForImages = useCallback(() => {
    setLoading(true);

    // Small delay to let the new route render its images into the DOM
    const raf = requestAnimationFrame(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      const bgEls = Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"));

      const allSrcs: string[] = [];

      imgs.forEach((img) => {
        if (img.src && !img.complete) allSrcs.push(img.src);
      });

      bgEls.forEach((el) => {
        const match = el.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
        if (match?.[1]) allSrcs.push(match[1]);
      });

      if (allSrcs.length === 0) {
        setLoading(false);
        return;
      }

      let loaded = 0;
      const total = allSrcs.length;

      const checkDone = () => {
        loaded++;
        if (loaded >= total) setLoading(false);
      };

      allSrcs.forEach((src) => {
        const img = new Image();
        img.onload = checkDone;
        img.onerror = checkDone;
        img.src = src;
      });
    });

    // Fallback timeout
    const timeout = setTimeout(() => setLoading(false), 8000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (forceLoader) {
      setLoading(true);
      return;
    }
    return waitForImages();
  }, [location.pathname, waitForImages, forceLoader]);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="site-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{ backgroundColor: "#1f232c" }}
          >
            {/* Radial glow behind logo */}
            <div className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, hsl(44 35% 52%) 0%, transparent 70%)" }} />

            {/* Logo with pulse animation */}
            <motion.div
              className="relative z-10 mb-8"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="/images/logo-icon.png"
                alt="GuardianTech"
                className="w-24 h-24 md:w-28 md:h-28 drop-shadow-lg"
              />
            </motion.div>

            {/* Animated ring around logo area */}
            <svg
              className="absolute z-10 w-36 h-36 md:w-40 md:h-40"
              style={{ marginBottom: "2rem" }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="hsl(44 35% 52%)"
                strokeWidth="1.5"
                strokeDasharray="80 200"
                strokeLinecap="round"
                opacity="0.5"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 50 50;360 50 50"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(44 35% 52%)"
                strokeWidth="0.8"
                strokeDasharray="40 180"
                strokeLinecap="round"
                opacity="0.3"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="360 50 50;0 50 50"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Loading text */}
            <motion.span
              className="relative z-10 text-white/60 text-sm font-alt tracking-widest uppercase mt-2"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              Carregando...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="transition-all duration-500"
        style={{
          filter: loading ? "blur(8px)" : "blur(0px)",
          opacity: loading ? 0 : 1,
        }}
      >
        {children}
      </div>
    </>
  );
};

export default SiteLoader;
