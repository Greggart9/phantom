import ProductCard from '../ui/ProductCard';
import type { ProductItem } from '../../context/StoreContext';

export const RECOMMENDED_PRODUCTS: ProductItem[] = [
  {
    id: 'rec-brenna-card-holder',
    name: 'Brenna Card Holder',
    slug: 'brenna-card-holder',
    price: 95,
    category: 'LEATHER',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-4',
    name: 'Kaolin Vase, Tall',
    slug: 'kaolin-vase-tall',
    price: 140,
    category: 'OBJECTS',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'rec-terra-serving-bowl',
    name: 'Terra Serving Bowl',
    slug: 'terra-serving-bowl',
    price: 88,
    originalPrice: 110,
    badge: 'SALE',
    category: 'OBJECTS',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'rec-ash-candle-cedar-moss',
    name: 'Ash Candle, Cedar & Moss',
    slug: 'ash-candle-cedar-moss',
    price: 52,
    category: 'OBJECTS',
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=85'
    ]
  }
];

interface RecommendedProductsProps {
  title?: string;
  products?: ProductItem[];
  className?: string;
}

export default function RecommendedProducts({
  title = 'Pairs well with',
  products = RECOMMENDED_PRODUCTS,
  className = ''
}: RecommendedProductsProps) {
  return (
    <section className={`w-full pt-16 sm:pt-24 pb-8 ${className}`}>
      <div className="max-w-[1320px] mx-auto">
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mb-8 sm:mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageClassName="aspect-square"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
