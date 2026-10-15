import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Check, ArrowRight, MapPin, Edit3 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import RecommendedProducts from '../../components/section/RecommendedProducts';

interface DeliveryMethod {
  id: string;
  name: string;
  subtitle: string;
  price: number;
}

const DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: 'standard',
    name: 'Standard — 2 to 4 working days',
    subtitle: 'Carbon-neutral, tracked',
    price: 0
  },
  {
    id: 'express',
    name: 'Express — next working day',
    subtitle: 'Order before 14:00 WET',
    price: 18
  },
  {
    id: 'studio',
    name: 'Collect from the studio',
    subtitle: 'Rua da Boavista 84, Lisboa',
    price: 0
  }
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, createOrder } = useStore();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Automatic auth modal trigger if unauthenticated user tries to view checkout
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to proceed to checkout.');
    }
  }, [isAuthenticated, openAuthModal]);

  // Delivery Method State
  const [selectedMethod, setSelectedMethod] = useState<string>('standard');

  // Remember details checkbox
  const [rememberDetails, setRememberDetails] = useState<boolean>(true);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const hasItems = cart.length > 0;
  const currentDelivery = DELIVERY_METHODS.find((m) => m.id === selectedMethod) || DELIVERY_METHODS[0];
  const deliveryFee = hasItems ? currentDelivery.price : 0;
  const currentSubtotal = hasItems ? cartSubtotal : 0;
  const discountAmount = (currentSubtotal * discountPercent) / 100;
  const finalTotal = hasItems ? Math.max(0, currentSubtotal - discountAmount + deliveryFee) : 0;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FIRST11') {
      setAppliedPromo('FIRST11');
      setDiscountPercent(10);
    } else if (promoCode.trim().toUpperCase() === 'PHANTOM10') {
      setAppliedPromo('PHANTOM10');
      setDiscountPercent(10);
    }
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to complete your checkout.');
      return;
    }

    if (!hasItems) {
      return;
    }

    // Place the confirmed, paid order
    const selectedDelivery = DELIVERY_METHODS.find((m) => m.id === selectedMethod);
    createOrder({
      items: cart,
      shippingAddress: {
        firstName: user?.firstName || user?.fullName?.split(' ')[0] || 'Phantom',
        lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || 'Collector',
        address: user?.address || 'Primary Residence',
        apartment: user?.apartment || '',
        city: user?.city || 'Lisboa',
        postcode: user?.postcode || '',
        country: user?.country || 'Portugal'
      },
      deliveryMethod: selectedDelivery?.name,
      totalAmount: finalTotal
    });

    // Navigate to Your Orders page
    navigate('/account/orders');
  };

  // =========================================================================
  // AUTHENTICATION GUARD: Never show checkout to unauthenticated visitors
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
              Checkout and payment are encrypted and linked to your Phantom account. Please sign in or create an account to complete your purchase.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal('login', 'Please sign in or create an account to proceed to checkout.')}
            className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.22em] uppercase transition-colors shadow-lg cursor-pointer"
          >
            SIGN IN TO CHECKOUT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-10 sm:py-16 px-4 sm:px-8 lg:px-12 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-10 sm:pb-14 border-b border-neutral-800/80">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Checkout
          </h1>
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-neutral-400">
            <Lock className="w-3.5 h-3.5 stroke-[2]" />
            <span>SECURE CHECKOUT</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-10 sm:pt-14 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDE: Contact, Delivery address, Delivery method     */}
          {/* (Scrolls completely first while Right Column stays sticky) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-12 sm:space-y-14">
            <form onSubmit={handleCompleteOrder} className="space-y-12 sm:space-y-14">
              {/* SECTION 01: PHANTOM DESTINATION SUMMARY */}
              <section aria-labelledby="destination-heading" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[#cf5230] tracking-wider">
                      01
                    </span>
                    <h2 id="destination-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Delivery Destination
                    </h2>
                  </div>
                  <Link
                    to="/profile"
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold tracking-wider uppercase underline underline-offset-4 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit in Profile</span>
                  </Link>
                </div>

                <div className="p-5 sm:p-6 bg-[#161514] border border-neutral-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white tracking-wide">
                        {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Collector'}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                        {user?.email}
                      </p>
                      {user?.phone && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {user?.phone}
                        </p>
                      )}
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded text-orange-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-semibold mb-1">
                      Shipping Address
                    </p>
                    {user?.address ? (
                      <p className="text-xs text-neutral-200 font-medium leading-relaxed">
                        {user.address}
                        {user.apartment ? `, ${user.apartment}` : ''}
                        <br />
                        {[user.city, user.postcode, user.country].filter(Boolean).join(', ')}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-xs text-neutral-400 italic">
                          No delivery address registered yet in profile.
                        </span>
                        <Link
                          to="/profile"
                          className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline"
                        >
                          Add Address &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 02: DELIVERY METHOD */}
              <section aria-labelledby="method-heading" className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-[#cf5230] tracking-wider">
                    02
                  </span>
                  <h2 id="method-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Delivery method
                  </h2>
                </div>

                <div className="space-y-3">
                  {DELIVERY_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;

                    return (
                      <label
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex items-center justify-between p-4 sm:p-5 border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#181716]'
                            : 'bg-[#141312] border-[#252423]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Custom Radio Button matching screenshot */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#cf5230]' : 'border-neutral-600'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#cf5230]" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white leading-snug">
                              {method.name}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                              {method.subtitle}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-semibold text-white whitespace-nowrap ml-4">
                          {method.price === 0 ? 'Free' : `$${method.price}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Remember my details checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => setRememberDetails(!rememberDetails)}
                    className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      rememberDetails ? 'bg-[#cf5230] border-[#cf5230]' : 'border-neutral-700 bg-[#161514]'
                    }`}
                  >
                    {rememberDetails && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Remember my details on this device
                    </span>
                    <span className="text-[11px] text-neutral-500 font-normal block mt-0.5">
                      Kept in this browser only, so your next order is quicker. Untick to forget them.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit CTA button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.22em] uppercase transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>COMPLETE ORDER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: ORDER SUMMARY                                */}
          {/* (Sticky fixed to the top while left side scrolls, then    */}
          {/* scrolls naturally once contact & address form completes) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex justify-start lg:justify-end">
            <div className="w-full lg:w-[420px] min-h-[551px] bg-[#161514] border border-neutral-800 p-7 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <h2 className="text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400 mb-6">
                  ORDER SUMMARY
                </h2>

                {/* Cart Items List or Empty Bag State */}
                {cart.length > 0 ? (
                  <div className="divide-y divide-neutral-800/80 mb-5 max-h-[220px] overflow-y-auto pr-1">
                    {cart.map((cartItem) => {
                      const { product, quantity, selectedSize, selectedColor } = cartItem;
                      const itemKey = cartItem.id || product.id;
                      return (
                        <div key={itemKey} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Product Thumbnail */}
                            <div className="w-14 h-20 bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                              <img
                                src={product.images[0] || ''}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate leading-snug">
                                {product.name}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1 capitalize font-normal">
                                {product.category.toLowerCase()} &middot; Qty {quantity}
                                {(selectedSize || selectedColor) && (
                                  <span className="text-neutral-300 ml-1.5">
                                    &middot; {[selectedColor, selectedSize].filter(Boolean).join(' / ')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-bold text-white whitespace-nowrap">
                            ${product.price * quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 flex items-center justify-center text-neutral-400 text-sm font-normal">
                    Your bag is empty.
                  </div>
                )}

                {/* Divider Line */}
                <div className="border-b border-neutral-800/80 mb-5" />

                {/* Pricing Breakdown */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-normal">Subtotal</span>
                    <span className="text-white font-semibold">${currentSubtotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-normal">Delivery</span>
                    <span className="text-white font-semibold">
                      {hasItems ? (deliveryFee === 0 ? 'Free over $200' : `$${deliveryFee}`) : 'Free over $200'}
                    </span>
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
                <form onSubmit={handleApplyPromo} className="pt-6">
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
              </div>

              {/* Phantom Assurance Notes */}
              <div className="pt-8 text-xs sm:text-[13px] text-neutral-400 font-normal leading-relaxed">
                <p>Thirty-day returns. Two years of free repairs. Questions answered by a person, usually the same day.</p>
              </div>
            </div>
          </div>
        </div>

        {/* More to consider section */}
        <RecommendedProducts title="More to consider" />
      </div>
    </div>
  );
}
