import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Heart, SquarePen, Trash2, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import type { ProductItem } from '../../context/StoreContext';
import api from '../../services/api';

export interface ProductCardProps {
  product: ProductItem;
  className?: string;
  imageClassName?: string;
  onDelete?: (productId: string) => void;
}

export default function ProductCard({
  product,
  className = '',
  imageClassName = 'h-[433px]',
  onDelete
}: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const isAdmin = Boolean(isAuthenticated && user?.role === 'ADMIN');
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return null;
  }

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images[0] || '';
  const secondaryImage = product.images[1] || product.images[0] || '';

  // Dynamic Sold Out calculation (from stock, flag, or tag)
  const isSoldOut =
    Boolean(product.isSoldOut) ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0) ||
    product.badge === 'SOLD OUT';

  // Dynamic Badge text (admin badge, custom tag, or auto LIMITED when stock < 10)
  const badgeText =
    product.badge && product.badge !== 'SOLD OUT'
      ? product.badge
      : product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity < 10
      ? 'LIMITED'
      : null;

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to add items to your shopping bag.');
      return;
    }
    if (!isSoldOut) {
      addToCart(product);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to save items to your wishlist.');
      return;
    }
    toggleWishlist(product);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Permanently delete "${product.name}"?\n\nThis will remove the piece completely from the Phantom database.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await api.delete(`/products/${product.id}`);
      setIsDeleted(true);
      if (onDelete) {
        onDelete(product.id);
      }
      window.dispatchEvent(
        new CustomEvent('phantom:product-deleted', { detail: { id: product.id } })
      );
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete piece from database.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group flex flex-col select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Canvas & Badges & Overlay Actions */}
      <Link
        to={`/shop/${product.slug}`}
        className={`relative block w-full bg-neutral-900 overflow-hidden ${imageClassName}`}
      >
        {/* Base Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Secondary Image: Smooth crossfade on hover */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out will-change-opacity ${
              isHovered ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-100'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
          {/* Left Badge: BEST SELLER, NEW, LIMITED, or Custom Tag */}
          {badgeText ? (
            <span className="bg-black/90 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] px-3.5 py-1.5 rounded-full uppercase border border-neutral-700/50 shadow-sm">
              {badgeText}
            </span>
          ) : (
            <span />
          )}

          {/* Right Badge: SOLD OUT or ADMIN INDICATOR */}
          {isAdmin ? (
            <span className="bg-[#cf5230] text-white text-[9px] sm:text-[10px] font-bold tracking-[0.18em] px-2.5 py-1 rounded-full uppercase shadow-md">
              ADMIN
            </span>
          ) : isSoldOut ? (
            <span className="bg-[#f4f2ee] text-neutral-950 text-[10px] sm:text-[11px] font-bold tracking-[0.18em] px-3.5 py-1.5 rounded-full uppercase shadow-md">
              SOLD OUT
            </span>
          ) : null}
        </div>

        {/* Bottom Actions — Always accessible on mobile, hover-reveal on desktop */}
        <div className="absolute inset-x-0 bottom-2.5 sm:bottom-4 px-2.5 sm:px-4 flex items-center justify-between gap-2 z-20 transition-all duration-300 ease-out opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
          {isAdmin ? (
            <div className="flex items-center gap-2 w-full pointer-events-auto">
              {/* EDIT BUTTON */}
              <button
                type="button"
                onClick={handleEdit}
                aria-label={`Edit ${product.name}`}
                className="flex-1 h-8.5 sm:h-11 px-3 sm:px-4 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 bg-[#f3f1ec] text-neutral-950 hover:bg-white hover:shadow-lg transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
              >
                <SquarePen className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>EDIT</span>
              </button>

              {/* DELETE BUTTON */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label={`Delete ${product.name}`}
                className="h-8.5 sm:h-11 px-3 sm:px-4 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white hover:shadow-lg transition-all duration-200 active:scale-95 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                )}
                <span>{isDeleting ? 'DELETING...' : 'DELETE'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Add to Bag Pill Button */}
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={isSoldOut}
                className={`pointer-events-auto h-8.5 sm:h-11 px-3 sm:px-5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase flex items-center gap-1 sm:gap-1.5 transition-all duration-200 active:scale-95 shadow-md ${
                  isSoldOut
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#f3f1ec] text-neutral-950 hover:bg-white hover:shadow-lg cursor-pointer'
                }`}
              >
                {!isSoldOut && <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />}
                <span>{isSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}</span>
              </button>

              {/* Wishlist Circle Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                className="pointer-events-auto w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-full bg-[#f3f1ec] text-neutral-950 hover:bg-white flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md cursor-pointer hover:shadow-lg shrink-0"
              >
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] transition-colors duration-200 ${
                    isFavorited
                      ? 'fill-[#cf5230] text-[#cf5230]'
                      : 'text-neutral-900 group-hover/heart:text-black'
                  }`}
                />
              </button>
            </>
          )}
        </div>
      </Link>

      {/* 2. Product Information (Title, Price, Category) */}
      <div className="pt-3">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <Link
            to={`/shop/${product.slug}`}
            className="text-sm sm:text-base lg:text-lg font-semibold text-white tracking-tight leading-snug hover:text-neutral-300 transition-colors block truncate"
          >
            {product.name}
          </Link>
          <div className="text-right whitespace-nowrap">
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-neutral-500 line-through mr-1.5 font-normal">
                ${product.originalPrice}
              </span>
            )}
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-white tracking-tight">
              ${product.price}
            </span>
          </div>
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase mt-0.5 sm:mt-1">
          {product.category}
        </p>
      </div>
    </div>
  );
}
