import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle,
  ChevronRight,
  Save,
  Trash2
} from 'lucide-react';

interface OrderItem {
  id: string;
  product: { id: string; title: string; slug: string; images: string[] } | null;
  quantity: number;
  unitPrice: number;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  user: { id: string; fullName: string; email: string; country: string | null };
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentIntentId: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  shippingAddress: any;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Fulfillment update form state inside modal
  const [newStatus, setNewStatus] = useState<string>('');
  const [newTracking, setNewTracking] = useState<string>('');
  const [newCarrier, setNewCarrier] = useState<string>('DHL Express');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Order #${orderNumber}?\n\nThis will remove the order record from PostgreSQL and cascade all associated items. This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(orderId);
      const res = await axios.delete(`/api/admin/orders/${orderId}`, { withCredentials: true });
      if (res.data?.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete order:', err);
      alert(err.response?.data?.message || 'Failed to delete order.');
    } finally {
      setIsDeleting(null);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders', { withCredentials: true });
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetail = (order: OrderRecord) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setNewCarrier(order.carrier || 'DHL Express');
    setUpdateSuccess(false);
  };

  const handleUpdateFulfillment = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const res = await axios.put(
        `/api/admin/orders/${selectedOrder.id}/status`,
        {
          status: newStatus,
          trackingNumber: newTracking,
          carrier: newCarrier
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: newStatus as any,
                  trackingNumber: newTracking || null,
                  carrier: newCarrier
                }
              : o
          )
        );
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus as any,
                trackingNumber: newTracking || null,
                carrier: newCarrier
              }
            : null
        );
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update order fulfillment:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.user.email.toLowerCase().includes(search.toLowerCase()) ||
        o.user.fullName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Client Order Fulfillment
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Dispatch verification, DHL express tracking assignment, and courier manifests.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, email..."
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-neutral-800 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center bg-[#121215] border border-neutral-800 rounded p-1 text-[11px] font-mono">
          {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
              Loading Orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-neutral-500 mx-auto stroke-[1.5]" />
            <p className="text-sm text-neutral-300 font-medium">No orders found</p>
            <p className="text-xs text-neutral-500">No client acquisitions match this query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#0d0d10] text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-mono">
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Courier & Tracking</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs font-mono">
                {filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openOrderDetail(order)}
                      className="hover:bg-neutral-800/30 transition-colors cursor-pointer"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        #{order.orderNumber}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <span className="font-sans font-medium text-white block">
                          {order.shippingAddress?.firstName
                            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim()
                            : order.user.fullName}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          {order.shippingAddress?.email || order.user.email}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
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
                      </td>

                      {/* Tracking */}
                      <td className="py-3.5 px-4 text-neutral-300">
                        {order.trackingNumber ? (
                          <div className="flex items-center gap-1.5 text-orange-400">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{order.trackingNumber}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrder(order.id, order.orderNumber);
                            }}
                            disabled={isDeleting === order.id}
                            title="Delete Order"
                            className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Fulfillment Slideover / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-neutral-800 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] text-orange-400 uppercase tracking-widest font-mono">
                  Phantom Dispatch Desk
                </span>
                <h2 className="text-lg font-bold uppercase tracking-wider text-white font-mono mt-0.5">
                  Order #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-black border border-neutral-800 rounded space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">
                Update Fulfillment & DHL Tracking
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#121215] border border-neutral-700 rounded text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                    Courier Carrier
                  </label>
                  <input
                    type="text"
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value)}
                    placeholder="DHL Express"
                    className="w-full px-2.5 py-1.5 bg-[#121215] border border-neutral-700 rounded text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    placeholder="e.g. DHL-984710294"
                    className="w-full px-2.5 py-1.5 bg-[#121215] border border-neutral-700 rounded text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {updateSuccess ? (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Fulfillment updated & synced!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Tracking updates automatically reflect in client's 'My Orders' portal.
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isDeleting === selectedOrder.id}
                    onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting === selectedOrder.id ? 'Deleting...' : 'Delete Order'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateFulfillment}
                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs uppercase tracking-wider font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isUpdating ? 'Saving...' : 'Save Dispatch'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Client & Address Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-black border border-neutral-800 rounded space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
                  Client Information
                </span>
                <p className="font-semibold text-white">
                  {selectedOrder.shippingAddress?.firstName
                    ? `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName || ''}`.trim()
                    : selectedOrder.user.fullName || 'Collector'}
                </p>
                <p className="text-neutral-400 font-mono">
                  {selectedOrder.shippingAddress?.email || selectedOrder.user.email}
                </p>
                {selectedOrder.shippingAddress?.phone && (
                  <p className="text-neutral-400 font-mono">
                    Tel: {selectedOrder.shippingAddress.phone}
                  </p>
                )}
                <p className="text-neutral-400 font-mono">
                  Account Country: {selectedOrder.user.country || 'Not specified'}
                </p>
                {selectedOrder.paymentIntentId && (
                  <p className="text-[10px] text-neutral-400 font-mono truncate pt-1">
                    Stripe PI: {selectedOrder.paymentIntentId}
                  </p>
                )}
              </div>

              <div className="p-4 bg-black border border-neutral-800 rounded space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
                  Delivery Destination
                </span>
                {selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress === 'object' ? (
                  <div className="text-neutral-300 space-y-0.5">
                    <p>
                      {selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street || 'Primary Address'}
                      {selectedOrder.shippingAddress.apartment ? `, ${selectedOrder.shippingAddress.apartment}` : ''}
                    </p>
                    <p>
                      {[
                        selectedOrder.shippingAddress.city,
                        selectedOrder.shippingAddress.state,
                        selectedOrder.shippingAddress.postcode || selectedOrder.shippingAddress.postalCode
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p className="uppercase font-mono text-[11px] text-neutral-400">
                      {selectedOrder.shippingAddress.country || 'Portugal'}
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-400">Direct courier handover</p>
                )}
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">
                Acquired Items ({selectedOrder.orderItems.length})
              </h3>
              <div className="divide-y divide-neutral-800/80 border border-neutral-800 rounded bg-black overflow-hidden">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.product?.title || 'Garment'}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right pt-2 font-mono">
                <span className="text-xs text-neutral-400 mr-2">Order Total:</span>
                <span className="text-base font-bold text-white">
                  ${selectedOrder.totalAmount.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
