import { useState, useEffect, useRef } from "react";

/**
 * Requests geolocation permission on first user interaction.
 * If granted, stores coordinates. If denied, stores empty string silently.
 */
export function useGeolocation() {
  const [geolocation, setGeolocation] = useState<string>("");
  const [requested, setRequested] = useState(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    const requestLocation = () => {
      if (requestedRef.current) return;
      requestedRef.current = true;
      setRequested(true);

      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeolocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        () => {
          // Denied or error — just leave empty, don't block anything
          setGeolocation("");
        },
        { timeout: 10000 }
      );
    };

    // Request on first interaction
    const events = ["click", "touchstart", "keydown", "mousemove", "scroll"];
    const handler = () => {
      requestLocation();
      events.forEach((e) => window.removeEventListener(e, handler));
    };

    events.forEach((e) => window.addEventListener(e, handler, { once: true, passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, []);

  return { geolocation, requested };
}
