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
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(ellipse at 30% 40%, #2a2e38 0%, #1f232c 50%, #181b22 100%)",
                  "radial-gradient(ellipse at 60% 60%, #2a2e38 0%, #1f232c 50%, #181b22 100%)",
                  "radial-gradient(ellipse at 40% 50%, #2a2e38 0%, #1f232c 50%, #181b22 100%)",
                  "radial-gradient(ellipse at 30% 40%, #2a2e38 0%, #1f232c 50%, #181b22 100%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Radial glow behind logo */}
            <motion.div
              className="absolute w-64 h-64 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, hsl(44 35% 52%) 0%, transparent 70%)" }}
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Logo + rings container - everything centered together */}
            <div className="relative z-10 flex items-center justify-center w-40 h-40 md:w-44 md:h-44 mb-6">
              {/* Animated rings */}
              <svg
                className="absolute inset-0 w-full h-full"
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

              {/* Logo centered inside the rings */}
              <motion.img
                src="/images/logo-icon.png"
                alt="GuardianTech"
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-lg"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Loading text */}
            <motion.span
              className="relative z-10 text-white/60 text-sm font-alt tracking-widest uppercase"
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
