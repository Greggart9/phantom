import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Check,
  ExternalLink
} from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  stockQuantity: number;
  isSoldOut: boolean;
  images: string[];
  category: { id: string; name: string; slug: string };
  collections: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'SOLD_OUT'>('ALL');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products?limit=100', { withCredentials: true }),
        axios.get('/api/admin/categories', { withCredentials: true })
      ]);

      if (prodRes.data?.success) {
        setProducts(prodRes.data.products || []);
      }
      if (catRes.data?.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuickStockSave = async (id: string) => {
    try {
      const res = await axios.patch(
        `/api/products/${id}/stock`,
        { stockQuantity: Number(stockInput) },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  stockQuantity: Number(stockInput),
                  isSoldOut: Number(stockInput) <= 0
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setEditingStockId(null);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/products/${deletingId}`, { withCredentials: true });
      setProducts((prev) => prev.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || p.category?.id === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') matchesStock = p.stockQuantity > 0;
      if (stockFilter === 'LOW_STOCK') matchesStock = p.stockQuantity > 0 && p.stockQuantity < 5;
      if (stockFilter === 'SOLD_OUT') matchesStock = p.stockQuantity <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Garment Inventory
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Manage product editions, photography galleries, sizing, and dynamic attributes.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase tracking-[0.18em] font-bold transition-colors rounded shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, edition, category..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-neutral-800 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121215] border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div className="flex items-center bg-[#121215] border border-neutral-800 rounded p-1 text-[11px] font-mono">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockFilter === 'ALL' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('IN_STOCK')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockFilter === 'IN_STOCK' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('LOW_STOCK')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockFilter === 'LOW_STOCK' ? 'bg-amber-950/60 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Low Stock (&lt;5)
            </button>
            <button
              onClick={() => setStockFilter('SOLD_OUT')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockFilter === 'SOLD_OUT' ? 'bg-red-950/60 text-red-400 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sold Out
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
              Loading Products Catalog...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto stroke-[1.5]" />
            <p className="text-sm text-neutral-300 font-medium">No products match your criteria</p>
            <p className="text-xs text-neutral-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#0d0d10] text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-mono">
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory Status</th>
                  <th className="py-3 px-4">Gallery</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {filteredProducts.map((p) => {
                  const isSoldOut = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity < 5;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-800/20 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-neutral-800">
                            {p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-600">
                                None
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white truncate block">
                                {p.title}
                              </span>
                              {p.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-950/60 text-orange-400 border border-orange-500/30 uppercase font-mono tracking-wider">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono truncate block mt-0.5">
                              /product/{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-neutral-300">
                        <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        ${p.price.toFixed(2)}
                        {p.originalPrice && (
                          <span className="text-[10px] text-neutral-400 line-through block">
                            ${p.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity & Quick Edit */}
                      <td className="py-3.5 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockInput}
                              onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-black border border-orange-500 rounded text-xs text-white font-mono focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleQuickStockSave(p.id)}
                              className="p-1 rounded bg-orange-500 text-black hover:bg-orange-400"
                              title="Save stock"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold ${
                                isSoldOut
                                  ? 'bg-red-950/70 text-red-400 border border-red-800/40'
                                  : isLowStock
                                  ? 'bg-amber-950/70 text-amber-400 border border-amber-800/40'
                                  : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out (0)' : isLowStock ? `Low (${p.stockQuantity})` : `In Stock (${p.stockQuantity})`}
                            </span>

                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setStockInput(p.stockQuantity);
                              }}
                              className="text-[10px] text-neutral-400 hover:text-orange-400 underline decoration-dotted font-mono"
                              title="Click to quick-adjust stock units"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Images count */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                        {p.images.length} {p.images.length === 1 ? 'asset' : 'assets'}
                        {p.images.length < 3 && (
                          <span className="text-[10px] text-amber-400 block font-mono">
                            &lt; 3 photos
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 rounded transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeletingId(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Deletion Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-neutral-800 rounded max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              Permanently Remove Garment?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This action cannot be undone. The edition will be purged from the catalog, collections, and storefront immediately.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-neutral-800 text-neutral-300 text-xs uppercase tracking-wider rounded hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider rounded font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
