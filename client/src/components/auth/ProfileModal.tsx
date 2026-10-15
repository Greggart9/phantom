import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, User, Mail, Globe, Shield, Check, AlertCircle, Calendar, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setCountry(user.country || '');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateProfile({ fullName, country });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Your details have been updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Phantom Member';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProfileModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#121110] border border-neutral-800 text-white p-6 sm:p-9 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeProfileModal}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-neutral-800">
            <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-lg font-bold text-orange-500 uppercase tracking-wider shrink-0">
              {fullName.charAt(0) || user.email.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-semibold">
                PHANTOM PROFILE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {user.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-800 rounded">
                  {user.role}
                </span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-normal">
                  <Calendar className="w-3 h-3" /> Since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback banners */}
          {successMsg && (
            <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Editable Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5">
                Email Address (Registered)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-neutral-950/60 border border-neutral-800 text-neutral-500 pl-10 pr-4 py-2.5 text-xs cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Your email is associated with your Phantom orders and cannot be changed here.
              </p>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5">
                Country / Delivery Region
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United Kingdom, United States, Japan"
                  className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'SAVING CHANGES...' : 'SAVE DETAILS'}</span>
              </button>
            </div>
          </form>

          {/* Dedicated Orders Quick Access */}
          <div className="mt-4">
            <Link
              to="/account/orders"
              onClick={closeProfileModal}
              className="w-full py-3 px-4 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs tracking-wider uppercase transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-white">Your Orders & Deliveries</span>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white transition-colors">
                View & Track &rarr;
              </span>
            </Link>
          </div>

          {/* Account Security & Sign Out Section */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              <span>Encrypted Authentication</span>
            </div>

            <button
              type="button"
              onClick={() => {
                closeProfileModal();
                logout();
              }}
              className="text-xs text-neutral-400 hover:text-orange-500 tracking-wider uppercase underline underline-offset-4 cursor-pointer transition-colors"
            >
              Sign out from account
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
