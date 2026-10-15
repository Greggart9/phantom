import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderKanban,
  Tag,
  ShoppingBag,
  MessageSquare,
  BookOpen,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  Shield,
  Layers
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Collections', path: '/admin/collections', icon: FolderKanban },
  { name: 'Categories', path: '/admin/categories', icon: Tag },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
  { name: 'Journal', path: '/admin/journal', icon: BookOpen }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row antialiased selection:bg-orange-500 selection:text-black">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111114] border-b border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-[0.25em] text-sm uppercase">Phantom</span>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-500/30 font-mono">
              Admin
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-neutral-400 hover:text-white transition-colors"
        >
          <span>Store</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#111114] border-r border-neutral-800/80 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Monogram */}
        <div className="p-6 border-b border-neutral-800/70 flex items-center justify-between">
          <div>
            <Link to="/admin" className="block">
              <span className="font-bold tracking-[0.28em] text-base uppercase text-white hover:text-orange-400 transition-colors">
                Phantom
              </span>
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-mono">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-[0.16em] uppercase font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-800/80 text-white font-semibold border-l-2 border-orange-500 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-neutral-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area: Admin info & Store link */}
        <div className="p-4 border-t border-neutral-800/70 bg-[#0c0c0e] space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded text-[11px] tracking-[0.15em] uppercase text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span>View Public Store</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-white truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-neutral-400 truncate font-mono">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
