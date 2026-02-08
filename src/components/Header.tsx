import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown, MapPin, Key, Binoculars } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
  }, [location]);

  const isHome = location.pathname === "/";
  const headerBg = scrolled || !isHome ? "bg-white shadow-md" : "bg-transparent";
  const textColor = scrolled || !isHome ? "text-dark-gray" : "text-white";
  const logo = scrolled || !isHome ? "/images/logo-black.png" : "/images/logo-white.png";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="GuardianTech" className="h-[26px]" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Início</Link>
            <Link to="/sobre" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Sobre</Link>
            <div className="relative group">
              <div className="flex items-center gap-1">
                <Link to="/servicos" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Serviços</Link>
                <ChevronDown size={12} className={`${textColor} group-hover:rotate-180 transition`} />
              </div>
              <div className="absolute top-full left-0 bg-dark-gray shadow-lg rounded-lg py-2 min-w-[240px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-2">
                <a href="https://www.youtube.com/watch?v=14xXieeVy3c&ab_channel=GuardianTech" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3 text-white text-sm hover:opacity-50 transition border-b border-white/10">
                  <MapPin size={16} /> Rastreamento Veicular
                </a>
                <Link to="/controle-de-acesso" className="flex items-center gap-3 px-5 py-3 text-white text-sm hover:opacity-50 transition border-b border-white/10">
                  <Key size={16} /> Controle de Acesso
                </Link>
                <Link to="/portaria-e-vigilancia" className="flex items-center gap-3 px-5 py-3 text-white text-sm hover:opacity-50 transition">
                  <Binoculars size={16} /> Portaria e Vigilância
                </Link>
              </div>
            </div>
            <Link to="/clientes" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Clientes</Link>
            <Link to="/contato" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Contato</Link>
            <a href="https://rastreamento.guardiantech.site" target="_blank" rel="noreferrer" className={`font-alt text-[17px] hover:opacity-70 transition ${textColor}`}>Plataforma</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <div className="hidden 2xl:flex items-center gap-2">
              <span className="w-9 h-9 bg-base-color rounded-full flex items-center justify-center">
                <Phone size={14} className="text-white" />
              </span>
              <a href="tel:5519999722280" className={`font-alt text-sm font-medium ${textColor} hover:text-white transition`}>(19) 99972-2280</a>
            </div>
            <Link to="/contato" className={`border rounded-full px-5 py-2 text-sm font-medium transition hover:bg-dark-gray hover:text-white hover:border-dark-gray ${scrolled || !isHome ? "border-dark-gray text-dark-gray" : "border-white/30 text-white"}`}>
              Fale conosco
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden ${textColor}`}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="flex flex-col py-4 px-6 gap-2">
            <Link to="/" className="font-alt text-dark-gray py-2 text-[17px]">Início</Link>
            <Link to="/sobre" className="font-alt text-dark-gray py-2 text-[17px]">Sobre</Link>
            <button onClick={() => setServicesOpen(!servicesOpen)} className="font-alt text-dark-gray py-2 text-left flex items-center justify-between text-[17px]">
              Serviços <ChevronDown size={14} className={`transition ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            {servicesOpen && (
              <div className="bg-dark-gray rounded-lg py-2 px-4 mb-2">
                <a href="https://www.youtube.com/watch?v=14xXieeVy3c" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white text-sm py-3 border-b border-white/10">
                  <MapPin size={14} /> Rastreamento Veicular
                </a>
                <Link to="/controle-de-acesso" className="flex items-center gap-2 text-white text-sm py-3 border-b border-white/10">
                  <Key size={14} /> Controle de Acesso
                </Link>
                <Link to="/portaria-e-vigilancia" className="flex items-center gap-2 text-white text-sm py-3">
                  <Binoculars size={14} /> Portaria e Vigilância
                </Link>
              </div>
            )}
            <Link to="/clientes" className="font-alt text-dark-gray py-2 text-[17px]">Clientes</Link>
            <Link to="/contato" className="font-alt text-dark-gray py-2 text-[17px]">Contato</Link>
            <a href="https://rastreamento.guardiantech.site" target="_blank" rel="noreferrer" className="font-alt text-dark-gray py-2 text-[17px]">Plataforma</a>
            <a href="tel:5519999722280" className="text-base-color font-medium py-2">(19) 99972-2280</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
