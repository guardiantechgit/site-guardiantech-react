import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(/images/404-bg.jpg)" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.3 }}
            className="flex flex-col items-center"
          >
            <motion.h6
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="text-dark-gray font-semibold mb-1 uppercase tracking-wide text-sm"
            >
              Ops!
            </motion.h6>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[170px] sm:text-[200px] font-alt font-bold text-dark-gray leading-none -tracking-[8px]"
            >
              404
            </motion.h1>
            <motion.h4
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-dark-gray font-alt font-semibold text-lg sm:text-[22px] mb-2 -tracking-[1px]"
            >
              Esta página não foi encontrada!
            </motion.h4>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-dark-gray mb-8 leading-7 w-[55%] md:w-[80%] sm:w-[95%] mx-auto mt-5"
            >
              A página foi removida ou algo está errado no endereço requisitado.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-dark-gray text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition text-sm"
            >
              <ArrowLeft size={16} />
              Voltar à página anterior
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
