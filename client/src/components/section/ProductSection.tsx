import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import type { ProductItem } from '../../context/StoreContext';
import { api } from '../../services/api';

const DEFAULT_SEASON_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Halden Wool Overcoat',
    slug: 'halden-wool-overcoat',
    price: 680,
    category: 'OUTERWEAR',
    badge: 'BESTSELLER',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-2',
    name: 'Hamo Cropped Trench',
    slug: 'hamo-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    badge: 'NEW',
    isSoldOut: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-3',
    name: 'Quilted Liner Jacket',
    slug: 'quilted-liner-jacket',
    price: 390,
    category: 'OUTERWEAR',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-4',
    name: 'Merino Chunky Knit',
    slug: 'merino-chunky-knit',
    price: 340,
    category: 'KNITWEAR',
    badge: 'BESTSELLER',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'
    ]
  }
];

interface ProductSectionProps {
  products?: ProductItem[];
  className?: string;
}

export default function ProductSection({
  products: initialProducts,
  className = ''
}: ProductSectionProps) {
  const [items, setItems] = useState<ProductItem[]>(
    initialProducts || DEFAULT_SEASON_PRODUCTS
  );

  useEffect(() => {
    if (initialProducts) return;

    let isMounted = true;
    api
      .get('/products?limit=4')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.products;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped: ProductItem[] = fetched.map((item: any, idx: number) => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            price: Number(item.price),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
            category: item.category?.name?.toUpperCase() || 'OUTERWEAR',
            badge: item.badge || (item.stockQuantity > 0 && item.stockQuantity < 10 ? 'LIMITED' : undefined),
            stockQuantity: item.stockQuantity,
            isSoldOut: item.stockQuantity <= 0 || item.badge === 'SOLD OUT',
            images:
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : DEFAULT_SEASON_PRODUCTS[idx % DEFAULT_SEASON_PRODUCTS.length].images
          }));
          setItems(mapped);
        }
      })
      .catch(() => {
        // Fallback to default season pieces
      });

    return () => {
      isMounted = false;
    };
  }, [initialProducts]);
  return (
    <section className={`w-full bg-[#121110] py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-12 ${className}`}>
      <div className="max-w-[1320px] mx-auto">
        {/* Section Header matching screenshot reference */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
              JUST LANDED
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-bold tracking-tight text-white leading-[1.12]">
              New this season
            </h2>
          </div>

          <div className="sm:pb-1">
            <Link
              to="/shop"
              className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase underline underline-offset-4 text-neutral-300 hover:text-[#cf5230] transition-colors duration-300"
            >
              ALL PRODUCTS
            </Link>
          </div>
        </motion.div>

        {/* Product Cards Grid: 4 columns on large screens with staggered entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {items.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
