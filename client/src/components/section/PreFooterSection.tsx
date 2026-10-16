import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface PreFooterSectionProps {
  className?: string;
}

export default function PreFooterSection({ className = '' }: PreFooterSectionProps) {
  return (
    <section
      aria-label="Atelier Manifesto"
      className={`w-full bg-[#f6f5f0] text-neutral-900 py-24 sm:py-32 lg:py-36 px-6 sm:px-10 lg:px-16 select-none ${className}`}
    >
      <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center">
        {/* Overline Badge */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] sm:text-[12px] font-bold text-[#cf5230] tracking-[0.24em] uppercase mb-5 sm:mb-6"
        >
          WINTER EDITIONS — SHIPPING NOW
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl font-bold text-neutral-950 tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6 sm:mb-7"
        >
          Buy less. Choose carefully.
          <br className="hidden sm:inline" /> Keep it a long time.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base lg:text-[17px] text-neutral-600 font-normal leading-[1.7] max-w-lg mx-auto mb-9 sm:mb-11"
        >
          Every piece carries a two-year repair promise
          <br className="hidden sm:inline" /> and a full record of where it was made.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
        >
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#141414] hover:bg-orange-600 text-white text-xs sm:text-[13px] font-bold tracking-[0.18em] uppercase transition-all duration-200 active:scale-95 shadow-sm"
          >
            <span>SHOP EVERYTHING</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-transparent hover:bg-black hover:text-white text-neutral-900 border border-neutral-300/90 hover:border-neutral-900 text-xs sm:text-[13px] font-semibold tracking-[0.18em] uppercase transition-all duration-200 active:scale-95"
          >
            TALK TO US
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
