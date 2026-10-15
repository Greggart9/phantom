import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Star
} from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  soldOutProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  ordersByStatus: {
    PENDING: number;
    PAID: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  itemsPreview: string[];
  createdAt: string;
}

interface RecentReview {
  id: string;
  author: string;
  email: string;
  productTitle: string;
  productSlug: string;
  rating: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/overview', { withCredentials: true });
      if (res.data?.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setRecentReviews(res.data.recentReviews || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch overview metrics:', err);
      setError(err.response?.data?.message || 'Could not load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleToggleReview = async (id: string, currentApproval: boolean) => {
    try {
      await axios.patch(`/api/admin/reviews/${id}/approval`, { isApproved: !currentApproval }, { withCredentials: true });
      setRecentReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: !currentApproval } : r))
      );
    } catch (err) {
      console.error('Failed to update review approval:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
          Gathering Performance Metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-500/30 rounded text-red-300 text-sm">
        <p className="font-semibold uppercase tracking-wider mb-2">Error Loading Dashboard</p>
        <p>{error}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-white text-xs uppercase tracking-wider rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Phantom Executive Desk
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Real-time catalog metrics, global fulfillment queue, and brand inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase tracking-[0.18em] font-bold transition-colors rounded shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 bg-[#121215] border border-neutral-800/80 rounded">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">Settled Revenue</span>
            <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 font-mono">
            Paid & delivered acquisitions
          </p>
        </div>

        {/* Order Volume */}
        <div className="p-5 bg-[#121215] border border-neutral-800/80 rounded">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">Orders Placed</span>
            <div className="p-2 rounded bg-blue-950/40 text-blue-400 border border-blue-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalOrders || 0}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-2 font-mono">
            <span className="text-amber-400">{stats?.ordersByStatus.PAID || 0} awaiting shipment</span>
          </div>
        </div>

        {/* Catalog Health */}
        <div className="p-5 bg-[#121215] border border-neutral-800/80 rounded">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">Total Garments</span>
            <div className="p-2 rounded bg-purple-950/40 text-purple-400 border border-purple-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.totalProducts || 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 font-mono">
            Active in store catalog
          </p>
        </div>

        {/* Inventory Alerts */}
        <div className="p-5 bg-[#121215] border border-neutral-800/80 rounded">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">Stock Watch</span>
            <div className="p-2 rounded bg-orange-950/40 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats?.soldOutProducts || 0}{' '}
            <span className="text-xs font-normal text-neutral-400">Sold Out</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-2 font-mono">
            {stats?.lowStockProducts || 0} garments under 5 units
          </p>
        </div>
      </div>

      {/* Fulfillment Status Rail */}
      <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 mb-4 font-mono">
          Fulfillment Pipeline Stages
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">Pending</span>
            <span className="text-lg font-bold text-neutral-300">{stats?.ordersByStatus.PENDING || 0}</span>
          </div>
          <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded">
            <span className="text-[10px] text-blue-400 uppercase tracking-wider block font-mono">Paid / Processing</span>
            <span className="text-lg font-bold text-blue-300">{stats?.ordersByStatus.PAID || 0}</span>
          </div>
          <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-mono">In Transit (DHL)</span>
            <span className="text-lg font-bold text-amber-300">{stats?.ordersByStatus.SHIPPED || 0}</span>
          </div>
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-mono">Delivered</span>
            <span className="text-lg font-bold text-emerald-300">{stats?.ordersByStatus.DELIVERED || 0}</span>
          </div>
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">Cancelled</span>
            <span className="text-lg font-bold text-neutral-400">{stats?.ordersByStatus.CANCELLED || 0}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Recent Orders
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Dispatches needing review</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors font-mono"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-neutral-400 text-xs py-8 text-center font-mono">
                No orders recorded yet.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 bg-neutral-900/50 border border-neutral-800/70 rounded flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-semibold ${
                          order.status === 'PAID'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                            : order.status === 'SHIPPED'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : order.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 truncate mt-1">
                      {order.customerName} ({order.customerEmail})
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate font-mono">
                      {order.itemsPreview.slice(0, 2).join(', ') || `${order.itemCount} item(s)`}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white font-mono">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-mono mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Reviews & Moderation */}
        <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Customer Testimonials
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Public approval moderation desk</p>
            </div>
            <Link
              to="/admin/reviews"
              className="flex items-center gap-1 text-xs uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors font-mono"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentReviews.length === 0 ? (
              <p className="text-neutral-400 text-xs py-8 text-center font-mono">
                No customer reviews submitted yet.
              </p>
            ) : (
              recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-neutral-900/50 border border-neutral-800/70 rounded space-y-2 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-orange-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-orange-400" />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-300 font-medium">{rev.author}</span>
                    </div>

                    <button
                      onClick={() => handleToggleReview(rev.id, rev.isApproved)}
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                        rev.isApproved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {rev.isApproved ? 'Approved' : 'Unapproved'}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 italic">
                    "{rev.content}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span className="truncate max-w-[200px]">On: {rev.productTitle}</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
