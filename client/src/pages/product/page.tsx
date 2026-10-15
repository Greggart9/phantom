import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  Star,
  Check,
  X,
  SquarePen,
  Trash2,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  ALL_PRODUCTS,
  getProductBySlug,
  getProductStory,
  getProductSpecifications,
  YOU_MAY_ALSO_LIKE_PRODUCTS
} from '../../data/products';
import ProductCard from '../../components/ui/ProductCard';

// Normalization helper to bridge backend database models and storefront UI
function normalizeProduct(p: any) {
  if (!p) return null;
  const categoryName = typeof p.category === 'object' && p.category !== null
    ? (p.category.name || 'OUTERWEAR')
    : (typeof p.category === 'string' && p.category ? p.category : 'OUTERWEAR');

  const defaultImages = [
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85'
  ];

  const defaultColors = [
    { name: 'Camel', hex: '#cbb396' },
    { name: 'Charcoal', hex: '#3e3e3e' },
    { name: 'Slate Blue', hex: '#586776' }
  ];

  const defaultSizes = ['46', '48', '50', '52'];

  return {
    ...p,
    id: p.id,
    name: p.name || p.title || 'Phantom Piece',
    title: p.title || p.name || 'Phantom Piece',
    category: categoryName.toUpperCase(),
    categoryObj: typeof p.category === 'object' ? p.category : null,
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : defaultImages,
    colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : defaultColors,
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : defaultSizes,
    materials: p.materials || '100% natural organic blend. Sourced from certified ethical mills in Biella, Italy.',
    careInstructions: p.careInstructions || p.care || 'Dry clean or spot clean clothes, store folded, never on a hanger.',
    shippingInfo: p.shippingInfo || 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    storyParagraphs: Array.isArray(p.storyParagraphs) && p.storyParagraphs.length > 0 ? p.storyParagraphs : null,
    specifications: p.specifications || null
  };
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isAdmin = Boolean(isAuthenticated && user?.role === 'ADMIN');
  const [isDeleting, setIsDeleting] = useState(false);

  // Find product by slug with dynamic database fallback
  const fallbackProduct = normalizeProduct(slug ? getProductBySlug(slug) : ALL_PRODUCTS[0]);
  const [liveProduct, setLiveProduct] = useState<any>(fallbackProduct || null);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    api.get(`/products/${slug}`)
      .then((res: any) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.product) {
          setLiveProduct(normalizeProduct(res.data.product));
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLiveProduct(fallbackProduct);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const product = liveProduct || fallbackProduct || normalizeProduct(ALL_PRODUCTS[0]);
  const isSoldOut =
    Boolean(product.isSoldOut) ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0) ||
    product.badge === 'SOLD OUT';

  const badgeText =
    product.badge && product.badge !== 'SOLD OUT'
      ? product.badge
      : product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity < 10
      ? 'LIMITED'
      : null;

  // Dynamic story & specification helpers
  const storyParagraphs =
    product.storyParagraphs && product.storyParagraphs.length > 0
      ? product.storyParagraphs
      : getProductStory(product);

  const specEntries =
    product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0
      ? product.specifications.map((s: any) => [s.label || s.key, s.value])
      : getProductSpecifications(product);

  // Component states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>('materials');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveImageIndex(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [slug]);

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85'
  ];

  const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [
    { name: 'Camel', hex: '#cbb396' },
    { name: 'Charcoal', hex: '#3e3e3e' },
    { name: 'Slate Blue', hex: '#586776' }
  ];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['46', '48', '50', '52'];

  const isFavorited = isInWishlist(product.id);

  // Navigation handlers
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  // State checks for selection
  const hasColor = selectedColor !== null;
  const hasSize = selectedSize !== null;
  const isReadyToBuy = hasColor && hasSize;

  // Determine button label when selection is incomplete
  const getDisabledButtonLabel = () => {
    if (!hasColor && !hasSize) return 'SELECT A COLOUR FIRST';
    if (!hasColor && hasSize) return 'SELECT A COLOUR FIRST';
    if (hasColor && !hasSize) return 'SELECT A SIZE FIRST';
    return 'ADD TO BAG';
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#11100f] text-[#f4f2ee] flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-3">
          Phantom Archive
        </p>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-4">
          Piece Not Found
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
          The requested edition does not exist in our catalog or may have been retired to our private archives.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-white text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors"
        >
          BROWSE CURRENT EDITIONS
        </Link>
      </div>
    );
  }

  // Actions
  const handleAddToBag = () => {
    if (!isReadyToBuy) return;

    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to add items to your shopping bag.');
      return;
    }

    addToCart(product, quantity, {
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
  };

  const handleBuyNow = () => {
    if (!isReadyToBuy) return;

    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
      return;
    }

    addToCart(product, quantity, {
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to save items to your wishlist.');
      return;
    }
    toggleWishlist(product);
  };

  const handleDeleteProduct = async () => {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Permanently delete "${product.name}" from the Phantom catalog?\n\nThis will remove it completely from the database.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await api.delete(`/products/${product.id}`);
      window.dispatchEvent(
        new CustomEvent('phantom:product-deleted', { detail: { id: product.id } })
      );
      navigate('/shop');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete piece.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1360px] mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-8 lg:px-12">
        {/* ========================================================= */}
        {/* TOP BREADCRUMB: SHOP › CATEGORY                           */}
        {/* ========================================================= */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-10 text-xs tracking-[0.22em] uppercase font-bold text-neutral-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/shop" className="hover:text-white transition-colors">
                SHOP
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-600">
              ›
            </li>
            <li className="text-white">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </li>
          </ol>
        </nav>

        {/* ========================================================= */}
        {/* MAIN PRODUCT GRID: 2 Columns                             */}
        {/* Left: Gallery with Controls & Bottom Thumbnails           */}
        {/* Right: Details, Selectors, CTAs, Accordions               */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-10 xl:gap-14">
          {/* ======================================================= */}
          {/* LEFT: GALLERY (768px by 960px)                          */}
          {/* ======================================================= */}
          <div className="w-full max-w-[768px] lg:w-[768px] shrink-0 flex flex-col gap-4">
            {/* Large Canvas Viewport: 768px by 960px on desktop */}
            <div className="relative w-full max-w-[768px] lg:w-[768px] aspect-[768/960] lg:h-[960px] bg-[#161514] overflow-hidden group select-none">
              {/* Primary Active Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={images[activeImageIndex]}
                  alt={`${product.name} view ${activeImageIndex + 1}`}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Prev Arrow Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous product image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 hover:bg-white text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-xs active:scale-95 z-20"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
              )}

              {/* Next Arrow Button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next product image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 hover:bg-white text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-xs active:scale-95 z-20"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                </button>
              )}

              {/* Bottom Center Indicator Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2 z-20">
                  {images.map((_: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Jump to image ${idx + 1}`}
                      className={`h-1.5 transition-all rounded-full cursor-pointer ${
                        activeImageIndex === idx
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom-left Thumbnails matching reference screenshot */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 pt-1">
                {images.map((imgUrl: string, idx: number) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Select product image ${idx + 1}`}
                      className={`relative w-20 h-24 sm:w-24 sm:h-28 bg-[#181716] overflow-hidden transition-all cursor-pointer border ${
                        isActive
                          ? 'border-2 border-white ring-1 ring-white/20'
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* RIGHT: DETAILS (480px by 1032px)                        */}
          {/* ======================================================= */}
          <div className="w-full max-w-[480px] lg:w-[480px] shrink-0 lg:min-h-[1032px] flex flex-col space-y-7 sm:space-y-8">
            {/* Category Tag & Badges */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#cf5230] tracking-[0.24em] uppercase">
                {typeof product.category === 'object' ? product.category?.name : product.category}
              </span>
              <div className="flex items-center gap-2">
                {badgeText && (
                  <span className="bg-black/90 text-white text-[10px] font-semibold tracking-[0.18em] px-3.5 py-1 rounded-full uppercase border border-neutral-700/60 shadow-xs">
                    {badgeText}
                  </span>
                )}
                {isSoldOut && (
                  <span className="bg-[#f4f2ee] text-neutral-950 text-[10px] font-bold tracking-[0.18em] px-3.5 py-1 rounded-full uppercase shadow-xs">
                    SOLD OUT
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.08]">
              {product.name}
            </h1>

            {/* Price & Rating Row */}
            <div className="flex items-center gap-5 pt-1">
              <div className="flex items-baseline gap-2">
                {product.originalPrice && (
                  <span className="text-lg sm:text-xl text-neutral-500 line-through font-normal">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  ${product.price}
                </span>
              </div>

              {/* Star Rating & Reviews Count */}
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <div className="flex items-center gap-1 text-[#ea580c]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#ea580c] stroke-none" />
                  ))}
                </div>
                <span className="font-semibold text-white">
                  {product.rating ? product.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-neutral-500 font-normal">
                  &bull; {product.reviewsCount || 214} reviews
                </span>
              </div>
            </div>

            {/* Short Editorial Description */}
            <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed">
              {product.description ||
                'A double-faced overcoat with a dropped shoulder and a hand-finished collar.'}
            </p>

            {/* ===================================================== */}
            {/* COLOUR SELECTOR                                       */}
            {/* ===================================================== */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
                <span>COLOUR</span>
                {selectedColor && (
                  <span className="text-white normal-case font-medium tracking-normal text-xs">
                    {selectedColor}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {colors.map((c: any) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={`Select color ${c.name}`}
                      title={c.name}
                      className={`relative w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11100f] scale-105'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5] drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===================================================== */}
            {/* SIZE SELECTOR & SIZE GUIDE                            */}
            {/* ===================================================== */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase">
                <span className="text-neutral-400">SELECT A SIZE</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-neutral-400 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
                >
                  SIZE GUIDE
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizes.map((s: string) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 h-12 px-3 flex items-center justify-center text-xs font-semibold tracking-wider transition-colors cursor-pointer border ${
                        isSelected
                          ? 'border-white bg-[#222120] text-white'
                          : 'border-neutral-800 bg-[#161514] text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===================================================== */}
            {/* QUANTITY & PRIMARY ACTION BUTTONS                      */}
            {/* Logic:                                                */}
            {/* If neither selected: "SELECT A COLOUR FIRST"           */}
            {/* If color selected, no size: "SELECT A SIZE FIRST"      */}
            {/* If size selected, no color: "SELECT A COLOUR FIRST"    */}
            {/* If both selected: "ADD TO BAG" & "BUY NOW"             */}
            {/* Top button hover: cream -> orange                     */}
            {/* Bottom button hover: orange -> deep orange            */}
            {/* ===================================================== */}
            {isAdmin ? (
              <div className="space-y-3 pt-3">
                <div className="p-5 rounded-2xl bg-[#161514] border border-amber-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400">
                      PHANTOM ADMIN ACTIONS
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                      Admin Mode
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    As an administrator, you can modify all attributes of this garment (title, pricing, images, categories, and inventory) or permanently purge it from the catalog.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      className="flex-1 h-[48px] px-5 rounded-full text-xs font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 bg-[#f4f2ee] hover:bg-white text-neutral-950 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <SquarePen className="w-4 h-4" />
                      <span>EDIT PIECE</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={isDeleting}
                      className="h-[48px] px-6 rounded-full text-xs font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>{isDeleting ? 'DELETING...' : 'DELETE PIECE'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : isSoldOut ? (
              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full h-[54px] bg-[#222120] text-neutral-400 text-xs font-bold tracking-[0.22em] uppercase flex items-center justify-center cursor-not-allowed select-none transition-none shadow-none"
                >
                  SOLD OUT
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {/* Row 1: Quantity Counter + Top Button */}
                <div className="flex items-center gap-3">
                  {/* Quantity increment and decrement */}
                  <div className="inline-flex items-center border border-neutral-800 bg-[#161514] h-[48px] select-none shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Top Button: Disabled State vs "ADD TO BAG" */}
                  {isReadyToBuy ? (
                    <button
                      type="button"
                      onClick={handleAddToBag}
                      className="flex-1 h-[48px] bg-[#f4f2ee] hover:bg-[#ea580c] text-neutral-950 hover:text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 flex items-center justify-center cursor-pointer shadow-sm text-center"
                    >
                      ADD TO BAG
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 h-[48px] bg-[#222120] text-neutral-500 text-xs font-semibold tracking-[0.18em] uppercase flex items-center justify-center cursor-not-allowed text-center"
                    >
                      {getDisabledButtonLabel()}
                    </button>
                  )}
                </div>

                {/* Row 2: Bottom Button - Disabled State vs "BUY NOW, SECURE CHECKOUT" */}
                {isReadyToBuy ? (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full h-[48px] bg-[#cf5230] hover:bg-[#a63d20] text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 flex items-center justify-center cursor-pointer shadow-md text-center"
                  >
                    BUY NOW, SECURE CHECKOUT
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full h-[48px] bg-[#1a1918] border border-neutral-900 text-neutral-600 text-xs font-semibold tracking-[0.18em] uppercase flex items-center justify-center cursor-not-allowed text-center"
                  >
                    {getDisabledButtonLabel()}
                  </button>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* SAVE FOR LATER (Wishlist - for regular customers)      */}
            {/* ===================================================== */}
            {!isAdmin && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorited
                        ? 'fill-orange-500 text-orange-500'
                        : 'stroke-[1.8] text-neutral-400'
                    }`}
                  />
                  <span>{isFavorited ? 'SAVED TO WISHLIST' : 'SAVE FOR LATER'}</span>
                </button>
              </div>
            )}

            {/* Divider Line */}
            <div className="border-b border-neutral-800/80 pt-1" />

            {/* ===================================================== */}
            {/* VALUE PROPOSITION PERKS (3 items)                     */}
            {/* ===================================================== */}
            <div className="space-y-3.5 text-xs text-neutral-400 font-normal">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-neutral-400 shrink-0 stroke-[1.8]" />
                <span>Free carbon-neutral shipping over €200</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-neutral-400 shrink-0 stroke-[1.8]" />
                <span>Thirty days to change your mind</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0 stroke-[1.8]" />
                <span>Two years of free repairs, in-house</span>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-b border-neutral-800/80 pt-1" />

            {/* ===================================================== */}
            {/* ACCORDIONS: Materials, Care instructions, Shipping     */}
            {/* ===================================================== */}
            <div className="space-y-0 divide-y divide-neutral-800/80">
              {/* 1. Materials */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('materials')}
                  className="w-full flex items-center justify-between text-left text-lg font-bold text-white tracking-tight cursor-pointer hover:text-neutral-200 transition-colors"
                >
                  <span>Materials</span>
                  {openAccordion === 'materials' ? (
                    <Minus className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openAccordion === 'materials' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                        {product.materials ||
                          '78% virgin wool, 22% alpaca. Sourced from certified ethical mills in Biella, Italy. Heavyweight double-faced construction with a soft, brushed hand feel.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Care instructions */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between text-left text-lg font-bold text-white tracking-tight cursor-pointer hover:text-neutral-200 transition-colors"
                >
                  <span>Care instructions</span>
                  {openAccordion === 'care' ? (
                    <Minus className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                        {product.careInstructions ||
                          'Dry clean or spot clean clothes, store folded, never on a hanger, rest between wears. Use a natural bristle garment brush to remove surface dust.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Shipping & returns */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-lg font-bold text-white tracking-tight cursor-pointer hover:text-neutral-200 transition-colors"
                >
                  <span>Shipping & returns</span>
                  {openAccordion === 'shipping' ? (
                    <Minus className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                        {product.shippingInfo ||
                          'Free carbon-neutral delivery on orders above €200 within UK or EU. Worldwide express delivery available. Complimentary 30-day returns on all unworn items in original packaging.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION: ABOUT THIS PIECE & SPECIFICATION                 */}
      {/* ========================================================= */}
      <section className="w-full bg-[#181716] border-y border-neutral-800/80 py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            {/* Left Column: About This Piece */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[12px] font-bold text-[#cf5230] tracking-[0.24em] uppercase block">
                ABOUT THIS PIECE
              </span>
              <div className="space-y-6 text-[15px] sm:text-base text-[#d6d3cd] font-normal leading-[1.8] max-w-xl">
                {storyParagraphs.map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Right Column: Specification */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[12px] font-bold text-[#cf5230] tracking-[0.24em] uppercase block">
                SPECIFICATION
              </span>
              <div className="border-t border-b border-neutral-800/80 divide-y divide-neutral-800/80">
                {specEntries.map(([label, val]: [string, any]) => (
                  <div key={label} className="py-4.5 flex items-baseline justify-between text-xs sm:text-sm">
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-white text-right">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION: YOU MAY ALSO LIKE                                */}
      {/* ========================================================= */}
      <section className="w-full bg-[#11100f] py-16 sm:py-24">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-white mb-10 sm:mb-12">
            You may also like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
            {YOU_MAY_ALSO_LIKE_PRODUCTS.map((recProduct) => (
              <ProductCard
                key={recProduct.id}
                product={recProduct}
                imageClassName="aspect-[4/5]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================== */}
      {/* SIZE GUIDE MODAL                                            */}
      {/* =========================================================== */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#141312] border border-neutral-800 p-6 sm:p-8 text-white z-10 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold tracking-tight mb-2">Size & Fit Guide</h3>
              <p className="text-xs text-neutral-400 mb-6 font-normal">
                All measurements are in centimeters (cm). We recommend choosing your standard tailoring size for a classic relaxed silhouette.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                      <th className="py-2.5 pr-4">EU Size</th>
                      <th className="py-2.5 px-4">Chest</th>
                      <th className="py-2.5 px-4">Shoulder</th>
                      <th className="py-2.5 pl-4">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-neutral-300 font-normal">
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">46 (Small)</td>
                      <td className="py-3 px-4">112 cm</td>
                      <td className="py-3 px-4">49 cm</td>
                      <td className="py-3 pl-4">118 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">48 (Medium)</td>
                      <td className="py-3 px-4">116 cm</td>
                      <td className="py-3 px-4">50.5 cm</td>
                      <td className="py-3 pl-4">120 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">50 (Large)</td>
                      <td className="py-3 px-4">120 cm</td>
                      <td className="py-3 px-4">52 cm</td>
                      <td className="py-3 pl-4">122 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">52 (XL)</td>
                      <td className="py-3 px-4">124 cm</td>
                      <td className="py-3 px-4">53.5 cm</td>
                      <td className="py-3 pl-4">124 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
