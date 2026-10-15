import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { api } from '../../services/api';

export interface TestimonialItem {
  id: string;
  rating: number; // 1 to 5
  content: string;
  authorName: string;
  authorLocation: string; // e.g. "COPENHAGEN", "TORONTO", "MILAN"
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    rating: 4,
    content:
      'Three winters in the Halden and it has not pilled, sagged or asked for anything except a brush. I have stopped looking at coats.',
    authorName: 'Marguerite Vaillant',
    authorLocation: 'COPENHAGEN'
  },
  {
    id: 'test-2',
    rating: 5,
    content:
      'I bought the card holder to test the leather before committing to the tote. Six weeks later it looked like something I had owned for years. The tote arrived in March.',
    authorName: 'Daniel Okonjo',
    authorLocation: 'TORONTO'
  },
  {
    id: 'test-3',
    rating: 5,
    content:
      'Customer service replaced a corozo button by post, for free, eleven months after purchase. No form, no argument. That is the whole review.',
    authorName: 'Sofia Marchetti',
    authorLocation: 'MILAN'
  }
];

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
  className?: string;
}

export default function TestimonialsSection({
  testimonials: initialTestimonials,
  className = ''
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    initialTestimonials || DEFAULT_TESTIMONIALS
  );

  // Live Query: fetch top 3 most recent customer testimonials from PostgreSQL
  useEffect(() => {
    if (initialTestimonials) return;

    let isMounted = true;
    api
      .get('/reviews/recent?limit=3')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.data?.reviews;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: TestimonialItem[] = fetched.map((r: any, idx: number) => ({
            id: r.id,
            rating: r.rating || 5,
            content: r.content,
            authorName: r.user?.fullName || DEFAULT_TESTIMONIALS[idx % DEFAULT_TESTIMONIALS.length].authorName,
            authorLocation: (r.user?.country || DEFAULT_TESTIMONIALS[idx % DEFAULT_TESTIMONIALS.length].authorLocation).toUpperCase()
          }));
          setTestimonials(mapped);
        }
      })
      .catch(() => {
        // Fallback to high-fidelity defaults
      });

    return () => {
      isMounted = false;
    };
  }, [initialTestimonials]);

  return (
    <section className={`w-full bg-[#121110] pt-0 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-12 select-none ${className}`}>
      <div className="max-w-[1320px] mx-auto border-t border-white/10 pt-14 sm:pt-20">
        {/* Header matching screenshot reference */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 sm:space-y-4"
        >
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
            4.9 AVERAGE FROM 1,240 REVIEWS
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            What people say after a year
          </h2>
        </motion.div>

        {/* 3-Column Testimonial Cards Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16">
          {testimonials.slice(0, 3).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="border border-neutral-800/80 bg-[#151518]/80 p-8 sm:p-9 flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:border-neutral-700"
            >
              {/* Star Rating Header */}
              <div>
                <div className="flex items-center gap-1.5" aria-label={`${item.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFilled = starIndex <= item.rating;
                    return (
                      <Star
                        key={starIndex}
                        className={`w-3.5 h-3.5 ${
                          isFilled
                            ? 'fill-[#cf5230] text-[#cf5230]'
                            : 'text-neutral-700 fill-neutral-800'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm sm:text-[17px] text-neutral-300 font-medium leading-relaxed my-6 sm:my-8">
                  {item.content}
                </p>
              </div>

              {/* Author & Profile-derived Country */}
              <div className="border-t border-neutral-900/80 pt-4">
                <p className="text-sm font-semibold text-white tracking-tight">
                  {item.authorName}
                </p>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-neutral-400 uppercase mt-0.5">
                  {item.authorLocation}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
