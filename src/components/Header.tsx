import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

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
  const headerBg = scrolled || !isHome
    ? "bg-white shadow-md"
    : "bg-transparent";
  const textColor = scrolled || !isHome ? "text-dark-gray" : "text-white";
  const logo = scrolled || !isHome ? "/images/logo-black.png" : "/images/logo-white.png";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="GuardianTech" className="h-10" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`font-alt font-medium text-sm hover:opacity-70 transition ${textColor}`}>Início</Link>
            <Link to="/sobre" className={`font-alt font-medium text-sm hover:opacity-70 transition ${textColor}`}>Sobre</Link>
            <div className="relative group">
              <Link to="/servicos" className={`font-alt font-medium text-sm hover:opacity-70 transition flex items-center gap-1 ${textColor}`}>
                Serviços <ChevronDown size={14} />
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="https://www.youtube.com/watch?v=14xXieeVy3c&ab_channel=GuardianTech" target="_blank" rel="noreferrer" className="block px-4 py-2 text-dark-gray text-sm hover:bg-solitude-blue transition">
                  📍 Rastreamento Veicular
                </a>
                <Link to="/servicos" className="block px-4 py-2 text-dark-gray text-sm hover:bg-solitude-blue transition">
                  🔑 Controle de Acesso
                </Link>
                <Link to="/servicos" className="block px-4 py-2 text-dark-gray text-sm hover:bg-solitude-blue transition">
                  🔭 Portaria e Vigilância
                </Link>
              </div>
            </div>
            <Link to="/contato" className={`font-alt font-medium text-sm hover:opacity-70 transition ${textColor}`}>Contato</Link>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:5519999722280" className={`flex items-center gap-2 text-sm font-medium ${textColor}`}>
              <span className="w-9 h-9 bg-base-color rounded-full flex items-center justify-center">
                <Phone size={14} className="text-white" />
              </span>
              (19) 99972-2280
            </a>
            <Link to="/contato" className={`border rounded-full px-5 py-2 text-sm font-medium transition hover:bg-base-color hover:text-white hover:border-base-color ${scrolled || !isHome ? 'border-dark-gray text-dark-gray' : 'border-white/30 text-white'}`}>
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
          <nav className="flex flex-col py-4 px-6 gap-4">
            <Link to="/" className="font-alt text-dark-gray font-medium py-2">Início</Link>
            <Link to="/sobre" className="font-alt text-dark-gray font-medium py-2">Sobre</Link>
            <button onClick={() => setServicesOpen(!servicesOpen)} className="font-alt text-dark-gray font-medium py-2 text-left flex items-center justify-between">
              Serviços <ChevronDown size={14} className={`transition ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="pl-4 flex flex-col gap-2">
                <a href="https://www.youtube.com/watch?v=14xXieeVy3c" target="_blank" rel="noreferrer" className="text-sm text-medium-gray py-1">Rastreamento Veicular</a>
                <Link to="/servicos" className="text-sm text-medium-gray py-1">Controle de Acesso</Link>
                <Link to="/servicos" className="text-sm text-medium-gray py-1">Portaria e Vigilância</Link>
              </div>
            )}
            <Link to="/contato" className="font-alt text-dark-gray font-medium py-2">Contato</Link>
            <a href="tel:5519999722280" className="text-base-color font-medium py-2">(19) 99972-2280</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
