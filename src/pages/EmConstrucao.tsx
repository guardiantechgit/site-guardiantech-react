import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EmConstrucao = () => (
  <main
    className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
    style={{ backgroundImage: "url(/images/background-construcao.jpg)" }}
  >
    <div className="absolute inset-0 bg-black/60" />
    <div className="relative z-10 text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/images/logo-white.png" alt="GuardianTech" className="h-8 mx-auto mb-8" />
        <h1 className="text-white text-3xl md:text-5xl font-alt font-semibold mb-4">Página em construção</h1>
        <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
          Estamos trabalhando para trazer essa página para você em breve!
        </p>
        <Link
          to="/"
          className="inline-block bg-base-color text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition"
        >
          Voltar ao início
        </Link>
      </motion.div>
    </div>
  </main>
);

export default EmConstrucao;
