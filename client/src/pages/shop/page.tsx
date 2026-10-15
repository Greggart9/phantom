import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import type { ProductItem } from '../../context/StoreContext';
import { api } from '../../services/api';

// 16 Curated Phantom Pieces as robust fallback/initial dataset
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

const CURATED_SHOP_PRODUCTS: (ProductItem & { salesCount?: number; collections?: any[] })[] = [
  // --- TOP 4 BESTSELLERS (Row 1) ---
  {
    id: 'prod-1',
    name: 'Halden Wool Overcoat',
    slug: 'halden-wool-overcoat',
    price: 680,
    category: 'OUTERWEAR',
    salesCount: 15,
    createdAt: daysAgo(45),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-2',
    name: 'Merino Chunky Knit',
    slug: 'merino-chunky-knit',
    price: 340,
    category: 'KNITWEAR',
    salesCount: 12,
    createdAt: daysAgo(30),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-3',
    name: 'Phantom Tote, Saddle',
    slug: 'phantom-tote-saddle',
    price: 480,
    category: 'LEATHER',
    salesCount: 10,
    createdAt: daysAgo(60),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85'
    ],
    collections: [{ id: 'col-raw-terre', name: 'Raw Terre & Hide', slug: 'raw-terre-and-hide' }]
  },
  {
    id: 'prod-4',
    name: 'Kaolin Vase, Tall',
    slug: 'kaolin-vase-tall',
    price: 140,
    category: 'OBJECTS',
    salesCount: 9,
    createdAt: daysAgo(40),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85'
    ],
    collections: [{ id: 'col-obsidian', name: 'Obsidian Nocturne', slug: 'obsidian-nocturne' }]
  },

  // --- RECENT PIECES (created within last 7 days -> NEW tag) ---
  {
    id: 'prod-5',
    name: 'Hamo Cropped Trench',
    slug: 'hamo-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    salesCount: 2,
    createdAt: daysAgo(2), // 2 days old -> NEW
    isSoldOut: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-6',
    name: 'Marne Cropped Trench',
    slug: 'marne-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    salesCount: 1,
    createdAt: daysAgo(3), // 3 days old -> NEW
    isSoldOut: true,
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-7',
    name: 'Sundby Cashmere Crew',
    slug: 'sundby-cashmere-crew',
    price: 285,
    category: 'KNITWEAR',
    salesCount: 3,
    createdAt: daysAgo(1), // 1 day old -> NEW
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-8',
    name: 'Bridle Leather Belt',
    slug: 'bridle-leather-belt',
    price: 145,
    category: 'LEATHER',
    salesCount: 2,
    createdAt: daysAgo(4), // 4 days old -> NEW
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85'
    ]
  },

  // --- REMAINING PIECES (created > 7 days ago -> no NEW tag) ---
  {
    id: 'prod-9',
    name: 'Quilted Liner Jacket',
    slug: 'quilted-liner-jacket',
    price: 390,
    category: 'OUTERWEAR',
    salesCount: 4,
    createdAt: daysAgo(20),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-10',
    name: 'Soren Wool Peacoat',
    slug: 'soren-wool-peacoat',
    price: 640,
    category: 'OUTERWEAR',
    salesCount: 5,
    createdAt: daysAgo(25),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-11',
    name: 'Alpaca Rib Cardigan',
    slug: 'alpaca-rib-cardigan',
    price: 395,
    category: 'KNITWEAR',
    salesCount: 3,
    createdAt: daysAgo(18),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-12',
    name: 'Fine Gauge Mock Neck',
    slug: 'fine-gauge-mock-neck',
    price: 260,
    category: 'KNITWEAR',
    salesCount: 2,
    createdAt: daysAgo(22),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85'
    ]
  },

  // --- ROW 4 / LOAD MORE PIECES ---
  {
    id: 'prod-13',
    name: 'Folded Card Holder',
    slug: 'folded-card-holder',
    price: 120,
    category: 'LEATHER',
    salesCount: 5,
    createdAt: daysAgo(15),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-14',
    name: 'Turned Corozo Tray',
    slug: 'turned-corozo-tray',
    price: 95,
    category: 'OBJECTS',
    salesCount: 1,
    createdAt: daysAgo(19),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-15',
    name: 'Field Canvas Parka',
    slug: 'field-canvas-parka',
    price: 560,
    category: 'OUTERWEAR',
    salesCount: 2,
    createdAt: daysAgo(28),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85'
    ]
  },
  {
    id: 'prod-16',
    name: 'Smoked Stoneware Bowl',
    slug: 'smoked-stoneware-bowl',
    price: 85,
    category: 'OBJECTS',
    salesCount: 1,
    createdAt: daysAgo(35),
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85'
    ]
  }
];

const DEFAULT_CATEGORIES = [
  { label: 'ALL PIECES', value: 'all' },
  { label: 'OUTERWEAR', value: 'outerwear' },
  { label: 'KNITWEAR', value: 'knitwear' },
  { label: 'LEATHER', value: 'leather' },
  { label: 'OBJECTS', value: 'objects' },
  { label: 'OBSIDIAN NOCTURNE', value: 'obsidian-nocturne' },
  { label: 'RAW TERRE & HIDE', value: 'raw-terre-and-hide' }
];

// Helper: Check if product was created in the last 7 days
function isWithinLast7Days(dateStr?: string | Date): boolean {
  if (!dateStr) return false;
  const createdTime = new Date(dateStr).getTime();
  const diffDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category')?.toLowerCase() || 'all';
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawProducts, setRawProducts] = useState<any[]>(CURATED_SHOP_PRODUCTS);
  const [visibleCount, setVisibleCount] = useState(12); // Initial 4 by 3 grid (12 products)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch dynamic categories AND collections from the database API
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      api.get('/categories'),
      api.get('/collections')
    ]).then(([catRes, colRes]) => {
      if (!isMounted) return;

      const dynamicList: { label: string; value: string }[] = [];
      const seenValues = new Set<string>();

      // 1. Ingest Categories
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data?.categories)) {
        catRes.value.data.categories.forEach((c: any) => {
          const val = (c.slug || c.name).toLowerCase();
          if (!seenValues.has(val)) {
            seenValues.add(val);
            dynamicList.push({
              label: c.name.toUpperCase(),
              value: val
            });
          }
        });
      }

      // 2. Ingest Collections (automatically shows Obsidian Nocturne, Raw Terre & Hide, and any user-created collection)
      if (colRes.status === 'fulfilled' && Array.isArray(colRes.value.data?.collections)) {
        colRes.value.data.collections.forEach((col: any) => {
          const val = (col.slug || col.name).toLowerCase();
          if (!seenValues.has(val)) {
            seenValues.add(val);
            dynamicList.push({
              label: col.name.toUpperCase(),
              value: val
            });
          }
        });
      }

      if (dynamicList.length > 0) {
        setCategories([{ label: 'ALL PIECES', value: 'all' }, ...dynamicList]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state with URL category parameter
  useEffect(() => {
    const cat = searchParams.get('category')?.toLowerCase();
    if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);

  // Fetch live products from backend API (with graceful fallback to curated items)
  useEffect(() => {
    let isMounted = true;

    api
      .get('/products?limit=50')
      .then((res: any) => {
        if (!isMounted) return;
        const fetched = res.data?.products;
        if (Array.isArray(fetched) && fetched.length > 0) {
          const mapped = fetched.map((item: any) => {
            const isSoldOut =
              item.stockQuantity <= 0 ||
              item.badge === 'SOLD OUT' ||
              Boolean(item.isSoldOut);

            let effectiveBadge = item.badge;
            if (!effectiveBadge && item.stockQuantity > 0 && item.stockQuantity < 10) {
              effectiveBadge = 'LIMITED';
            } else if (!effectiveBadge && isWithinLast7Days(item.createdAt) && !isSoldOut) {
              effectiveBadge = 'NEW';
            }

            return {
              id: item.id,
              name: item.title,
              slug: item.slug,
              price: Number(item.price),
              originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
              category: item.category?.name?.toUpperCase() || 'OUTERWEAR',
              categorySlug: (item.category?.slug || item.category?.name || '').toLowerCase(),
              badge: effectiveBadge,
              stockQuantity: item.stockQuantity,
              isSoldOut,
              images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [],
              createdAt: item.createdAt,
              description: item.description,
              collections: item.collections || []
            };
          });
          setRawProducts(mapped);
        }
      })
      .catch(() => {
        // Retain curated list fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for instant product deletions across the storefront
  useEffect(() => {
    const handleProductDeleted = (e: any) => {
      const deletedId = e.detail?.id;
      if (deletedId) {
        setRawProducts((prev) => prev.filter((p) => p.id !== deletedId && p.slug !== deletedId));
      }
    };
    window.addEventListener('phantom:product-deleted', handleProductDeleted);
    return () => {
      window.removeEventListener('phantom:product-deleted', handleProductDeleted);
    };
  }, []);

  // Update Category Selection
  const handleCategoryChange = (val: string) => {
    setActiveCategory(val);
    setVisibleCount(12);
    if (val === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', val);
    }
    setSearchParams(searchParams);
  };

  // Filter and process products dynamically
  const processedProducts = useMemo(() => {
    let filtered = rawProducts;

    // A. Filter by Category or Collection
    if (activeCategory !== 'all') {
      const target = activeCategory.toLowerCase();
      filtered = filtered.filter((p) => {
        const catSlug = (p.categorySlug || p.category?.slug || p.category?.name || p.category || '').toLowerCase();
        const matchesCategory = catSlug === target;

        const matchesCollection = Array.isArray(p.collections) && p.collections.some(
          (c: any) => {
            const cSlug = (typeof c === 'string' ? c : c.slug || c.name || '').toLowerCase();
            return cSlug === target;
          }
        );

        return matchesCategory || matchesCollection;
      });
    }

    // B. Filter by Collection (if specified in URL)
    const activeCollection = searchParams.get('collection');
    if (activeCollection) {
      filtered = filtered.filter((p) => {
        if (!p.collections || !Array.isArray(p.collections)) return false;
        return p.collections.some(
          (c: any) => (c.slug || c.name || '').toLowerCase() === activeCollection.toLowerCase()
        );
      });
    }

    // C. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [rawProducts, activeCategory, searchQuery, searchParams]);

  // Sliced for pagination (initially 12 products for 4 by 3 grid)
  const displayedProducts = processedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < processedProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      {/* 1. Header Section */}
      <section className="pt-16 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 px-6 sm:px-10 lg:px-12">
        <div className="max-w-[1320px] mx-auto">
          {/* Eyebrow & Heading and Narrative Copy */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-16"
          >
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#cf5230]">
                THE FULL RANGE
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1]">
                Everything we make
              </h1>
            </div>

            <p className="text-sm sm:text-[17px] text-neutral-400 font-semibold leading-relaxed max-w-md lg:pb-1">
              Curated garments, timeless silhouettes. Each one crafted with patient tailoring and
              singular materials — built to outlast seasons.
            </p>
          </motion.div>

          {/* 2. Controls Row: Category Filter Pills, Search Bar, and Tag Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 pb-8 sm:pb-10"
          >
            {/* Mobile Controls Bar (< md): Compact Filter Icon Button + Search Bar */}
            <div className="md:hidden flex items-center gap-2.5">
              {/* Filter Icon Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                aria-expanded={isMobileFilterOpen}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-200 cursor-pointer shrink-0 ${
                  isMobileFilterOpen || activeCategory !== 'all'
                    ? 'bg-[#f4f2ee] text-neutral-950 border-[#f4f2ee] shadow-sm'
                    : 'bg-[#151518]/90 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="truncate max-w-[110px]">
                  {activeCategory === 'all'
                    ? 'Filter'
                    : categories.find((c) => c.value === activeCategory)?.label || 'Filter'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMobileFilterOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Search Input on Mobile */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces..."
                  className="w-full bg-[#151518]/90 border border-neutral-800 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Mobile Categories Drawer (< md) */}
            <AnimatePresence>
              {isMobileFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="p-3.5 bg-[#121215] border border-neutral-800 rounded-2xl shadow-2xl space-y-2">
                    <div className="flex items-center justify-between px-1.5 pb-2 border-b border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">
                        Categories & Collections
                      </span>
                      {activeCategory !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleCategoryChange('all');
                            setIsMobileFilterOpen(false);
                          }}
                          className="text-[10px] uppercase tracking-wider text-[#cf5230] font-semibold hover:underline cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {categories.map((cat) => {
                        const isActive = activeCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => {
                              handleCategoryChange(cat.value);
                              setIsMobileFilterOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] tracking-wider uppercase font-medium transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#f4f2ee] text-neutral-950 font-bold shadow-sm'
                                : 'bg-[#18181c] text-neutral-300 hover:bg-[#202026] hover:text-white'
                            }`}
                          >
                            <span className="truncate pr-1">{cat.label}</span>
                            {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-neutral-950" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Controls Bar (>= md): Categories on left, Search on right */}
            <div className="hidden md:flex md:items-center justify-between gap-6">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-4 sm:px-5 py-2.5 rounded-full text-[11px] sm:text-xs tracking-[0.16em] uppercase transition-all duration-200 active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-[#f4f2ee] text-neutral-950 font-bold shadow-md'
                          : 'bg-[#151518]/80 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 font-medium'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Input Pill */}
              <div className="relative w-72 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces..."
                  className="w-full bg-[#151518]/90 border border-neutral-800 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-[13px] text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3. Divider Line Respecting 1320px Max Width */}
          <div className="border-b border-white/10 mb-10 sm:mb-14" />

          {/* 4. Products Grid: 4 by 3 Layout (Top Row = Bestsellers, Remaining = 8 pieces) */}
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              {displayedProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.55,
                    delay: (idx % 4) * 0.08,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-neutral-800/80 rounded-2xl">
              <p className="text-sm text-neutral-400 font-normal">
                No pieces found matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleCategoryChange('all');
                }}
                className="mt-4 px-6 py-2.5 border border-neutral-700 hover:border-white text-xs font-bold tracking-[0.18em] uppercase text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* 5. Load More Button: Opens the rest of the products */}
          {hasMore && (
            <div className="flex flex-col items-center justify-center mt-16 sm:mt-20 pt-8 border-t border-white/10">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-10 py-4 border border-neutral-700 hover:border-white text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/5 active:scale-95 cursor-pointer shadow-lg"
              >
                LOAD MORE PIECES ({processedProducts.length - visibleCount} REMAINING)
              </button>
              <p className="text-[11px] text-neutral-400 font-normal mt-3">
                Showing {displayedProducts.length} of {processedProducts.length} pieces
              </p>
            </div>
          )}

          {/* Showing All Indicator if everything loaded and total > 12 */}
          {!hasMore && processedProducts.length > 12 && (
            <div className="text-center mt-16 sm:mt-20 pt-8 border-t border-white/10">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                ALL {processedProducts.length} PIECES DISPLAYED
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
