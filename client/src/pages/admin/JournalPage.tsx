import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, AlertCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import ImageUploadDropzone from '../../components/admin/ImageUploadDropzone';

interface JournalItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  author: string | null;
  readTime: string | null;
  category: string | null;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function JournalPage() {
  const [posts, setPosts] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form / Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalItem | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Phantom');
  const [readTime, setReadTime] = useState('5 min read');
  const [category, setCategory] = useState('EXHIBITION');
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/journal', { withCredentials: true });
      if (res.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load journal posts:', err);
      setError('Could not retrieve journal chronicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setAuthor('Phantom');
    setReadTime('5 min read');
    setCategory('EXHIBITION');
    setIsPublished(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: JournalItem) => {
    setEditingPost(p);
    setTitle(p.title);
    setExcerpt(p.excerpt || '');
    setContent(p.content);
    setCoverImage(p.coverImage || '');
    setAuthor(p.author || 'Phantom');
    setReadTime(p.readTime || '5 min read');
    setCategory(p.category || 'EXHIBITION');
    setIsPublished(p.isPublished);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content body are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        author: author.trim() || 'Phantom',
        readTime: readTime.trim() || '5 min read',
        category: category.trim() || 'EXHIBITION',
        isPublished
      };

      if (editingPost) {
        await axios.put(`/api/admin/journal/${editingPost.id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`/api/admin/journal`, payload, { withCredentials: true });
      }

      setModalOpen(false);
      fetchJournal();
    } catch (err: any) {
      console.error('Failed to save journal post:', err);
      setFormError(err.response?.data?.message || 'Failed to save chronicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chronicle?')) return;
    try {
      await axios.delete(`/api/admin/journal/${id}`, { withCredentials: true });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete chronicle.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Editorial Chronicles & Journal
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Publish exhibition reviews, material monographs, and design essays.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase tracking-[0.18em] font-bold transition-colors rounded shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Chronicle</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Journal Posts Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
            Loading Chronicles...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-[#121215] border border-neutral-800 rounded">
          <BookOpen className="w-8 h-8 text-neutral-500 mx-auto mb-3 stroke-[1.5]" />
          <p className="text-sm text-neutral-300">No journal posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="h-44 bg-black relative border-b border-neutral-800">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-mono uppercase tracking-wider">No Cover</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-neutral-700 text-[9px] uppercase tracking-wider font-mono text-orange-400 rounded">
                    {post.category || 'CHRONICLE'}
                  </span>
                  <span
                    className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                      post.isPublished
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : 'bg-neutral-900/80 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-white text-base tracking-wider uppercase line-clamp-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span>{post.author || 'Phantom'}</span>
                    <span>•</span>
                    <span>{post.readTime || '5 min'}</span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {post.excerpt || post.content.slice(0, 120) + '...'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-900/50 border-t border-neutral-800/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/journal/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                    title="View Story"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => openEditModal(post)}
                    className="p-1.5 text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 rounded transition-colors"
                    title="Edit Story"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                    title="Delete Story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Chronicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#121215] border border-neutral-800 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                {editingPost ? 'Edit Chronicle Story' : 'Draft New Chronicle'}
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
                Chronicle Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monolith: Reflections on Heavyweight Italian Wool"
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="EXHIBITION, ARCHIVE"
                  className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Phantom"
                  className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                  Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Chronicle Cover Image (Cloudinary)
              </label>

              {/* Cloudinary Dropzone */}
              <ImageUploadDropzone
                multiple={false}
                folder="phantom/journal"
                label="Upload Chronicle Photography"
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
                Short Excerpt
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise opening teaser for social links and article cards..."
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1">
                Content Body *
              </label>
              <textarea
                rows={8}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full article content (supports paragraphs, markdown, and text)..."
                className="w-full px-3 py-2 bg-black border border-neutral-800 rounded text-xs text-white focus:outline-none font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublishedCheck"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="accent-orange-500"
              />
              <label htmlFor="isPublishedCheck" className="text-xs text-neutral-300 cursor-pointer">
                Publish immediately to the live journal
              </label>
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
                {submitting ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
