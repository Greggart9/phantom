import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import AuthModal from '../auth/AuthModal';
import ProfileModal from '../auth/ProfileModal';
import { useStore } from '../../context/StoreContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { cartCount, wishlistCount, openCart } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={openCart}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <ProfileModal />
    </div>
  );
}
