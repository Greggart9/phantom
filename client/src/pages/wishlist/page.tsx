import { Link } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export default function WishlistPage() {
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    moveToCart,
    moveAllToCart,
    clearWishlist
  } = useStore();
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white py-12 sm:py-20 px-4 sm:px-8 lg:px-12 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Header matching reference screenshot */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-neutral-800/60 gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Saved for later
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-normal max-w-xl">
              The pieces you have kept an eye on. They stay here on this device until you move them to your bag.
            </p>
          </div>

          {wishlistCount > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please sign in or create an account to move items to your bag.');
                    return;
                  }
                  moveAllToCart();
                }}
                className="px-4 sm:px-5 py-2.5 bg-[#f4f2ee] text-neutral-950 text-xs font-bold tracking-[0.16em] uppercase hover:bg-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                MOVE ALL TO BAG
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="px-4 py-2.5 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
              >
                CLEAR
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {wishlistCount === 0 ? (
          <div className="py-28 text-center space-y-6">
            <p className="text-neutral-500 text-base font-normal">
              You haven&apos;t saved any pieces yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-950 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors"
            >
              EXPLORE COLLECTION
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-900">
            {wishlistItems.map((product) => {
              const statusText = product.isSoldOut ? 'Sold out' : 'Available';

              return (
                <div
                  key={product.id}
                  className="py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-6 sm:gap-8 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <Link
                      to={`/shop/${product.slug}`}
                      className="block w-24 h-32 sm:w-28 sm:h-36 bg-neutral-900 overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </Link>

                    {/* Metadata & Actions */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/shop/${product.slug}`}
                        className="text-lg sm:text-xl font-bold text-white tracking-tight hover:text-neutral-300 transition-colors block truncate"
                      >
                        {product.name}
                      </Link>

                      <p className="text-xs text-neutral-400 mt-1 capitalize">
                        {product.category.toLowerCase()} &bull;{' '}
                        <span
                          className={
                            product.isSoldOut ? 'text-amber-500/90' : 'text-neutral-300'
                          }
                        >
                          {statusText}
                        </span>
                      </p>

                      {/* ADD TO BAG Button matching screenshot */}
                      {!product.isSoldOut ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal('login', 'Please sign in or create an account to add items to your bag.');
                              return;
                            }
                            moveToCart(product);
                          }}
                          className="mt-5 px-6 py-2.5 bg-[#f4f2ee] hover:bg-white text-neutral-950 text-xs font-bold tracking-[0.16em] uppercase transition-colors inline-block cursor-pointer shadow-sm active:scale-95"
                        >
                          ADD TO BAG
                        </button>
                      ) : (
                        <span className="mt-5 inline-block px-4 py-2 bg-neutral-900 text-neutral-500 text-xs font-semibold tracking-widest uppercase">
                          CURRENTLY UNAVAILABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Price & Remove ✕ Button */}
                  <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-center">
                    <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      ${product.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="p-2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5 stroke-[1.8]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
