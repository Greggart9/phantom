import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from '../ui/CollectionCard';
import { api } from '../../services/api';

export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
}

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  {
    id: 'outerwear',
    title: 'Outerwear',
    subtitle: 'COATS, SHELLS & LINERS',
    imageUrl:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    href: '/shop?category=outerwear'
  },
  {
    id: 'knitwear',
    title: 'Knitwear',
    subtitle: 'WOOL, MERINO & CASHMERE',
    imageUrl:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    href: '/shop?category=knitwear'
  },
  {
    id: 'leather',
    title: 'Leather',
    subtitle: 'BAGS & SMALL GOODS',
    imageUrl:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    href: '/shop?category=leather'
  },
  {
    id: 'objects',
    title: 'Objects',
    subtitle: 'FOR THE TABLE & HOME',
    imageUrl:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    href: '/shop?category=objects'
  }
];

interface CollectionSectionProps {
  collections?: CollectionItem[];
  className?: string;
}

export default function CollectionSection({
  collections: initialCollections,
  className = ''
}: CollectionSectionProps) {
  const [items, setItems] = useState<CollectionItem[]>(
    initialCollections || DEFAULT_COLLECTIONS
  );

  useEffect(() => {
    if (initialCollections) return;

    let isMounted = true;
    api
      .get('/collections')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.collections;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: CollectionItem[] = fetched.slice(0, 4).map((c: any, idx: number) => {
            const fallback = DEFAULT_COLLECTIONS[idx % DEFAULT_COLLECTIONS.length];
            return {
              id: c.id,
              title: c.name,
              subtitle: c.description ? c.description.slice(0, 30).toUpperCase() : fallback.subtitle,
              imageUrl: c.coverImage || fallback.imageUrl,
              href: `/shop?category=${c.slug}`
            };
          });
          setItems(mapped);
        }
      })
      .catch(() => {
        // Fallback to defaults
      });

    return () => {
      isMounted = false;
    };
  }, [initialCollections]);
  return (
    <section className={`w-full bg-[#121110] py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-12 ${className}`}>
      <div className="max-w-[1320px] mx-auto">
        {/* Section Header matching design reference */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
              FOUR CATEGORIES, NOTHING ELSE
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-semibold tracking-tight text-white leading-[1.12]">
              A wardrobe that<br className="hidden sm:inline" /> fits in one cupboard
            </h2>
          </div>

          <div className="md:pb-1">
            <Link
              to="/collections"
              className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase underline underline-offset-4 text-neutral-300 hover:text-[#cf5230] transition-colors duration-300"
            >
              ALL COLLECTIONS
            </Link>
          </div>
        </motion.div>

        {/* 4-Column Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <CollectionCard
                title={item.title}
                subtitle={item.subtitle}
                imageUrl={item.imageUrl}
                href={item.href}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
