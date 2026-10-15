import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cart,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart
  } = useStore();
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Prevent background scrolling while drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
          />

          {/* Slide-over Drawer Panel matching screenshot */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 32,
                stiffness: 320
              }}
              className="w-screen max-w-[440px] sm:max-w-[480px] bg-[#f6f5f0] text-neutral-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-neutral-300/80 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.22em] uppercase text-neutral-800">
                  YOUR BAG — {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
                </span>
                <button
                  type="button"
                  onClick={closeCart}
                  aria-label="Close bag"
                  className="p-1 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Items List (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <p className="text-neutral-500 text-sm font-normal">
                      Your bag is currently empty.
                    </p>
                    <Link
                      to="/shop"
                      onClick={closeCart}
                      className="px-6 py-3 bg-neutral-950 text-white text-xs font-semibold tracking-[0.2em] uppercase hover:bg-black transition-colors"
                    >
                      EXPLORE PRODUCTS
                    </Link>
                  </div>
                ) : (
                  cart.map((cartItem) => {
                    const { product, quantity, selectedSize, selectedColor } = cartItem;
                    const itemKey = cartItem.id || product.id;
                    return (
                      <div
                        key={itemKey}
                        className="flex items-start gap-4 pb-6 border-b border-neutral-200/80 last:border-0"
                      >
                        {/* Thumbnail Image */}
                        <Link
                          to={`/shop/${product.slug}`}
                          onClick={closeCart}
                          className="block w-20 h-24 sm:w-22 sm:h-26 bg-neutral-200 overflow-hidden shrink-0"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </Link>

                        {/* Item Details & Quantity Box */}
                        <div className="flex-1 min-w-0 pr-2">
                          <Link
                            to={`/shop/${product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold text-neutral-950 leading-snug hover:opacity-80 transition-opacity block truncate"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            <span className="capitalize">{product.category.toLowerCase()}</span>
                            {(selectedSize || selectedColor) && (
                              <span className="text-neutral-700 font-medium ml-1.5">
                                &middot; {[selectedColor, selectedSize].filter(Boolean).join(' / ')}
                              </span>
                            )}
                          </p>

                          {/* Quantity Counter Box matching screenshot: [ -  1  + ] */}
                          <div className="inline-flex items-center border border-neutral-300 mt-3 select-none bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors text-sm font-medium"
                              aria-label="Decrease quantity"
                            >
                              –
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-neutral-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors text-sm font-medium"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove Button */}
                        <div className="flex flex-col items-end justify-between h-20">
                          <span className="text-sm font-semibold text-neutral-950">
                            ${product.price * quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(itemKey)}
                            aria-label={`Remove ${product.name}`}
                            className="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer with Subtotal & Checkout */}
              {cart.length > 0 && (
                <div className="p-6 sm:p-8 border-t border-neutral-300/80 bg-[#f6f5f0]">
                  <div className="flex items-baseline justify-between mb-5">
                    <span className="text-sm text-neutral-600 font-normal">Subtotal</span>
                    <span className="text-2xl font-bold text-neutral-950 tracking-tight">
                      ${cartSubtotal}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      if (!isAuthenticated) {
                        openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
                        return;
                      }
                      navigate('/checkout');
                    }}
                    className="w-full bg-[#111111] hover:bg-black text-white text-xs font-bold tracking-[0.22em] uppercase py-4 transition-colors text-center block shadow-md cursor-pointer"
                  >
                    CHECKOUT
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
