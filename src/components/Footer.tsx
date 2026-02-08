import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-extra-medium-slate-blue text-white py-16 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Info */}
          <div className="text-center sm:text-left">
            <Link to="/" className="inline-block mb-4">
              <img src="/images/logo-white.png" alt="GuardianTech" className="h-8" />
            </Link>
            <p className="text-white/70 text-sm mb-4">Soluções completas em segurança e rastreamento.</p>
            <p className="text-white/70 text-sm">
              GuardianTech © {year}<br />
              CNPJ 41.265.347/0001-43
            </p>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-alt font-medium mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li><a href="https://www.youtube.com/watch?v=14xXieeVy3c&ab_channel=GuardianTech" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">Rastreamento</a></li>
              <li><Link to="/servicos" className="text-white/60 text-sm hover:text-white transition">Controle de Acesso</Link></li>
              <li><Link to="/servicos" className="text-white/60 text-sm hover:text-white transition">Portaria e Vigilância</Link></li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-alt font-medium mb-4">Redes sociais</h4>
            <ul className="space-y-2">
              <li><a href="https://www.facebook.com/guardiantecnologia" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">Facebook</a></li>
              <li><a href="https://www.youtube.com/@GuardianTechTecnologia" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">YouTube</a></li>
              <li><a href="https://www.instagram.com/guardiantech_oficial" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@guardiantech_seguranca" target="_blank" rel="noreferrer" className="text-white/60 text-sm hover:text-white transition">TikTok</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-alt font-medium mb-4">Entre em contato</h4>
            <div className="space-y-3">
              <a href="https://wa.me/5519999722280?text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20do%20Site%20da%20Guardiantech" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition">
                <Phone size={14} /> WhatsApp: (19) 99972-2280
              </a>
              <a href="mailto:contato@guardiantech.site" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition">
                <Mail size={14} /> contato@guardiantech.site
              </a>
              <a href="https://wa.me/5511930309090?text=Ol%C3%A1%2C%20estou%20entrando%20em%20contato%20atrav%C3%A9s%20do%20Site%20da%20Guardiantech" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition">
                <Phone size={14} /> Rastreamento: (11) 93030-9090
              </a>
              <a href="mailto:rastreamento@guardiantech.site" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition">
                <Mail size={14} /> rastreamento@guardiantech.site
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
