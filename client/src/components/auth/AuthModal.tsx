import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authPromptMessage,
    openAuthModal,
    loginWithCredentials,
    registerWithCredentials,
    loginWithGoogle,
    requestPasswordReset
  } = useAuth();

  // Mode: 'auth' (login / signup) or 'forgot-password'
  const [viewMode, setViewMode] = useState<'auth' | 'forgot-password'>('auth');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLogin = authModalMode === 'login';

  const resetFormState = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setViewMode('auth');
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);

    const googleEmail =
      email.trim() ||
      prompt('Enter your Google Account email for sign-in:') ||
      '';

    if (!googleEmail.trim()) return;

    if (!googleEmail.includes('@') || !googleEmail.includes('.')) {
      setError('Please provide a valid Google email address.');
      return;
    }

    setLoading(true);
    const res = await loginWithGoogle({
      email: googleEmail.trim().toLowerCase(),
      fullName: googleEmail.split('@')[0],
      googleId: `google_${Date.now()}`
    });
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(cleanEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Password reset instructions have been prepared.');
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isLogin) {
      setLoading(true);
      const res = await loginWithCredentials(cleanEmail, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!firstName.trim()) {
        setError('Please enter your first name.');
        return;
      }

      if (!lastName.trim()) {
        setError('Please enter your last name.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        setError('Password must be alphanumeric (contain both letters and numbers).');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your confirm password.');
        return;
      }

      setLoading(true);
      const res = await registerWithCredentials(
        cleanEmail,
        password,
        confirmPassword,
        firstName.trim(),
        lastName.trim()
      );
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Luxury backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#121110] border border-neutral-800 text-white p-7 sm:p-9 shadow-2xl z-10"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Header & Wordmark */}
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-neutral-400">
              PHANTOM
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1.5">
              {viewMode === 'forgot-password'
                ? 'Reset Password'
                : isLogin
                ? 'Sign In'
                : 'Create an Account'}
            </h2>
            {authPromptMessage && viewMode !== 'forgot-password' ? (
              <p className="text-xs text-[#cf5230] mt-2 font-medium tracking-wide">
                {authPromptMessage}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 mt-1.5 font-normal">
                {viewMode === 'forgot-password'
                  ? 'Enter your registered email and we will send recovery instructions.'
                  : isLogin
                  ? 'Access your saved pieces, shopping bag, and bespoke orders.'
                  : 'Join Phantom for encrypted orders and complimentary delivery.'}
              </p>
            )}
          </div>

          {/* Mode Switcher Tabs (Only in normal auth mode) */}
          {viewMode === 'auth' && (
            <div className="flex border-b border-neutral-800 mb-6 text-xs font-semibold tracking-[0.18em] uppercase">
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  openAuthModal('login');
                }}
                className={`flex-1 pb-3 text-center transition-colors cursor-pointer border-b-2 ${
                  isLogin
                    ? 'text-white border-orange-500'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  resetFormState();
                  openAuthModal('signup');
                }}
                className={`flex-1 pb-3 text-center transition-colors cursor-pointer border-b-2 ${
                  !isLogin
                    ? 'text-white border-orange-500'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {viewMode === 'forgot-password' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-4 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                <span>{loading ? 'SENDING...' : 'SEND RECOVERY INSTRUCTIONS'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setViewMode('auth');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD AUTH VIEW (Sign In / Sign Up) */
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-[#181716] hover:bg-[#201f1e] border border-neutral-800 hover:border-neutral-700 text-white text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              {/* Or Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800" />
                </div>
                <span className="relative bg-[#121110] px-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  or continue with email
                </span>
              </div>

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First and Last Name (Only on Sign Up) */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alexander"
                        className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Vance"
                        className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-4 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-semibold">
                      Password {!isLogin && <span className="text-[9px] text-neutral-500 normal-case tracking-normal">(min. 8 chars, letters & numbers)</span>}
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMsg(null);
                          setViewMode('forgot-password');
                        }}
                        className="text-[10px] text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? '••••••••' : 'Min. 8 characters (letters & numbers)'}
                      className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-10 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field with Eye Toggle (Only on Sign Up) */}
                {!isLogin && (
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-10 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                >
                  <span>{loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Bottom Switcher Link */}
              <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
                {isLogin ? (
                  <p className="text-xs text-neutral-400">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        resetFormState();
                        openAuthModal('signup');
                      }}
                      className="text-white hover:text-orange-500 font-semibold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Already have a Phantom account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        resetFormState();
                        openAuthModal('login');
                      }}
                      className="text-white hover:text-orange-500 font-semibold underline underline-offset-4 ml-1 cursor-pointer transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
