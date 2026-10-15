import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  logoText?: string;
  cartCount?: number;
  wishlistCount?: number;
  onSearchClick?: () => void;
  onUserClick?: () => void;
  onWishlistClick?: () => void;
  onCartClick?: () => void;
}

export default function Navbar({
  logoText = 'PHANTOM',
  cartCount = 0,
  wishlistCount = 0,
  onSearchClick,
  onUserClick,
  onWishlistClick,
  onCartClick
}: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'COLLECTIONS', path: '/collections' },
    { name: 'JOURNAL', path: '/journal' },
    { name: 'ABOUT', path: '/about' }
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#121110] text-white border-b border-white/10 select-none">
        <div className="max-w-[1440px] mx-auto h-16 sm:h-20 px-4 sm:px-8 lg:px-10 flex items-center justify-between">
          {/* Left Side: Mobile Hamburger & Desktop Links */}
          <div className="flex items-center">
            {/* Hamburger button visible only on mobile/small tablet */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              className="md:hidden p-2 -ml-2 text-white hover:text-orange-500 transition-colors focus:outline-none cursor-pointer"
            >
              <Menu className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-[10px] lg:text-[11px] tracking-[0.2em] font-semibold transition-all duration-200 select-none ${
                      isActive
                        ? 'text-orange-500 no-underline'
                        : 'text-white hover:text-orange-500 hover:underline underline-offset-8 decoration-orange-500 decoration-2'
                    }`}
                  >
                    {link.name}
                  </Link>
                ); 
              })}
            </nav>
          </div>

          {/* Center: Brand Wordmark */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="text-base sm:text-xl font-bold tracking-[0.3em] sm:tracking-[0.38em] uppercase text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {logoText}
            </Link>
          </div>

          {/* Right Side: Action Icons */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-7 text-white">
            {/* Admin Icon — Only visible to admins, directly beside search (hidden on phones) */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                aria-label="Phantom Admin Console"
                title="Phantom Admin Console (Tablet & Workstation only)"
                className="hidden md:inline-flex p-1 sm:p-0 text-orange-400 hover:text-orange-300 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              </Link>
            )}

            {/* Search Icon — Navigates directly to /shop (Hidden on phone screens, accessible via hamburger) */}
            {onSearchClick ? (
              <button
                type="button"
                onClick={onSearchClick}
                aria-label="Search Shop"
                className="hidden md:inline-flex p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              </button>
            ) : (
              <Link
                to="/shop"
                aria-label="Search Shop"
                className="hidden md:inline-flex p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              </Link>
            )}

            {/* User Icon — Navigates to /profile when authenticated, or opens login (Hidden on phone screens, accessible via hamburger) */}
            <button
              type="button"
              onClick={() => {
                if (onUserClick) {
                  onUserClick();
                } else if (isAuthenticated) {
                  navigate('/profile');
                } else {
                  openAuthModal('login');
                }
              }}
              aria-label={isAuthenticated ? 'Open Profile' : 'Sign In or Create Account'}
              className="hidden md:inline-flex p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            </button>

            {/* Wishlist / Heart Icon — Shown on tablet & desktop when authenticated (Hidden on phone screens, accessible via hamburger) */}
            {isAuthenticated && (
              <>
                {onWishlistClick ? (
                  <button
                    type="button"
                    onClick={onWishlistClick}
                    aria-label="Wishlist"
                    className="hidden md:inline-flex relative p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-orange-500 text-black text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/wishlist"
                    aria-label="Wishlist"
                    className="hidden md:inline-flex relative p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-orange-500 text-black text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}
              </>
            )}

            {/* Cart / Shopping Bag Icon — Visible on both mobile and desktop */}
            {onCartClick ? (
              <button
                type="button"
                onClick={onCartClick}
                aria-label="Shopping Cart"
                className="relative p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-black text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-1 sm:p-0 text-white hover:text-orange-500 transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-black text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-[82vw] max-w-sm bg-neutral-950 border-r border-neutral-800 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-900">
                  <span className="text-base font-bold tracking-[0.3em] uppercase text-white">
                    {logoText}
                  </span>
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    aria-label="Close menu"
                    className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Button */}
                <div className="pt-5 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      if (onSearchClick) {
                        onSearchClick();
                      } else {
                        navigate('/shop');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-orange-500" />
                      <span className="tracking-wider uppercase text-[11px] font-medium">Search Pieces...</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">/shop</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-6 py-6">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={closeMobileMenu}
                        className={`text-lg font-bold tracking-[0.2em] transition-colors ${
                          isActive
                            ? 'text-orange-500'
                            : 'text-neutral-200 hover:text-orange-500'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-6 border-t border-neutral-900 space-y-3 text-xs tracking-widest uppercase text-neutral-400">
                {!isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        openAuthModal('login');
                      }}
                      className="w-full flex items-center justify-between py-2 text-white hover:text-orange-500 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-500" />
                        SIGN IN / REGISTER
                      </span>
                      <span className="text-[10px] text-neutral-500">&rarr;</span>
                    </button>
                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between hover:text-white transition-colors py-1"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-neutral-400" />
                        <span>Wishlist</span>
                      </span>
                      <span>{wishlistCount}</span>
                    </Link>
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between hover:text-white transition-colors py-1"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-neutral-400" />
                        <span>Shopping Bag</span>
                      </span>
                      <span>{cartCount}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        navigate('/profile');
                      }}
                      className="w-full flex items-center justify-between pb-3 border-b border-neutral-900 text-left hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div>
                        <p className="text-[11px] text-white font-semibold truncate">{user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Collector'}</p>
                        <p className="text-[9px] text-neutral-500 lowercase truncate">{user?.email}</p>
                      </div>
                      <span className="text-[10px] text-orange-500 font-semibold uppercase">Profile &rarr;</span>
                    </button>


                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between hover:text-white transition-colors py-1"
                    >
                      <span>Wishlist</span>
                      <span>{wishlistCount}</span>
                    </Link>
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between hover:text-white transition-colors py-1"
                    >
                      <span>Shopping Bag</span>
                      <span>{cartCount}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                      className="w-full text-left text-neutral-500 hover:text-orange-500 transition-colors py-1 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
