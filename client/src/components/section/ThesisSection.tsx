import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useInView, animate } from 'framer-motion';

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  formatCommas?: boolean;
}

function Counter({
  from = 1,
  to,
  duration = 1.4,
  suffix = '',
  formatCommas = false
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Smooth and snappy ease-out curve
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      }
    });

    return () => controls.stop();
  }, [isInView, from, to, duration]);

  const formatted = formatCommas
    ? displayValue.toLocaleString()
    : displayValue.toString();

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}

export default function ThesisSection() {
  return (
    <section className="w-full bg-[#232120] py-20 sm:py-28 px-6 sm:px-10 lg:px-12 border-t border-neutral-900 select-none">
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Sunlit Cutting Table & Clothing Rack Photo */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative w-full max-w-[616px] lg:w-[616px] lg:h-[620px] aspect-[616/620] overflow-hidden bg-neutral-900 shadow-2xl">
              <img
                src="https://res.cloudinary.com/degearesj/image/upload/v1792109273/asset5_wcrog3.jpg"
                alt="Phantom Cutting Table and Clothes Rack"
                width={616}
                height={620}
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Column: Narrative Copy & Counting Stats */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-8 sm:space-y-10 lg:pl-4"
          >
            {/* Eyebrow & Headline */}
            <div className="space-y-4">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#cf5230]">
                HOW WE MAKE THINGS
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-white leading-[1.12]">
                Four mills. Eleven people.
                <br />
                One run at a time.
              </h2>
            </div>

            {/* Narrative Paragraph */}
            <p className="text-sm sm:text-[18px] text-neutral-300/70 font-medium leading-relaxed max-w-xl">
              We do not chase seasons. A piece enters the range when the cloth is right and
              the maker has capacity, and it stays until the cloth changes. That is why the
              Halden has looked the same for nine years, and why we can still repair one bought
              in 2018.
            </p>

            {/* Live Animated Metrics / Stats Row */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-6 pt-2 pb-2">
              {/* Stat 1: 9 yrs */}
              <div className="pt-4 space-y-1.5 sm:space-y-2">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  <Counter from={1} to={9} duration={1.2} suffix=" yrs" />
                </div>
                <p className="text-[10px] sm:text-[14px] text-neutral-400 font-medium leading-tight sm:leading-snug">
                  Longest-running piece still in production
                </p>
              </div>

              {/* Stat 2: 100% */}
              <div className="pt-4 space-y-1.5 sm:space-y-2">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  <Counter from={1} to={100} duration={1.0} suffix="%" />
                </div>
                <p className="text-[10px] sm:text-[14px] text-neutral-400 font-medium leading-tight sm:leading-snug">
                  Suppliers named on every product page
                </p>
              </div>

              {/* Stat 3: 2,400 */}
              <div className="pt-4 space-y-1.5 sm:space-y-2">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  <Counter from={100} to={2400} duration={1.5} formatCommas={true} />
                </div>
                <p className="text-[10px] sm:text-[14px] text-neutral-400 font-medium leading-tight sm:leading-snug">
                  Repairs completed since 2019
                </p>
              </div>
            </div>

            {/* CTA Button leading to the About Page */}
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <span>READ OUR MATERIALS POLICY</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
