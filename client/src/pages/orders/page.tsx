import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Package, Truck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ui/ProductCard';
import { RECOMMENDED_PRODUCTS } from '../../components/section/RecommendedProducts';

export default function OrdersPage() {
  const { orders } = useStore();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Automatic auth modal trigger if unauthenticated user tries to view orders
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please sign in or create an account to view your Phantom orders.');
    }
  }, [isAuthenticated, openAuthModal]);

  // =========================================================================
  // AUTHENTICATION GUARD: Never show order contents to unauthenticated visitors
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
              Your order history is private and associated with your Phantom account. Please sign in or create an account to access your orders and carrier tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal('login', 'Please sign in or create an account to view your orders.')}
            className="w-full py-4 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.22em] uppercase transition-colors shadow-lg cursor-pointer"
          >
            SIGN IN TO VIEW ORDERS
          </button>
        </div>
      </div>
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* ========================================================= */}
        {/* HEADER: "Your orders"                                      */}
        {/* Matching reference screenshot                              */}
        {/* ========================================================= */}
        <header className="pb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-tight">
              Your orders
            </h1>
            {hasOrders && (
              <span className="text-xs font-semibold tracking-wider px-3 py-1 bg-neutral-800/80 text-neutral-300 rounded-full">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-neutral-400 font-normal mt-3 max-w-3xl leading-relaxed">
            Everything you have ordered from this browser, with the details we sent you. Kept on this device only.
          </p>
        </header>

        {/* ========================================================= */}
        {/* ORDERS CONTENT: Empty state vs Active Orders               */}
        {/* ========================================================= */}
        {!hasOrders ? (
          /* Empty State matching reference screenshot */
          <div className="py-20 sm:py-28 flex flex-col items-center justify-center text-center">
            <p className="text-sm sm:text-base text-neutral-400 font-normal mb-4">
              No orders from this browser yet.
            </p>
            <Link
              to="/shop"
              className="text-xs font-bold tracking-[0.22em] uppercase text-[#f4f2ee] hover:text-[#cf5230] transition-colors underline underline-offset-8 cursor-pointer"
            >
              BROWSE THE SHOP
            </Link>
          </div>
        ) : (
          /* Active Paid Orders List */
          <div className="space-y-8 sm:space-y-10 pt-4 pb-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#161514] border border-neutral-800/80 p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-md"
              >
                {/* Order Top Bar: Number, Date, Status Pill & Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-[0.18em] uppercase text-neutral-400">
                        ORDER
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-normal">
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{order.status === 'PAID' ? 'PAID & CONFIRMED' : order.status}</span>
                    </span>

                    {/* Total Paid */}
                    <div className="text-right">
                      <span className="text-xs text-neutral-500 font-normal block">TOTAL PAID</span>
                      <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                        ${order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Stepper / Status Pipeline */}
                <div className="bg-[#141312] border border-neutral-800/70 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold tracking-[0.16em] uppercase text-neutral-400">
                    <span className="flex items-center gap-2 text-white">
                      <Truck className="w-4 h-4 text-orange-500 stroke-[2]" />
                      <span>LIVE DISPATCH STATUS</span>
                    </span>
                    <span className="text-neutral-400">
                      ESTIMATED ARRIVAL: <strong className="text-white">{order.estimatedDelivery || 'In 2-4 business days'}</strong>
                    </span>
                  </div>

                  {/* Stepper Bar */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {/* Step 1: Confirmed */}
                    <div className="space-y-2">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <div className="text-[10px] sm:text-xs font-semibold text-white">
                        1. Confirmed
                      </div>
                    </div>

                    {/* Step 2: Phantom Prep */}
                    <div className="space-y-2">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <div className="text-[10px] sm:text-xs font-semibold text-white">
                        2. Hand Inspected
                      </div>
                    </div>

                    {/* Step 3: Dispatched */}
                    <div className="space-y-2">
                      <div className="h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <div className="text-[10px] sm:text-xs font-semibold text-orange-400">
                        3. Dispatched
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="space-y-2">
                      <div className="h-1.5 rounded-full bg-neutral-800" />
                      <div className="text-[10px] sm:text-xs font-semibold text-neutral-500">
                        4. Delivered
                      </div>
                    </div>
                  </div>

                  {/* Carrier & Tracking Code */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400 border-t border-neutral-800/50">
                    <span>
                      Carrier:{' '}
                      <strong className="text-neutral-200">
                        {order.carrier || 'DHL Express (Carbon Neutral)'}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      Tracking code:{' '}
                      <span className="font-mono text-white bg-black/50 px-2 py-0.5 rounded border border-neutral-800">
                        {order.trackingNumber || 'DHL-EXP-491029318'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Ordered Items Grid */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400">
                    ITEMS IN THIS ORDER
                  </h3>

                  <div className="divide-y divide-neutral-800/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#141312] border border-neutral-800 overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                              Qty: {item.quantity} &bull; ${item.price} each
                              {(item.selectedSize || item.selectedColor) && (
                                <span className="text-neutral-300 ml-1.5">
                                  &bull; {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm sm:text-base font-semibold text-white tracking-tight whitespace-nowrap">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Destination Footer */}
                {order.shippingAddress && (
                  <div className="pt-4 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        DELIVERING TO
                      </span>
                      <span className="text-neutral-300 font-normal">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName} &mdash;{' '}
                        {order.shippingAddress.address}
                        {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to="/contact"
                        className="text-neutral-400 hover:text-white uppercase tracking-wider text-[11px] font-semibold underline underline-offset-4 transition-colors"
                      >
                        Help with this order
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* HORIZONTAL DIVIDER                                        */}
        {/* Matching reference screenshot                              */}
        {/* ========================================================= */}
        <div className="border-b border-white/10 my-16 sm:my-20" />

        {/* ========================================================= */}
        {/* SECTION: "More to consider"                                */}
        {/* Matching reference screenshot with the 4 exact products:  */}
        {/* 1. Brenna Card Holder ($95, LEATHER)                      */}
        {/* 2. Kaolin Vase, Tall ($140, OBJECTS)                      */}
        {/* 3. Terra Serving Bowl ($88, SALE, OBJECTS)                */}
        {/* 4. Ash Candle, Cedar & Moss ($52, OBJECTS)                */}
        {/* ========================================================= */}
        <section aria-labelledby="more-to-consider-heading" className="pt-2 pb-12">
          <h2
            id="more-to-consider-heading"
            className="text-2xl sm:text-3xl font-normal text-white tracking-tight mb-8 sm:mb-10"
          >
            More to consider
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RECOMMENDED_PRODUCTS.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                imageClassName="aspect-square"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
