import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  brandName?: string;
}

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
  requiresAuth?: boolean;
  authMessage?: string;
}

function FooterLink({ to, children, requiresAuth = false, authMessage }: FooterLinkProps) {
  const location = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();

  const isActive = (() => {
    if (to.includes('?')) {
      const [path, query] = to.split('?');
      return location.pathname === path && location.search.includes(query);
    }
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      return location.pathname === path && location.hash === `#${hash}`;
    }
    if (to === '/shop') {
      return location.pathname === '/shop' && !location.search.includes('category=');
    }
    if (to === '/about') {
      return location.pathname === '/about' && !location.hash;
    }
    return location.pathname === to;
  })();

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openAuthModal('login', authMessage || 'Please sign in or create an account to continue.');
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`transition-colors decoration-1 underline-offset-4 ${
        isActive
          ? 'text-black font-bold underline decoration-black'
          : 'text-neutral-600 hover:text-black hover:underline underline-offset-2'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Footer({ brandName = 'PHANTOM' }: FooterProps) {
  const location = useLocation();
  const isFaqPage = location.pathname === '/faq';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className={`w-full bg-[#f6f5f0] text-neutral-800 ${isFaqPage ? '' : 'border-t border-neutral-300/70'} pt-16 pb-12 px-6 sm:px-10 lg:px-16 selection:bg-neutral-300 selection:text-black`}>
      <div className="max-w-[1440px] mx-auto">
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-6 space-y-4 max-w-xs">
            <Link
              to="/"
              className="text-3xl sm:text-4xl font-extrabold tracking-[0.35em] uppercase text-black hover:opacity-85 transition-opacity inline-block select-none"
            >
              {brandName}
            </Link>
            <p className="text-[16px] leading-relaxed text-neutral-600 font-normal">
              Considered essentials, made in small runs with mills and tanneries we have worked with for a decade.
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-6 lg:pl-12 space-y-3 max-w-lg">
            <h3 className="text-base font-semibold text-black tracking-tight">
              Letters, not newsletters.
            </h3>
            <p className="text-[13px] text-neutral-600 font-normal">
              Six a year. New editions, restocks and the occasional essay.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-neutral-300 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:text-black transition-colors group cursor-pointer whitespace-nowrap"
              >
                <span>{subscribed ? 'JOINED' : 'JOIN'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Middle Section: Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 py-12 border-t border-neutral-300/60">
          {/* Col 1: SHOP */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <FooterLink to="/shop">
                  All products
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/collections">
                  Collections
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/shop?category=outerwear">
                  Outerwear
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/shop?category=knitwear">
                  Knitwear
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/shop?category=leather">
                  Leather
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/shop?category=objects">
                  Objects
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Col 2: STUDIO */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              STUDIO
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <FooterLink to="/about">
                  About
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/journal">
                  The Journal
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/about#materials">
                  Materials
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">
                  Contact
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Col 3: HELP */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              HELP
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <FooterLink to="/shipping-and-returns">
                  Shipping & returns
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/faq">
                  Frequent questions
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  to="/account/orders"
                  requiresAuth
                  authMessage="Please sign in or create an account to view your Phantom orders."
                >
                  Your orders
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  to="/cart"
                  requiresAuth
                  authMessage="Please sign in or create an account to view your shopping bag."
                >
                  Cart
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  to="/checkout"
                  requiresAuth
                  authMessage="Please sign in or create an account to proceed to checkout."
                >
                  Checkout
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Col 4: LEGAL */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              LEGAL
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <FooterLink to="/privacy">
                  Privacy policy
                </FooterLink>
              </li>
              <li>
                <FooterLink to="/terms">
                  Terms of service
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* Col 5: ELSEWHERE */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] text-neutral-500 uppercase">
              ELSEWHERE
            </h4>
            <div className="flex items-center gap-2.5 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-black hover:border-black transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-black hover:border-black transition-colors"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.48.02-3.55l.83-3.52s-.21-.42-.21-1.04c0-.98.57-1.71 1.28-1.71.6 0 .89.45.89 1 0 .61-.39 1.52-.59 2.37-.17.71.36 1.28 1.06 1.28 1.27 0 2.25-1.34 2.25-3.28 0-1.72-1.23-2.92-3-2.92-2.05 0-3.26 1.54-3.26 3.13 0 .62.24 1.29.54 1.65.06.07.07.13.05.2l-.2 1.03c-.04.14-.13.17-.3.1-1.12-.52-1.82-2.15-1.82-3.46 0-2.82 2.05-5.41 5.91-5.41 3.1 0 5.51 2.21 5.51 5.16 0 3.08-1.94 5.56-4.63 5.56-.9 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-black hover:border-black transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-5.74 1.65 6.34 6.34 0 0 0 3.57 10.93 6.34 6.34 0 0 0 6.34-6.34V8.71a8.27 8.27 0 0 0 5.08 1.74v-3.45a4.83 4.83 0 0 1-.02-.31z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Payment Marks */}
        <div className="pt-8 border-t border-neutral-300/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} {brandName} Studio, Lda. All rights reserved.
          </p>

          {/* Minimalist Payment Badges */}
          <div className="flex items-center gap-3.5 font-semibold text-neutral-600 tracking-wider text-[11px] uppercase select-none">
            <span className="hover:text-black transition-colors cursor-default">PAYPAL</span>
            <span>&bull;</span>
            <span className="hover:text-black transition-colors cursor-default">KLARNA</span>
            <span>&bull;</span>
            <span className="hover:text-black transition-colors cursor-default">STRIPE</span>
            <span>&bull;</span>
            <span className="hover:text-black transition-colors cursor-default">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
