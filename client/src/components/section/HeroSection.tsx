import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKGROUND_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2400&q=85'
];

// Staggered entrance variants for child layers on page load
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2
    }
  }
};

const layerVariants = {
  hidden: {
    opacity: 0,
    y: 18
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export default function HeroSection({
  backgroundImages = BACKGROUND_IMAGES,
  intervalMs = 5000
}: {
  backgroundImages?: string[];
  intervalMs?: number;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background image rotation every 5 seconds (Only background changes, text remains static)
  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [backgroundImages.length, intervalMs]);

  const currentImage = backgroundImages[currentImageIndex];

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] min-h-[540px] sm:min-h-[640px] max-h-[1050px] overflow-hidden bg-neutral-950 flex items-center justify-center select-none">
      {/* 1. Background Carousel with Smooth 5s Ken Burns Zoom & Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            <motion.img
              src={currentImage}
              alt="Phantom Winter Edition"
              className="w-full h-full object-cover object-center will-change-transform"
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.1 }}
              transition={{
                duration: intervalMs / 1000 + 0.8,
                ease: [0.25, 0.1, 0.25, 1.0]
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic atmospheric overlays for visual depth and crisp typography */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* 2. Permanent Hero Content with Layer-by-layer Staggered Entrance on Page Load */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center text-white flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Layer 1: Subtle line & Eyebrow text matching screenshot */}
        <motion.div variants={layerVariants} className="mb-4 sm:mb-6 flex flex-col items-center">
          <div className="w-12 h-[1px] bg-white/40 mb-3 sm:mb-4" />
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-neutral-300 drop-shadow-sm">
            WINTER EDITIONS — VOLUME 09
          </p>
        </motion.div>

        {/* Layer 2: Main Permanent Headline */}
        <motion.div variants={layerVariants} className="mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold tracking-tight text-white leading-[1.05] drop-shadow-md">
            MADE TO BE KEPT
          </h1>
        </motion.div>

        {/* Layer 3: Subtitle Description */}
        <motion.div variants={layerVariants} className="max-w-2xl mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 font-normal leading-relaxed drop-shadow">
            Coats, knitwear and leather made in runs of a few hundred, from mills we have
            worked with for a decade.
          </p>
        </motion.div>

        {/* Layer 4: Action Buttons */}
        <motion.div
          variants={layerVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <Link
            to="/shop?collection=winter-editions"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#f5f4ef] text-neutral-950 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-orange-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group shadow-lg"
          >
            <span>SHOP THE WINTER EDITION</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Secondary CTA */}
          <Link
            to="/journal"
            className="w-full sm:w-auto px-7 py-3.5 border border-white/30 backdrop-blur-sm text-white text-xs font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-white hover:text-black shadow-md" 
          >
            READ THE JOURNAL
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
