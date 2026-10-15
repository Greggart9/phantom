import { useEffect, useState } from 'react';
import axios from 'axios';
import { Tag, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/categories', { withCredentials: true });
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError('Could not retrieve category taxonomy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      if (editingCategory) {
        await axios.put(
          `/api/admin/categories/${editingCategory.id}`,
          { name: name.trim(), description: description.trim() || null },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `/api/admin/categories`,
          { name: name.trim(), description: description.trim() || null },
          { withCredentials: true }
        );
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setFormError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete category: it is assigned to ${productCount} garment(s). Reassign them first.`);
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`/api/admin/categories/${id}`, { withCredentials: true });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Category Taxonomy
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Dynamic catalog departments: Outerwear, Tailoring, Knitwear, Leather, Objects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase tracking-[0.18em] font-bold transition-colors rounded shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
            Loading Taxonomy...
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-[#121215] border border-neutral-800 rounded">
          <Tag className="w-8 h-8 text-neutral-500 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm text-neutral-300">No categories created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-[#121215] border border-neutral-800/80 rounded space-y-3 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base tracking-wider uppercase">
                    {c.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-black border border-neutral-800 text-[10px] font-mono text-orange-400">
                    {c.productCount} {c.productCount === 1 ? 'garment' : 'garments'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mb-2">
                  slug: /{c.slug}
                </p>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/60">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  title="Edit category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.productCount)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#121215] border border-neutral-800 rounded max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded border border-red-500/30">
                {formError}
              </p>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Outerwear, Leather Goods, Objects"
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Architectural jackets, overcoats, and protective layers..."
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs uppercase tracking-wider rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs uppercase tracking-wider font-bold rounded"
              >
                {submitting ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
