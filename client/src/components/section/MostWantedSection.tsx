import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import type { ProductItem } from '../../context/StoreContext';
import { api } from '../../services/api';

interface MostWantedSectionProps {
  products?: ProductItem[];
  className?: string;
}

export default function MostWantedSection({
  products: initialProducts,
  className = ''
}: MostWantedSectionProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  // Live mechanism: fetch top 3 best-selling products from the database if no custom prop passed
  useEffect(() => {
    if (initialProducts) return;

    let isMounted = true;
    setLoading(true);

    api
      .get('/products?sort=bestsellers&limit=3')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.products;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: ProductItem[] = fetched.map((item: any) => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            price: Number(item.price),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
            category: item.category?.name?.toUpperCase() || 'OUTERWEAR',
            badge: item.badge || (item.stockQuantity > 0 && item.stockQuantity < 10 ? 'LIMITED' : 'BESTSELLER'),
            stockQuantity: item.stockQuantity,
            isSoldOut: item.stockQuantity <= 0 || item.badge === 'SOLD OUT',
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : []
          }));
          setProducts(mapped);
        }
      })
      .catch((err) => {
        console.error('Failed to load most wanted products:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
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
            <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-bold tracking-tight text-white leading-[1.12]">
              Collector editions
            </h2>
          </div>

          <div className="sm:pb-1">
            <Link
              to="/shop"
              className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase underline underline-offset-4 text-neutral-300 hover:text-[#cf5230] transition-colors duration-300"
            >
              EXPLORE ARCHIVE
            </Link>
          </div>
        </motion.div>

        {/* 3-Column Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-[#161514] rounded-sm" />
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-1/3 bg-neutral-800/60 rounded" />
                  <div className="h-4 w-4/5 bg-neutral-800/80 rounded" />
                  <div className="h-4 w-1/4 bg-neutral-800/60 rounded" />
                </div>
              </div>
            ))
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
