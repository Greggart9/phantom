import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Lock,
  KeyRound,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    openAuthModal,
    updateProfile,
    requestPasswordChange,
    confirmPasswordChange,
    logout
  } = useAuth();

  const navigate = useNavigate();

  // Profile / Address Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('United States');

  // Profile Save Status
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security / Password Change State
  const [codeRequested, setCodeRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [requestingCode, setRequestingCode] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Synchronize state when user data is available
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setApartment(user.apartment || '');
      setCity(user.city || '');
      setPostcode(user.postcode || '');
      setCountry(user.country || 'United States');
    }
  }, [user]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!firstName.trim()) {
      setProfileError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setProfileError('Last name is required.');
      return;
    }

    setSavingProfile(true);
    const res = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      apartment: apartment.trim(),
      city: city.trim(),
      postcode: postcode.trim(),
      country: country.trim()
    });
    setSavingProfile(false);

    if (res.success) {
      setProfileSuccess('Profile and delivery destination updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } else {
      setProfileError(res.message || 'Failed to update profile.');
    }
  };

  // Step 1: Request Password Verification Code to Registered Email
  const handleRequestCode = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setDevCodeHint(null);
    setRequestingCode(true);

    const res = await requestPasswordChange();
    setRequestingCode(false);

    if (res.success) {
      setCodeRequested(true);
      setPasswordSuccess(res.message);
      if (res.devCode) {
        setDevCodeHint(res.devCode);
      }
    } else {
      setPasswordError(res.message);
    }
  };

  // Step 2: Confirm Password Change
  const handleConfirmPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!verificationCode.trim()) {
      setPasswordError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      setPasswordError('New password must be alphanumeric (contain both letters and numbers).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify your new password.');
      return;
    }

    setUpdatingPassword(true);
    const res = await confirmPasswordChange(verificationCode.trim(), newPassword, confirmPassword);
    setUpdatingPassword(false);

    if (res.success) {
      setPasswordSuccess('Your password has been securely updated.');
      setCodeRequested(false);
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setDevCodeHint(null);
      setTimeout(() => setPasswordSuccess(null), 5000);
    } else {
      setPasswordError(res.message);
    }
  };

  // Not logged in guard state
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#0d0c0b] px-4 py-20 text-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center border border-neutral-800 bg-[#141312] p-8 sm:p-10 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-500">
            <User className="w-8 h-8" />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-semibold">
            Confidential Profile Desk
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2 mb-3">
            Authentication Required
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed mb-8">
            Access to client profiles, address books, and bespoke credentials is reserved for registered collectors.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors shadow-lg cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <Link
              to="/shop"
              className="w-full py-3 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-medium tracking-wider uppercase transition-colors text-center"
            >
              Return to Catalog
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Phantom Member';

  const userInitials =
    (firstName.charAt(0) || '') + (lastName.charAt(0) || '') ||
    user?.fullName?.charAt(0) ||
    user?.email?.charAt(0).toUpperCase() ||
    'P';

  return (
    <div className="min-h-screen bg-[#0d0c0b] text-white py-10 sm:py-16 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Header & Collector Card */}
        <div className="border border-neutral-800 bg-[#141312] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xl sm:text-2xl font-bold text-orange-500 uppercase tracking-widest shrink-0 shadow-inner">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-bold">
                  Client Profile
                </span>
                <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-800 rounded font-semibold">
                  {user?.role === 'ADMIN' ? 'Phantom Admin' : 'Collector'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {user?.fullName || `${firstName} ${lastName}`.trim() || 'Phantom Collector'}
              </h1>
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
                <span>{user?.email}</span>
                <span className="text-neutral-600">•</span>
                <span>Member since {memberSince}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-neutral-800">
            <Link
              to="/orders"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs tracking-wider uppercase font-semibold text-neutral-200 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-orange-400" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs tracking-wider uppercase font-semibold text-neutral-200 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-neutral-400" />
              <span>Wishlist</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-3.5 py-2.5 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-xs tracking-wider uppercase font-bold text-orange-400 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin Console</span>
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-950 hover:bg-red-950/40 border border-neutral-800 hover:border-red-800/60 text-xs tracking-wider uppercase font-semibold text-neutral-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Details & Destination vs Security */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Identity & Delivery Address (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border border-neutral-800 bg-[#141312] p-6 sm:p-8">
              <div className="border-b border-neutral-800 pb-4 mb-6">
                <span className="text-[10px] tracking-[0.25em] uppercase text-orange-500 font-bold">
                  Bespoke Information
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                  Identity & Delivery Destination
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  This address is automatically prefilled during checkout for seamless, one-click ordering.
                </p>
              </div>

              {/* Feedback messages */}
              {profileError && (
                <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Separated First and Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alexander"
                      className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Vance"
                      className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Email Address (Permanent)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full bg-neutral-900/60 border border-neutral-850 text-neutral-400 pl-10 pr-3.5 py-3 text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Suite 400"
                      className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Apartment & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Apartment / Suite (Optional)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apt 4B"
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Postcode & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Postcode / ZIP
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="10001"
                      className="w-full bg-[#181716] border border-neutral-800 text-white px-3.5 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-8 py-3 text-xs focus:outline-none focus:border-neutral-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Japan">Japan</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Switzerland">Switzerland</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                  >
                    <span>{savingProfile ? 'SAVING...' : 'SAVE PROFILE & DELIVERY ADDRESS'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Security & Password Desk (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-neutral-800 bg-[#141312] p-6 sm:p-8">
              <div className="border-b border-neutral-800 pb-4 mb-6">
                <span className="text-[10px] tracking-[0.25em] uppercase text-orange-500 font-bold">
                  Confidential Security
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                  Change Password
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Changing sensitive credentials requires an authorization code dispatched to your registered email.
                </p>
              </div>

              {/* Feedback messages */}
              {passwordError && (
                <div className="mb-5 p-3.5 bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="leading-relaxed">{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="leading-relaxed">{passwordSuccess}</span>
                </div>
              )}

              {/* Development Hint for fast evaluation */}
              {devCodeHint && (
                <div className="mb-5 p-3 bg-orange-950/40 border border-orange-500/40 text-orange-300 text-xs flex items-center justify-between">
                  <span>Dev Code: <strong className="tracking-widest font-mono text-white text-sm">{devCodeHint}</strong></span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(devCodeHint)}
                    className="text-[10px] underline uppercase tracking-wider text-orange-400 hover:text-white"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {!codeRequested ? (
                /* Step 1: Request Code */
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                    <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-orange-500" /> Two-Step Verification Policy
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      To safeguard your bespoke order history and payment profiles, click the button below to generate a one-time 6-digit confirmation code delivered to <strong className="text-white">{user?.email}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestCode}
                    disabled={requestingCode}
                    className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                  >
                    <span>{requestingCode ? 'DISPATCHING CODE...' : 'DISPATCH AUTHORIZATION CODE'}</span>
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Step 2: Enter Code and New Password */
                <form onSubmit={handleConfirmPasswordChange} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-semibold">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleRequestCode}
                        disabled={requestingCode}
                        className="text-[10px] text-orange-400 hover:text-orange-300 underline tracking-wider cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-3.5 py-3 text-xs tracking-[0.3em] font-mono placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      New Password <span className="text-[9px] text-neutral-500 normal-case tracking-normal">(min. 8 chars, alphanumeric)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#181716] border border-neutral-800 text-white pl-10 pr-10 py-3 text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer p-0.5"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1.5 font-semibold">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
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

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="flex-1 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                    >
                      <span>{updatingPassword ? 'VERIFYING...' : 'UPDATE PASSWORD'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeRequested(false);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setDevCodeHint(null);
                      }}
                      className="px-4 py-3.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Cryptography & Data Guarantee Notice */}
            <div className="border border-neutral-850 bg-neutral-950/60 p-5 text-neutral-400 text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-300 font-semibold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Phantom Encryption Standards</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                All client credentials are encrypted with salted one-way bcrypt keys (10 rounds). Passwords are never stored in raw plaintext.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
