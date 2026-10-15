import { useEffect, useState } from 'react';
import axios from 'axios';
import { FolderKanban, Plus, Edit, Trash2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import ImageUploadDropzone from '../../components/admin/ImageUploadDropzone';

interface ProductBrief {
  id: string;
  title: string;
  slug: string;
  images: string[];
}

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  productCount: number;
  products: ProductBrief[];
  createdAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form / Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const [colRes, prodRes] = await Promise.all([
        axios.get('/api/admin/collections', { withCredentials: true }),
        axios.get('/api/products?limit=100', { withCredentials: true })
      ]);

      if (colRes.data?.success) {
        setCollections(colRes.data.collections || []);
      }
      if (prodRes.data?.success) {
        setAllProducts(prodRes.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError('Could not retrieve curated collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setCoverImage('');
    setSelectedProductIds([]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (col: CollectionItem) => {
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setCoverImage(col.coverImage || '');
    setSelectedProductIds(col.products.map((p) => p.id));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Collection name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        coverImage: coverImage.trim() || null,
        productIds: selectedProductIds
      };

      if (editingCollection) {
        await axios.put(`/api/admin/collections/${editingCollection.id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`/api/admin/collections`, payload, { withCredentials: true });
      }

      setModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      console.error('Failed to save collection:', err);
      setFormError(err.response?.data?.message || 'Failed to save collection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? Products will remain in the catalog.')) return;
    try {
      await axios.delete(`/api/admin/collections/${id}`, { withCredentials: true });
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete collection.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Curated Collections
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Seasonal drops, architectural curations, and lookbook groupings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase tracking-[0.18em] font-bold transition-colors rounded shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Collection</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
            Loading Collections...
          </p>
        </div>
      ) : collections.length === 0 ? (
        <div className="p-12 text-center bg-[#121215] border border-neutral-800 rounded">
          <FolderKanban className="w-8 h-8 text-neutral-500 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm text-neutral-300">No collections configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                {/* Cover Asset */}
                <div className="h-44 bg-black relative border-b border-neutral-800">
                  {col.coverImage ? (
                    <img
                      src={col.coverImage}
                      alt={col.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">No Cover Asset</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-neutral-700 text-[10px] font-mono text-orange-400 rounded">
                    {col.productCount} {col.productCount === 1 ? 'garment' : 'garments'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-white text-base tracking-wider uppercase">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    slug: /{col.slug}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {col.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-900/50 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(col.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(col)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                    title="Edit Collection"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#121215] border border-neutral-800 rounded max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {editingCollection ? 'Edit Collection' : 'Create Collection'}
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
                Collection Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Winter 2026: The Architecture of Black"
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Collection Cover Image (Cloudinary)
              </label>

              {/* Cloudinary Dropzone */}
              <ImageUploadDropzone
                multiple={false}
                folder="phantom/collections"
                label="Upload Cover Photography"
                subLabel="Optimized automatically via Cloudinary f_auto & q_auto"
                compact={true}
                onUploadSuccess={(urls) => {
                  if (urls[0]) setCoverImage(urls[0]);
                }}
              />

              {/* Preview & Manual URL fallback */}
              {coverImage && (
                <div className="mt-2.5 p-2 bg-black border border-neutral-800 rounded flex items-center gap-3">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-12 h-12 object-cover rounded border border-neutral-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-neutral-400 truncate font-mono">{coverImage}</p>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="text-[10px] text-red-400 hover:text-red-300 underline font-mono mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste external HTTPS image URL"
                className="w-full mt-2 px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
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
                placeholder="A study of structural silhouettes, monolithic cuts, and heavyweight wool..."
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            {/* Select Products */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Associate Garments ({selectedProductIds.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-black border border-neutral-800 rounded">
                {allProducts.map((p) => {
                  const checked = selectedProductIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2.5 p-1.5 rounded hover:bg-neutral-900 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                          } else {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          }
                        }}
                        className="accent-orange-500"
                      />
                      <span className="text-neutral-200 truncate">{p.title}</span>
                    </label>
                  );
                })}
              </div>
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
                {submitting ? 'Saving...' : 'Save Collection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
