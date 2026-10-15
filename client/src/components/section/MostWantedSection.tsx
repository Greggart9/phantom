import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../ui/ProductCard';
import type { ProductItem } from '../../context/StoreContext';
import { api } from '../../services/api';

const DEFAULT_MOST_WANTED: ProductItem[] = [
  {
    id: 'most-wanted-1',
    name: 'Halden Wool Overcoat',
    slug: 'halden-wool-overcoat',
    price: 680,
    category: 'OUTERWEAR',
    badge: 'BESTSELLER',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  {
    id: 'most-wanted-2',
    name: 'Marne Cropped Trench',
    slug: 'marne-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    badge: 'NEW',
    isSoldOut: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  {
    id: 'most-wanted-3',
    name: 'Sundby Cashmere Crew',
    slug: 'sundby-cashmere-crew',
    price: 285,
    category: 'KNITWEAR',
    badge: 'BESTSELLER',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85'
    ]
  }
];

interface MostWantedSectionProps {
  products?: ProductItem[];
  className?: string;
}

export default function MostWantedSection({
  products: initialProducts,
  className = ''
}: MostWantedSectionProps) {
  const [products, setProducts] = useState<ProductItem[]>(
    initialProducts || DEFAULT_MOST_WANTED
  );

  // Live mechanism: fetch top 3 best-selling products from the database if no custom prop passed
  useEffect(() => {
    if (initialProducts) return;

    let isMounted = true;
    api
      .get('/products?sort=bestsellers&limit=3')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.products;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: ProductItem[] = fetched.map((item: any, index: number) => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            price: Number(item.price),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
            category: item.category?.name?.toUpperCase() || 'OUTERWEAR',
            badge: item.badge || (item.stockQuantity > 0 && item.stockQuantity < 10 ? 'LIMITED' : 'BESTSELLER'),
            stockQuantity: item.stockQuantity,
            isSoldOut: item.stockQuantity <= 0 || item.badge === 'SOLD OUT',
            images:
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : DEFAULT_MOST_WANTED[index % DEFAULT_MOST_WANTED.length].images
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        // Fallback to high-fidelity design defaults if server is unavailable
      });

    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

  return (
    <section className={`w-full bg-[#121110] py-20 sm:py-28 px-6 sm:px-10 lg:px-12 select-none border-t border-neutral-900 ${className}`}>
      <div className="max-w-[1320px] mx-auto">
        {/* Section Header matching screenshot reference */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
              MOST WANTED
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.12]">
              The ones people come back for
            </h2>
          </div>

          <div className="sm:pb-1">
            <Link
              to="/shop"
              className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase underline underline-offset-4 text-neutral-300 hover:text-[#cf5230] transition-colors duration-300"
            >
              SHOP ALL
            </Link>
          </div>
        </motion.div>

        {/* 3-Column Grid for Top 3 Most Bought Products (421 x 540 card size) with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 justify-items-center">
          {products.slice(0, 3).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="w-full max-w-[421px]"
            >
              <ProductCard
                product={product}
                imageClassName="w-full max-w-[421px] lg:w-[421px] h-[480px] sm:h-[500px] lg:h-[540px] aspect-[421/540]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
