import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn, Laptop, Tablet } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // 768px is the minimum tablet breakpoint (iPad portrait)
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Mobile Screen Restriction: Admin console is strictly disallowed on phones
  if (isMobileScreen) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center select-none selection:bg-orange-500 selection:text-black">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-orange-400 shadow-xl">
          <Laptop className="w-8 h-8 stroke-[1.8]" />
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-orange-400 font-mono mb-2">
          DEVICE ACCESS RESTRICTION
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.16em] uppercase mb-3 text-white">
          Tablet or Laptop Required
        </h1>

        <p className="text-neutral-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
          The Phantom Administrative Suite cannot be accessed from a mobile phone screen. For precision catalog operations, fulfillment queues, and brand inventory management, access is restricted to tablets (768px or wider), laptops, and desktop workstations.
        </p>

        <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 max-w-xs mb-8 flex items-center justify-center gap-3">
          <Tablet className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Please log in on a tablet, laptop, or desktop computer.</span>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f4f2ee] hover:bg-white text-neutral-950 text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-md active:scale-95 cursor-pointer rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO STOREFRONT</span>
        </Link>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-mono">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  // 3. Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 text-orange-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase mb-2">
          Administrator Access Required
        </h1>
        <p className="text-neutral-400 text-sm max-w-md mb-8 leading-relaxed">
          The Phantom Administrative Suite is restricted to verified administrators. Please authenticate with your authorized credentials.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Continue</span>
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-800 text-neutral-300 text-xs uppercase tracking-[0.2em] hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Non-Admin Account
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase mb-2">
          Restricted Domain
        </h1>
        <p className="text-neutral-400 text-sm max-w-md mb-8 leading-relaxed">
          Your account (<span className="text-white font-medium">{user?.email}</span>) does not possess administrator privileges. Contact system steward to whitelist this address.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
