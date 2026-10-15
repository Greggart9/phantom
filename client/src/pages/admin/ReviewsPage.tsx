import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { MessageSquare, Star, Trash2, Search } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  content: string;
  isApproved: boolean;
  author: string;
  email: string;
  product: { id: string; title: string; slug: string; images: string[] } | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/reviews', { withCredentials: true });
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentApproval: boolean) => {
    try {
      const res = await axios.patch(
        `/api/admin/reviews/${id}/approval`,
        { isApproved: !currentApproval },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentApproval } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update review approval:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this testimonial?')) return;
    try {
      await axios.delete(`/api/admin/reviews/${id}`, { withCredentials: true });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.author.toLowerCase().includes(search.toLowerCase()) ||
        r.content.toLowerCase().includes(search.toLowerCase()) ||
        (r.product?.title || '').toLowerCase().includes(search.toLowerCase());

      let matchesApproval = true;
      if (approvalFilter === 'APPROVED') matchesApproval = r.isApproved;
      if (approvalFilter === 'PENDING') matchesApproval = !r.isApproved;

      return matchesSearch && matchesApproval;
    });
  }, [reviews, search, approvalFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Client Testimonials & Feedback
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Moderate, approve, and verify client acquisition impressions.
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
            placeholder="Search feedback, client, product..."
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-neutral-800 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#121215] border border-neutral-800 rounded p-1 text-[11px] font-mono">
          <button
            onClick={() => setApprovalFilter('ALL')}
            className={`px-3 py-1 rounded transition-colors ${
              approvalFilter === 'ALL'
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setApprovalFilter('APPROVED')}
            className={`px-3 py-1 rounded transition-colors ${
              approvalFilter === 'APPROVED'
                ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Approved ({reviews.filter((r) => r.isApproved).length})
          </button>
          <button
            onClick={() => setApprovalFilter('PENDING')}
            className={`px-3 py-1 rounded transition-colors ${
              approvalFilter === 'PENDING'
                ? 'bg-amber-950 text-amber-400 font-bold border border-amber-800/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Awaiting ({reviews.filter((r) => !r.isApproved).length})
          </button>
        </div>
      </div>

      {/* Reviews Table / Grid */}
      <div className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
              Loading Testimonials...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-neutral-500 mx-auto stroke-[1.5]" />
            <p className="text-sm text-neutral-300 font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/20 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex text-orange-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-neutral-600'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="font-semibold text-white text-xs">{rev.author}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">({rev.email})</span>

                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold ${
                        rev.isApproved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}
                    >
                      {rev.isApproved ? 'Publicly Visible' : 'Unapproved'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed italic max-w-3xl">
                    "{rev.content}"
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-mono">
                    <span>
                      Garment:{' '}
                      <strong className="text-neutral-300 font-sans">
                        {rev.product?.title || 'Unknown Garment'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Submitted on {new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleToggleApproval(rev.id, rev.isApproved)}
                    className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider font-bold transition-colors ${
                      rev.isApproved
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {rev.isApproved ? 'Withdraw Approval' : 'Approve Testimonial'}
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
