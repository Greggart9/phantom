import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setErrorMessage('Password must contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      if (res.data?.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.data?.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid or expired password reset link. Please request a new one.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#0c0b0a] text-white">
      <div className="max-w-md w-full p-8 sm:p-10 border border-neutral-800 bg-[#141312] rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-orange-500 mb-4">
            <KeyRound className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-orange-500 font-mono">
            SECURITY & ACCESS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-white">
            Set New Password
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Please choose a strong alphanumeric password (at least 8 characters) for your Phantom account.
          </p>
        </div>

        {/* Missing Token Alert */}
        {!token && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Invalid Reset Link</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No reset token was found in the URL. Please request a fresh reset link.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-white text-black text-[11px] font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors rounded-full cursor-pointer"
              >
                Request New Link
              </button>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-wider uppercase text-white">
                Password Updated
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your password has been securely updated. You can now authenticate with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate('/');
                openAuthModal('login');
              }}
              className="mt-4 w-full py-3 bg-[#f4f2ee] hover:bg-white text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-all rounded-full cursor-pointer shadow-md active:scale-95"
            >
              SIGN IN NOW
            </button>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters (letters & numbers)"
                    className="w-full bg-[#18181c] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full bg-[#18181c] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-[#f4f2ee] hover:bg-white text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-all rounded-full cursor-pointer shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>UPDATING...</span>
                  </>
                ) : (
                  <span>RESET PASSWORD</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="text-[11px] tracking-wider uppercase text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Return to Storefront
                </Link>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
