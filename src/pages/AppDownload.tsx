import { useEffect, useState, useRef } from "react";
import PageSEO from "@/components/PageSEO";

const LINKS = {
  playWeb: "https://play.google.com/store/apps/details?id=br.com.getrak.guardiantech",
  playApp: "market://details?id=br.com.getrak.guardiantech",
  appWeb: "https://apps.apple.com/us/app/guardiantech-rastreamento/id6747404230",
  appApp: "itms-apps://itunes.apple.com/app/id6747404230",
};

const IDS = {
  androidPackage: "br.com.getrak.guardiantech",
  iosAppId: "6747404230",
};

function detectOS(ua: string) {
  if (/Windows NT 10\.0/.test(ua)) return "Windows 10";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.2/.test(ua)) return "Windows 8";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android\s+([\d._]+)/i);
    return m ? `Android ${m[1].replace(/_/g, ".")}` : "Android";
  }
  if (/Ubuntu/i.test(ua)) return "Linux Ubuntu";
  if (/Fedora/i.test(ua)) return "Linux Fedora";
  if (/Linux/i.test(ua)) return "Linux";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  return "";
}

function detectBrowser(ua: string) {
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Edg\/([\d.]+)/))) return `Microsoft Edge ${m[1]}`;
  if ((m = ua.match(/OPR\/([\d.]+)/))) return `Opera ${m[1]}`;
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return `Samsung Internet ${m[1]}`;
  if ((m = ua.match(/Firefox\/([\d.]+)/))) return `Mozilla Firefox ${m[1]}`;
  if ((m = ua.match(/Version\/([\d.]+).*Safari\//))) return `Safari ${m[1]}`;
  if (/Safari\/[\d.]+/.test(ua) && !/Chrome|Chromium/.test(ua)) return "Safari";
  if ((m = ua.match(/Chrome\/([\d.]+)/))) return `Google Chrome ${m[1]}`;
  if ((m = ua.match(/Chromium\/([\d.]+)/))) return `Chromium ${m[1]}`;
  return "";
}

function detectDevice(ua: string) {
  if (/(iPhone)/i.test(ua)) return "iPhone";
  if (/(iPad)/i.test(ua)) return "iPad";
  if (!/Android/i.test(ua)) return "";
  const m = ua.match(/; ([^;]*?) Build\//);
  if (m && m[1]) return m[1].trim();
  return "dispositivo Android";
}

function withFallbacks(runPrimary: () => void, fallbacks: [number, () => void][]) {
  let left = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const cancel = () => {
    if (left) return;
    left = true;
    timers.forEach((t) => clearTimeout(t));
    window.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", cancel);
    window.removeEventListener("blur", onBlur);
  };
  const onVis = () => { if (document.hidden) cancel(); };
  const onBlur = () => cancel();

  window.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", cancel, { once: true });
  window.addEventListener("blur", onBlur);

  runPrimary();

  fallbacks.forEach(([delay, fn]) => {
    timers.push(setTimeout(() => { if (!left) fn(); }, delay));
  });
  timers.push(setTimeout(cancel, 6000));
}

function openPlayStore() {
  const pkg = IDS.androidPackage;
  const web = `${LINKS.playWeb}&referrer=utm_source%3Dsite%26utm_medium%3Ddeeplink`;
  const intentUrl = `intent://details?id=${encodeURIComponent(pkg)}#Intent;scheme=market;package=com.android.vending;end`;

  withFallbacks(
    () => { try { window.location.href = intentUrl; } catch (_) {} },
    [
      [1200, () => { try { window.location.href = `market://details?id=${pkg}`; } catch (_) {} }],
      [2800, () => { try { window.location.href = web; } catch (_) {} }],
    ]
  );
}

function openAppStore() {
  const itms = `itms-apps://itunes.apple.com/app/id${IDS.iosAppId}`;
  withFallbacks(
    () => { try { window.location.href = itms; } catch (_) {} },
    [[2500, () => { try { window.location.href = LINKS.appWeb; } catch (_) {} }]]
  );
}

const AppDownload = () => {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /(iPhone|iPad|iPod)/i.test(ua);
  const isMobile = isAndroid || isIOS;

  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(10);
  const redirected = useRef(false);

  const os = detectOS(ua);
  const browser = detectBrowser(ua);
  const sysHint = os && browser ? `Sistema detectado: ${os} com ${browser}` : "";

  const deviceName = detectDevice(ua) || (isIOS ? "seu iPhone" : "seu dispositivo");
  const storeName = isAndroid ? "Google Play" : "App Store";

  useEffect(() => {
    const timer = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        clearInterval(timer);
        if (!redirected.current) {
          redirected.current = true;
          if (!isMobile) {
            window.location.href = "https://plataforma.guardiantech.site/";
          } else if (isAndroid) {
            openPlayStore();
          } else {
            openAppStore();
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMobile, isAndroid]);

  return (
    <>
      <PageSEO
        title="GuardianTech Rastreamento - Download"
        description="Baixe agora o aplicativo GuardianTech Rastreamento, solução para rastreamento veicular e monitoramento em tempo real. iOS e Android."
        path="/app"
      />

      <style>{`
        .app-page { font-family: system-ui,-apple-system,Segoe UI,Roboto,Inter,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#111; color:#f3f3f3; -webkit-font-smoothing:antialiased; }
        .app-wrap { display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; padding:16px; }
        .app-card { background:#000; border:1px solid #000; padding:28px 24px; border-radius:14px; box-shadow:0 6px 24px rgba(0,0,0,.35); max-width:560px; width:92%; text-align:center; }
        .app-logo { display:block; margin:0 auto 14px; max-width:500px; width:100%; height:auto; filter:drop-shadow(0 2px 6px rgba(0,0,0,.35)); }
        .app-card h2 { margin:0 0 12px; color:#AF985A; font-weight:600; letter-spacing:.3px; }
        .app-card p { line-height:1.6; letter-spacing:.4px; margin:0 0 10px; }
        .app-lead { font-size:15px; opacity:.95; }
        .app-btns { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:18px; }
        .app-btn { padding:12px 18px; border-radius:10px; text-decoration:none; background:#AF985A; color:#111; font-weight:500; transition:transform .15s ease,box-shadow .15s ease,background .2s; box-shadow:0 2px 10px rgba(0,0,0,.25); }
        .app-btn:hover { background:#c7b67a; transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,.32); }
        .app-hint { opacity:.9; font-size:14px; margin-top:8px; font-style:italic; }
        .app-count { font-variant-numeric:tabular-nums; font-weight:600; }
        .app-sys-hint { max-width:560px; width:92%; text-align:center; font-size:13.5px; color:#b5b5b5; opacity:.95; }
      `}</style>

      <div className="app-page">
        <div className="app-wrap">
          {!isMobile ? (
            <div className="app-card">
              <img className="app-logo" src="https://guardiantech.site/images/guardiantech-app.png" alt="GuardianTrack - Download nas lojas oficiais" />
              <p>O aplicativo está disponível para <strong>App Store (iOS)</strong> e <strong>Google Play (Android)</strong>, porém identificamos que você está em um <strong>computador</strong>.</p>
              <p className="app-hint">Você será redirecionado para a <strong>Plataforma Web</strong> em <span className="app-count">{countdown}</span>…</p>
              <p className="app-hint">Se quiser acessar o aplicativo nas lojas oficiais, utilize os botões abaixo.</p>
              <div className="app-btns" style={{ flexDirection: "column", alignItems: "center" }}>
                <a className="app-btn" href="https://plataforma.guardiantech.site/" rel="noopener" target="_blank">Plataforma Web</a>
                <div style={{ display: "flex", gap: "12px" }}>
                  <a className="app-btn" href={LINKS.appWeb} rel="noopener" target="_blank">App Store (iOS)</a>
                  <a className="app-btn" href={LINKS.playWeb} rel="noopener" target="_blank">Google Play (Android)</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="app-card">
              <img className="app-logo" src="https://guardiantech.site/images/guardiantrack-loja.png" alt="GuardianTech - Download nas lojas oficiais" />
              <p className="app-lead">
                Foi detectado que você está utilizando um <strong>{deviceName}</strong>, portanto, estamos direcionando você para a <strong>{storeName}</strong>.
              </p>
              <p className="app-hint">
                Redirecionando em <span className="app-count">{countdown}</span>…
              </p>
              <p className="app-hint">Caso não seja redirecionado, use o botão abaixo.</p>
              <div className="app-btns">
                {isIOS && <a className="app-btn" href={LINKS.appWeb} rel="noopener">App Store</a>}
                {isAndroid && <a className="app-btn" href={LINKS.playWeb} rel="noopener">Google Play</a>}
              </div>
            </div>
          )}

          {sysHint && <div className="app-sys-hint">{sysHint}</div>}
        </div>
      </div>
    </>
  );
};

export default AppDownload;
