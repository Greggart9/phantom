import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  itemCount?: number;
}

// Curated 4 Core Collections as robust fallback
const DEFAULT_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    description:
      'Weatherproof layers cut from mills we have worked with for a decade. Built to be worn for years, not seasons.',
    coverImage:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 'col-knitwear',
    name: 'Knitwear',
    slug: 'knitwear',
    description:
      'Gauge-tested knits in undyed and slow-dyed yarns. Softer with every wash, never thinner.',
    coverImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 'col-leather',
    name: 'Leather',
    slug: 'leather',
    description:
      'Full-grain bags, briefcases and small goods that soften, patinate, and outlast trends.',
    coverImage:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 'col-objects',
    name: 'Objects',
    slug: 'objects',
    description:
      'Hand-thrown ceramics, lathed trays, and sculptural artifacts for the table and home.',
    coverImage:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1400&q=85'
  }
];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>(DEFAULT_COLLECTIONS);
  const [visibleCount, setVisibleCount] = useState(6); // Maximum 6 before showing Load More

  // Fetch live collections from database API with fallback
  useEffect(() => {
    let isMounted = true;

    api
      .get('/collections')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.collections;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: CollectionItem[] = fetched.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description:
              item.description ||
              DEFAULT_COLLECTIONS.find((c) => c.slug === item.slug)?.description ||
              'A small, considered series made with patient craftsmanship and singular materials.',
            coverImage:
              item.coverImage ||
              DEFAULT_COLLECTIONS.find((c) => c.slug === item.slug)?.coverImage ||
              'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=85',
            itemCount: item._count?.products || 3
          }));
          setCollections(mapped);
        }
      })
      .catch(() => {
        // Retain curated collections fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedCollections = collections.slice(0, visibleCount);
  const hasMore = collections.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      {/* 1. Header Section matching reference screenshot */}
      <section className="pt-16 sm:pt-24 lg:pt-28 pb-16 sm:pb-24 px-6 sm:px-10 lg:px-12 select-none">
        <div className="max-w-[1320px] mx-auto">
          {/* Eyebrow & Title and Narrative Copy */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12"
          >
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#cf5230]">
                COLLECTIONS
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1]">
                {collections.length === 4 ? 'Four ways in' : `${collections.length} ways in`}
              </h1>
            </div>

            <p className="text-sm sm:text-[18px] text-neutral-400 font-semibold leading-relaxed max-w-sm lg:pb-1">
              We keep the range small on purpose. Each collection holds three pieces that are
              made to sit beside each other for years.
            </p>
          </motion.div>

          {/* Border line respecting 1320px max-width */}
          <div className="border-b border-white/10 mb-16 sm:mb-24" />

          {/* 2. 2x2 Grid for Collections with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 lg:gap-14">
            {displayedCollections.map((col, idx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  delay: (idx % 2) * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Link
                  to={`/shop?category=${col.slug}`}
                  className="group block cursor-pointer select-none"
                >
                  {/* Image Container with hover zoom on ANY part of card */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={col.coverImage}
                      alt={col.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                  </div>

                  {/* Content underneath image: Title, Description, and Animated CTA */}
                  <div className="pt-6 sm:pt-7">
                    <h2 className="text-2xl sm:text-3xl lg:text-[44px] font-bold text-white tracking-tight leading-tight">
                      {col.name}
                    </h2>

                    <p className="text-sm sm:text-base text-neutral-400 font-medium leading-relaxed mt-2.5 mb-4 sm:mb-5 max-w-xl">
                      {col.description}
                    </p>

                    {/* SHOP THE COLLECTION CTA */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-neutral-300 transition-colors duration-300 group-hover:text-[#cf5230]">
                      <span>SHOP THE COLLECTION</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-inherit" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 3. Load More Button: Only appears if total collections exceed 6 */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center mt-16 sm:mt-20 pt-8 border-t border-white/10">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-10 py-4 border border-neutral-700 hover:border-white text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/5 active:scale-95 cursor-pointer shadow-lg"
              >
                LOAD MORE COLLECTIONS ({collections.length - visibleCount} REMAINING)
              </button>
              <p className="text-[11px] text-neutral-400 font-normal mt-3">
                Showing {displayedCollections.length} of {collections.length} collections
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
