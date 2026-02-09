import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Sobre from "@/pages/Sobre";
import Servicos from "@/pages/Servicos";
import Contato from "@/pages/Contato";
import Clientes from "@/pages/Clientes";
import LandingRastreamento from "@/pages/LandingRastreamento";
import EmConstrucao from "@/pages/EmConstrucao";
import ContrateFisica from "@/pages/ContrateFisica";
import ContrateJuridica from "@/pages/ContrateJuridica";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Carregando from "@/pages/Carregando";
import AppDownload from "@/pages/AppDownload";
import ScrollToTop from "@/components/ScrollToTop";
import SiteLoader from "@/components/SiteLoader";

const PlataformaRedirect = () => {
  window.location.replace("https://plataforma.guardiantech.site/");
  return null;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname === "/app";

  return (
    <SiteLoader>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/rastreamento" element={<LandingRastreamento />} />
        <Route path="/controle-de-acesso" element={<EmConstrucao />} />
        <Route path="/landingr" element={<LandingRastreamento />} />
        <Route path="/contrate-fisica" element={<ContrateFisica />} />
        <Route path="/contrate-juridica" element={<ContrateJuridica />} />
        <Route path="/portaria-e-vigilancia" element={<EmConstrucao />} />
        <Route path="/app" element={<AppDownload />} />
        <Route path="/plataforma" element={<PlataformaRedirect />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/carregando" element={<Carregando />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </SiteLoader>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
