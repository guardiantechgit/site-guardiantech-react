import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PageTitleProps {
  title: string;
  backgroundImage: string;
  scrollTo?: string;
}

const PageTitle = ({ title, backgroundImage, scrollTo = "#down-section" }: PageTitleProps) => (
  <section
    className="relative min-h-[60vh] md:min-h-[50vh] flex items-center justify-center bg-cover bg-center"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <div className="absolute inset-0 bg-dark-slate-blue/70" />
    <div className="container mx-auto px-4 relative z-10 text-center py-32">
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-white text-4xl md:text-5xl lg:text-6xl font-medium font-alt"
      >
        {title}
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8"
      >
        <a href={scrollTo} className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-2xl hover:bg-white/10 transition">
          <ChevronDown size={30} />
        </a>
      </motion.div>
    </div>
  </section>
);

export default PageTitle;
