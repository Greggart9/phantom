import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowUpRight, ArrowLeft, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import RecommendedProducts from '../../components/section/RecommendedProducts';

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useStore();
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Automatic auth modal trigger if unauthenticated user tries to view cart
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to view your shopping bag.');
    }
  }, [isAuthenticated, openAuthModal]);

  // =========================================================================
  // AUTHENTICATION GUARD: Never show cart contents to unauthenticated visitors
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-20 sm:py-28 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full border border-neutral-800 bg-[#161514] flex items-center justify-center mx-auto text-orange-500 shadow-md">
            <Lock className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
              Your shopping bag is private and encrypted to your Phantom account. Please sign in or create an account to view and manage your pieces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal('login', 'Please sign in or create an account to view your shopping bag.')}
            className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.22em] uppercase transition-colors shadow-lg cursor-pointer"
          >
            SIGN IN TO VIEW BAG
          </button>
        </div>
      </div>
    );
  }

  const hasItems = cart.length > 0;
  const deliveryFee = 0; // Free over €200 standard
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalTotal = hasItems ? Math.max(0, cartSubtotal - discountAmount + deliveryFee) : 0;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'FIRST11' || code === 'PHANTOM10') {
      setAppliedPromo(code);
      setDiscountPercent(10);
    }
  };

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* ========================================================= */}
        {/* HEADER: "Your bag"                                        */}
        {/* ========================================================= */}
        <header className="pb-8 border-b border-white/10 mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-tight">
            Your bag
          </h1>
        </header>

        {/* ========================================================= */}
        {/* MAIN CONTENT: 2-Column Layout (Items & Order Summary)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ---------------- Left Column: Cart Items ---------------- */}
          <div className="lg:col-span-7">
            {hasItems ? (
              <div className="divide-y divide-neutral-800/80">
                {cart.map((cartItem) => {
                  const { product, quantity, selectedSize, selectedColor } = cartItem;
                  const itemKey = cartItem.id || product.id;
                  return (
                    <div
                      key={itemKey}
                      className="py-6 first:pt-0 last:pb-8 flex items-start justify-between gap-6"
                    >
                      <div className="flex items-start gap-5 sm:gap-6 min-w-0">
                        {/* Product Thumbnail */}
                        <Link
                          to={`/shop/${product.slug}`}
                          className="block w-24 h-24 sm:w-28 sm:h-28 bg-[#161514] border border-neutral-800/80 overflow-hidden shrink-0"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="min-w-0 space-y-1">
                          <Link
                            to={`/shop/${product.slug}`}
                            className="text-base sm:text-lg font-medium text-white hover:text-neutral-300 transition-colors block leading-snug"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-neutral-400 font-normal">
                            {product.category} &middot; Qty {quantity}
                            {(selectedSize || selectedColor) && (
                              <span className="text-neutral-300 ml-2">
                                &middot; {[selectedColor, selectedSize].filter(Boolean).join(' / ')}
                              </span>
                            )}
                          </p>

                          {/* Quantity Selector */}
                          <div className="pt-2">
                            <div className="inline-flex items-center border border-neutral-800 bg-[#161514] px-3 py-1.5 text-xs text-neutral-300 gap-4">
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, quantity - 1)}
                                className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm leading-none"
                                aria-label="Decrease quantity"
                              >
                                &minus;
                              </button>
                              <span className="font-medium text-white min-w-[12px] text-center">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, quantity + 1)}
                                className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm leading-none"
                                aria-label="Increase quantity"
                              >
                                &#43;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & Remove Button */}
                      <div className="flex items-center gap-4 sm:gap-5 shrink-0 pt-0.5">
                        <span className="text-base sm:text-lg font-semibold text-white whitespace-nowrap">
                          ${product.price * quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemKey)}
                          className="w-6 h-6 rounded-full border border-neutral-700/80 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <X className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-neutral-400 text-sm font-normal">
                Your bag is currently empty.
              </div>
            )}

            {/* Continue Shopping Link */}
            <div className="pt-8 border-t border-neutral-800/80">
              <Link
                to="/shop"
                className="text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-[#cf5230] transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>
          </div>

          {/* ---------------- Right Column: Order Summary (420px) ---------------- */}
          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <div className="w-full lg:w-[420px] bg-[#161514] border border-neutral-800 p-7 sm:p-8 space-y-6 shadow-2xl">
              <h2 className="text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400">
                ORDER SUMMARY
              </h2>

              {/* Breakdown */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-normal">
                    Subtotal{hasItems ? ` (${cartCount})` : ''}
                  </span>
                  <span className="text-white font-semibold">
                    ${currentSubtotal(cartSubtotal, hasItems)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-normal">Delivery</span>
                  <span className="text-white font-semibold">Free over €200</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-normal">Duties & taxes</span>
                  <span className="text-white font-semibold">Included</span>
                </div>

                {discountPercent > 0 && hasItems && (
                  <div className="flex justify-between items-center text-[#cf5230] font-medium">
                    <span>Discount ({appliedPromo} - {discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(0)}</span>
                  </div>
                )}

                {/* Divider Line */}
                <div className="border-b border-neutral-800/80 pt-1" />

                <div className="pt-2 flex justify-between items-baseline text-white">
                  <span className="text-base font-normal">Total</span>
                  <span className="text-3xl font-bold tracking-tight">
                    ${finalTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="GIFT OR PROMO CODE"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-[#121110] border border-neutral-800 px-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#201f1e] hover:bg-[#2c2b29] text-xs font-bold tracking-widest uppercase text-white transition-colors cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 font-normal">
                  {appliedPromo ? `${appliedPromo} · 10% off applied` : 'FIRST11 · 10% off'}
                </p>
              </form>

              {/* Proceed to Checkout CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
                      return;
                    }
                    navigate(hasItems ? '/checkout' : '/shop');
                  }}
                  className="w-full py-4 bg-[#f5f4f0] hover:bg-white text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg text-center"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Note */}
              <p className="text-[11px] text-neutral-500 text-center font-normal leading-relaxed pt-1">
                Taxes and duties calculated at checkout. Secure payment.
              </p>
            </div>
          </div>
        </div>

        {/* Pairs well with section */}
        <RecommendedProducts title="Pairs well with" />
      </div>
    </div>
  );
}

function currentSubtotal(subtotal: number, hasItems: boolean): number {
  return hasItems ? subtotal : 0;
}
