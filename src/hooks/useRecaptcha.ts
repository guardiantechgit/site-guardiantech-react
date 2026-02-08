import { useEffect, useCallback } from "react";

const SITE_KEY = "6LecgGQsAAAAAObDOd77eojC-Z-Y4ThrK63SyHgW";

let scriptLoaded = false;

export function useRecaptcha() {
  useEffect(() => {
    if (scriptLoaded) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    scriptLoaded = true;
  }, []);

  const getToken = useCallback(async (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const win = window as any;
      const check = () => {
        if (win.grecaptcha?.ready) {
          win.grecaptcha.ready(() => {
            win.grecaptcha
              .execute(SITE_KEY, { action })
              .then(resolve)
              .catch(reject);
          });
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }, []);

  return { getToken };
}
