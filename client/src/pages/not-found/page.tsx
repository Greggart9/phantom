import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xl">
        {/* Large 404 */}
        <h1 className="text-[120px] sm:text-[160px] font-normal leading-none tracking-tighter text-white/10 select-none">
          404
        </h1>

        {/* Message */}
        <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-400 mt-4 mb-3">
          Page not found
        </p>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          The piece you're looking for may have been moved, archived, or doesn't exist in our collection.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className="px-8 py-3 bg-white text-neutral-950 text-xs font-medium tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors"
          >
            Browse the shop
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white tracking-wider uppercase transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
