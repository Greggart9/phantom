import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import { Truck, RefreshCw, ShieldCheck, Leaf } from 'lucide-react';

export interface ValuePropItem {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
}

const DEFAULT_VALUE_PROPS: ValuePropItem[] = [
  {
    id: 'prop-1',
    title: 'Free delivery over €200',
    description:
      'Carbon-neutral, tracked, and usually with you inside three days.',
    icon: Truck
  },
  {
    id: 'prop-2',
    title: 'Thirty-day returns',
    description:
      'Unworn, tags on, free within the EU and UK. No forms to fill in.',
    icon: RefreshCw
  },
  {
    id: 'prop-3',
    title: 'Two-year free repairs',
    description:
      'Seams, buttons, zips and linings, mended by the people who made them.',
    icon: ShieldCheck
  },
  {
    id: 'prop-4',
    title: 'Traceable materials',
    description:
      'Every mill, tannery and workshop named on the product page.',
    icon: Leaf
  }
];

interface ValuePropsSectionProps {
  props?: ValuePropItem[];
  className?: string;
}

export default function ValuePropsSection({
  props = DEFAULT_VALUE_PROPS,
  className = ''
}: ValuePropsSectionProps) {
  return (
    <section className={`w-full bg-[#121110] pt-14 sm:pt-20 pb-0 px-6 sm:px-10 lg:px-12 select-none ${className}`}>
      <div className="max-w-[1320px] mx-auto border-b border-white/10 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {props.map((item, idx) => {
            const IconComponent = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="flex flex-col justify-end"
              >
                {/* Minimalist icon above each column matching screenshot */}
                <div className="mb-3.5">
                  <IconComponent className="w-5 h-5 text-white/90 stroke-[1.5]" />
                </div>

                <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-400 font-medium leading-relaxed mt-2.5">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
