import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SiteLoader = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // Fallback timeout
    const timeout = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-dark-gray flex flex-col items-center justify-center"
          >
            <img
              src="/images/logo-white.png"
              alt="GuardianTech"
              className="w-40 mb-8"
            />
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-base-color"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ visibility: loading ? "hidden" : "visible" }}>{children}</div>
    </>
  );
};

export default SiteLoader;
