import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  AlertCircle,
  Palette
} from 'lucide-react';
import ImageUploadDropzone from '../../components/admin/ImageUploadDropzone';

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface ColorOption {
  name: string;
  hex: string;
  inStock: boolean;
}

interface Specification {
  label: string;
  value: string;
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Basic Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [badge, setBadge] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'NEW',
    'BEST SELLER',
    'LIMITED',
    'SOLD OUT',
    'ARCHIVE',
    'RUNWAY'
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [categoryId, setCategoryId] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  // Images (min 3)
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Dynamic Colors
  const [colors, setColors] = useState<ColorOption[]>([
    { name: 'Obsidian Black', hex: '#0a0a0a', inStock: true }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1a1a1a');

  // Dynamic Sizes
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL']);
  const [newCustomSize, setNewCustomSize] = useState('');

  // Rich Details
  const [materials, setMaterials] = useState('');
  const [care, setCare] = useState('');
  const [shippingInfo, setShippingInfo] = useState('');
  const [storyParagraphs, setStoryParagraphs] = useState<string[]>([
    'Tailored in northern Italy from double-faced virgin wool, structured with architectural precision and finished with hand-set hardware.'
  ]);
  const [specifications, setSpecifications] = useState<Specification[]>([
    { label: 'Origin', value: 'Biella, Italy' },
    { label: 'Fabric Weight', value: '460 GSM' }
  ]);

  // Master options
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Page state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Categories & Collections + Product if editing
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, colRes] = await Promise.all([
          axios.get('/api/admin/categories', { withCredentials: true }),
          axios.get('/api/admin/collections', { withCredentials: true })
        ]);

        if (catRes.data?.success) setCategories(catRes.data.categories || []);
        if (colRes.data?.success) setCollections(colRes.data.collections || []);

        if (isEditing) {
          let current: any = null;
          try {
            const singleRes = await axios.get(`/api/products/${id}`, { withCredentials: true });
            if (singleRes.data?.success && singleRes.data.product) {
              current = singleRes.data.product;
            }
          } catch {
            // fallback
          }

          if (!current) {
            const prodRes = await axios.get(`/api/products?limit=100`, { withCredentials: true });
            const allProds = prodRes.data?.products || [];
            current = allProds.find((p: any) => p.id === id || p.slug === id);
          }

          if (current) {
            setTitle(current.title || '');
            setDescription(current.description || '');
            setPrice(current.price ?? '');
            setOriginalPrice(current.originalPrice ?? '');
            setBadge(current.badge || '');
            setStockQuantity(current.stockQuantity ?? 0);
            setCategoryId(current.category?.id || '');
            setSelectedCollectionIds(current.collections?.map((c: any) => c.id) || []);
            setImages(current.images || []);
            if (Array.isArray(current.colors) && current.colors.length > 0) {
              setColors(current.colors);
            }
            if (Array.isArray(current.sizes) && current.sizes.length > 0) {
              setSizes(current.sizes);
            }
            setMaterials(current.materials || '');
            setCare(current.care || '');
            setShippingInfo(current.shippingInfo || '');
            if (Array.isArray(current.storyParagraphs) && current.storyParagraphs.length > 0) {
              setStoryParagraphs(current.storyParagraphs);
            }
            if (Array.isArray(current.specifications) && current.specifications.length > 0) {
              setSpecifications(current.specifications);
            }
          }
        } else if (catRes.data?.categories?.length > 0) {
          setCategoryId(catRes.data.categories[0].id);
        }
      } catch (err: any) {
        console.error('Failed to initialize form:', err);
        setError('Could not load existing garment data.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditing]);

  // Images Helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setImages(copy);
  };

  // Color Helpers
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex, inStock: true }]);
    setNewColorName('');
  };

  const handleToggleColorStock = (index: number) => {
    setColors(
      colors.map((c, i) => (i === index ? { ...c, inStock: !c.inStock } : c))
    );
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Size Helpers
  const handleToggleSize = (sizeKey: string) => {
    if (sizes.includes(sizeKey)) {
      setSizes(sizes.filter((s) => s !== sizeKey));
    } else {
      setSizes([...sizes, sizeKey]);
    }
  };

  const handleAddCustomSize = () => {
    if (!newCustomSize.trim()) return;
    if (!sizes.includes(newCustomSize.trim())) {
      setSizes([...sizes, newCustomSize.trim()]);
    }
    setNewCustomSize('');
  };

  // Specs Helpers
  const handleAddSpec = () => {
    setSpecifications([...specifications, { label: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', text: string) => {
    setSpecifications(
      specifications.map((s, i) => (i === index ? { ...s, [field]: text } : s))
    );
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Story Helpers
  const handleAddStoryParagraph = () => {
    setStoryParagraphs([...storyParagraphs, '']);
  };

  const handleStoryChange = (index: number, text: string) => {
    setStoryParagraphs(storyParagraphs.map((p, i) => (i === index ? text : p)));
  };

  const handleRemoveStory = (index: number) => {
    setStoryParagraphs(storyParagraphs.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setError('Please specify a valid positive price.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one product image (minimum 3 recommended).');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || title.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      badge: badge.trim() || null,
      stockQuantity: Number(stockQuantity),
      categoryId,
      collectionIds: selectedCollectionIds,
      images,
      colors: colors.length > 0 ? colors : null,
      sizes: sizes,
      materials: materials.trim() || null,
      care: care.trim() || null,
      shippingInfo: shippingInfo.trim() || null,
      storyParagraphs: storyParagraphs.filter((p) => p.trim().length > 0),
      specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
      isPublished: true
    };

    try {
      setSaving(true);
      if (isEditing) {
        await axios.put(`/api/products/${id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`/api/products`, payload, { withCredentials: true });
      }
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.response?.data?.message || 'Failed to save product in database.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
          Loading Garment Specifications...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/products"
            className="p-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">
              {isEditing ? 'Edit Garment Edition' : 'Create Phantom Edition'}
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {isEditing ? `ID: ${id}` : 'All fields dynamically populate the luxury storefront.'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs uppercase tracking-[0.18em] font-bold rounded transition-colors shadow-sm"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>{saving ? 'Preserving...' : 'Save Edition'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Column (Basics + Pricing + Gallery) & Right Column (Accordions, Colors, Specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Info */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3">
              1. Primary Details
            </h2>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Garment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Obsidian Trench Coat"
                className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-neutral-600"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                    Editorial Tag / Badge
                  </label>
                  {badge && (
                    <button
                      type="button"
                      onClick={() => setBadge('')}
                      className="text-[10px] text-neutral-500 hover:text-red-400 font-mono"
                    >
                      Clear Tag (none)
                    </button>
                  )}
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {availableTags.map((t) => {
                    const isSelected = badge === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBadge(isSelected ? '' : t)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-all border ${
                          isSelected
                            ? 'bg-orange-500 text-black border-orange-500 font-bold shadow-sm'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        {isSelected ? `${t} ✓` : t}
                      </button>
                    );
                  })}
                </div>

                {/* Create Custom Tag Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value.toUpperCase())}
                    placeholder="Create custom tag (e.g. RUNWAY)..."
                    className="flex-1 px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white uppercase font-mono placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = customTagInput.trim().toUpperCase();
                      if (!trimmed) return;
                      if (!availableTags.includes(trimmed)) {
                        setAvailableTags([...availableTags, trimmed]);
                      }
                      setBadge(trimmed);
                      setCustomTagInput('');
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-mono uppercase rounded transition-colors font-semibold"
                  >
                    + Add
                  </button>
                </div>

                {/* Status Indicator */}
                {badge === 'SOLD OUT' && (
                  <p className="text-[10px] text-red-400 font-mono mt-1">
                    Marked as Sold Out: Storefront action will be locked to 'SOLD OUT'.
                  </p>
                )}
                {badge === 'LIMITED' && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1">
                    Marked as Limited Edition: Garment displays rare archival indicator.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Overview Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief editorial summary of silhouette, cut, and texture..."
                className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Card: Pricing & Stock Control */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3">
              2. Financials & Physical Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="850.00"
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Original Price ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="Optional crossed-out price"
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Stock Units (0 = Sold Out)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white font-mono focus:outline-none focus:border-neutral-600"
                />
                <p className="text-[10px] text-neutral-400 font-mono mt-1">
                  {stockQuantity <= 0 ? (
                    <span className="text-red-400 font-semibold">Will display 'SOLD OUT' button</span>
                  ) : (
                    <span className="text-emerald-400">In Stock: Add to Cart active</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Multi-Image Photography Gallery (Min 3) */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono">
                  3. Photography Assets (Min 3 Enforced)
                </h2>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Current: {images.length} photos {images.length < 3 && '(At least 3 required)'}
                </p>
              </div>
            </div>

            {/* Cloudinary Direct File Upload Dropzone */}
            <ImageUploadDropzone
              multiple={true}
              maxFiles={8}
              folder="phantom/products"
              label="Upload Product Images (Cloudinary CDN)"
              subLabel="Auto-optimized with f_auto, q_auto for instant loading and lossless visual quality."
              onUploadSuccess={(uploadedUrls) => {
                setImages((prev) => [...prev, ...uploadedUrls]);
              }}
            />

            {/* Manual URL input bar */}
            <div className="pt-2">
              <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">
                Or Add Image by External URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="e.g. /images/products/coat-01.jpg or HTTPS URL"
                  className="flex-1 px-3.5 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs uppercase tracking-wider rounded font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Gallery Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="group relative bg-black border border-neutral-800 rounded overflow-hidden aspect-[3/4] flex flex-col justify-between"
                >
                  <img
                    src={imgUrl}
                    alt={`Asset ${index + 1}`}
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Primary Badge */}
                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-neutral-700 text-[9px] uppercase tracking-wider font-mono text-white rounded">
                      Cover
                    </span>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'up')}
                        title="Move Left / Earlier"
                        className="p-1.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded text-white"
                      >
                        <MoveUp className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'down')}
                        title="Move Right / Later"
                        className="p-1.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded text-white"
                      >
                        <MoveDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove image"
                      className="p-1.5 bg-red-950/80 border border-red-700 hover:bg-red-900 rounded text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {images.length < 3 && (
              <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Phantom aesthetic requires at least 3 high-resolution angles per garment.</span>
              </p>
            )}
          </div>

          {/* Card: Editorial Storytelling */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono">
                  4. Editorial Provenance (Story Paragraphs)
                </h2>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Narrative sections shown on the garment detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStoryParagraph}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] uppercase tracking-wider rounded font-mono flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Paragraph</span>
              </button>
            </div>

            <div className="space-y-3">
              {storyParagraphs.map((para, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    rows={2}
                    value={para}
                    onChange={(e) => handleStoryChange(idx, e.target.value)}
                    placeholder={`Paragraph ${idx + 1} craft notes, textile heritage...`}
                    className="flex-1 px-3.5 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                  {storyParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStory(idx)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Card: Dynamic Color Swatches */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-orange-400" />
              <span>Color Variants</span>
            </h2>

            {/* List of active colors */}
            <div className="space-y-2">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-black border border-neutral-800 rounded text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-neutral-700 flex-shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <span className="font-medium text-white block">{c.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{c.hex}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleColorStock(i)}
                      className={`text-[9px] px-2 py-0.5 rounded uppercase font-mono font-bold ${
                        c.inStock
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {c.inStock ? 'Stocked' : 'Out'}
                    </button>
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(i)}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add color input */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-9 p-0 bg-transparent border border-neutral-800 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="e.g. Chalk White"
                  className="flex-1 px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddColor}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs uppercase tracking-wider rounded font-mono font-semibold transition-colors"
              >
                + Add Swatch
              </button>
            </div>
          </div>

          {/* Card: Available Sizes */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3">
              Size Options
            </h2>

            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'].map((sKey) => {
                const isSelected = sizes.includes(sKey);
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => handleToggleSize(sKey)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-black border-orange-500'
                        : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {sKey}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newCustomSize}
                onChange={(e) => setNewCustomSize(e.target.value)}
                placeholder="Custom (e.g. 42 IT)"
                className="flex-1 px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono uppercase rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* Card: Collections Association */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3">
              Curated Collections
            </h2>

            <div className="space-y-2">
              {collections.map((col) => {
                const checked = selectedCollectionIds.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2.5 p-2 bg-black border border-neutral-800 rounded cursor-pointer hover:border-neutral-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedCollectionIds(
                            selectedCollectionIds.filter((cid) => cid !== col.id)
                          );
                        } else {
                          setSelectedCollectionIds([...selectedCollectionIds, col.id]);
                        }
                      }}
                      className="accent-orange-500"
                    />
                    <span className="text-xs text-neutral-200">{col.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card: Technical Specifications */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono">
                Technical Specs
              </h2>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-[11px] text-orange-400 hover:text-orange-300 uppercase font-mono"
              >
                + Spec
              </button>
            </div>

            <div className="space-y-2.5">
              {specifications.map((spec, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(i, 'label', e.target.value)}
                    placeholder="Label (e.g. Fit)"
                    className="w-1/3 px-2.5 py-1.5 bg-black border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                    placeholder="Value (e.g. Boxy)"
                    className="flex-1 px-2.5 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="text-neutral-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Accordion Texts */}
          <div className="p-6 bg-[#121215] border border-neutral-800/80 rounded space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 font-mono border-b border-neutral-800 pb-3">
              Accordion Panels
            </h2>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Materials & Composition
              </label>
              <textarea
                rows={2}
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="100% Virgin Wool, 460 GSM..."
                className="w-full px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Care Instructions
              </label>
              <textarea
                rows={2}
                value={care}
                onChange={(e) => setCare(e.target.value)}
                placeholder="Specialist dry clean only. Store on wide wooden hanger..."
                className="w-full px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Shipping & Returns
              </label>
              <textarea
                rows={2}
                value={shippingInfo}
                onChange={(e) => setShippingInfo(e.target.value)}
                placeholder="Complimentary DHL Express worldwide shipping (2-4 business days)..."
                className="w-full px-3 py-1.5 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
