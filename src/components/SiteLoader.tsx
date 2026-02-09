import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const SiteLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const forceLoader = location.pathname === "/carregando";

  const waitForImages = useCallback(() => {
    setLoading(true);

    // Use a longer delay to let the new route fully render images into the DOM
    // A single rAF fires too early — images from lazy/deferred components may not be in the DOM yet
    const timer = setTimeout(() => {
      const collectSources = (): string[] => {
        const allSrcs: string[] = [];

        // <img> elements
        const imgs = Array.from(document.querySelectorAll("img"));
        imgs.forEach((img) => {
          if (img.src && !img.complete) allSrcs.push(img.src);
        });

        // Inline background-image styles
        const bgEls = Array.from(document.querySelectorAll<HTMLElement>("[style*='background-image']"));
        bgEls.forEach((el) => {
          const match = el.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
          if (match?.[1]) allSrcs.push(match[1]);
        });

        // CSS background-image from computed styles on elements with known bg classes
        const bgCandidates = Array.from(document.querySelectorAll<HTMLElement>(
          "[class*='bg-[url'], [class*='background'], section, .hero, .banner, [data-bg]"
        ));
        bgCandidates.forEach((el) => {
          const computed = getComputedStyle(el).backgroundImage;
          if (computed && computed !== "none") {
            const match = computed.match(/url\(["']?(.+?)["']?\)/);
            if (match?.[1] && !allSrcs.includes(match[1])) allSrcs.push(match[1]);
          }
        });

        return allSrcs;
      };

      const allSrcs = collectSources();

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
    }, 150); // 150ms delay gives time for route components to mount and render images

    // Fallback timeout
    const timeout = setTimeout(() => setLoading(false), 8000);
    return () => {
      clearTimeout(timer);
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
            {/* Animated ring */}
              <svg
                className="absolute inset-0 w-full h-full animate-spin"
                style={{ animationDuration: "2s" }}
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
                  opacity="0.6"
                />
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
