import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Trash2,
  MapPin,
  AlertTriangle,
  ChevronRight,
  X,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  apartment: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isGoogleUser: boolean;
  createdAt: string;
  ordersCount: number;
  reviewsCount: number;
  totalSpent: number;
}

export default function UsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'ADMIN'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Deletion modal state
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', { withCredentials: true });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        withCredentials: true
      });

      if (res.data?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        if (selectedUser?.id === userToDelete.id) {
          setSelectedUser(null);
        }
        setActionNotice(`User ${userToDelete.email} was successfully cleaned from the database.`);
        setTimeout(() => setActionNotice(null), 4000);
        setUserToDelete(null);
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Failed to delete user from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        u.email.toLowerCase().includes(q) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.country && u.country.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const totalCollectors = users.filter((u) => u.role === 'CUSTOMER').length;
    const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
    const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
    return { totalCollectors, totalAdmins, totalRevenue, total: users.length };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-white">
            Collector & User Accounts
          </h1>
          <p className="text-xs text-neutral-400 tracking-wider mt-1">
            Registered clientele, privileges moderation, and permanent database account removal.
          </p>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#121215] border border-neutral-800/80 rounded space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
            Total Accounts
          </span>
          <p className="text-2xl font-bold text-white font-mono">{stats.total}</p>
        </div>
        <div className="p-4 bg-[#121215] border border-neutral-800/80 rounded space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
            Registered Collectors
          </span>
          <p className="text-2xl font-bold text-white font-mono">{stats.totalCollectors}</p>
        </div>
        <div className="p-4 bg-[#121215] border border-neutral-800/80 rounded space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
            System Administrators
          </span>
          <p className="text-2xl font-bold text-orange-400 font-mono">{stats.totalAdmins}</p>
        </div>
        <div className="p-4 bg-[#121215] border border-neutral-800/80 rounded space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">
            Total Client Acquisitions
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collector by name, email, city, country..."
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-neutral-800 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center bg-[#121215] border border-neutral-800 rounded p-1 text-[11px] font-mono">
          {(['ALL', 'CUSTOMER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded transition-colors ${
                roleFilter === r
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'ALL USERS' : r === 'CUSTOMER' ? 'COLLECTORS' : 'ADMINS'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121215] border border-neutral-800/80 rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 font-mono">
              Loading Accounts...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-8 h-8 text-neutral-500 mx-auto stroke-[1.5]" />
            <p className="text-sm text-neutral-300 font-medium">No accounts found</p>
            <p className="text-xs text-neutral-500">No registered collectors match this query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#0d0d10] text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-mono">
                  <th className="py-3 px-4">Collector</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Orders & Value</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs font-mono">
                {filteredUsers.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;
                  const displayName =
                    u.firstName || u.lastName
                      ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                      : u.fullName || 'Collector';

                  const initials =
                    (u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '') ||
                    u.fullName?.charAt(0) ||
                    u.email.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-neutral-800/30 transition-colors cursor-pointer"
                    >
                      {/* Collector Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-medium text-white block">
                                {displayName}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-800/40 rounded">
                                  You
                                </span>
                              )}
                              {u.isGoogleUser && (
                                <span className="text-[9px] px-1 py-0.2 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded">
                                  Google
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-300">
                        {u.country || u.city ? (
                          <span>{[u.city, u.country].filter(Boolean).join(', ')}</span>
                        ) : (
                          <span className="text-neutral-500 italic">Not set</span>
                        )}
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="py-3.5 px-4">
                        <span className="text-white font-bold block">
                          ${u.totalSpent.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          {u.ordersCount} {u.ordersCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(u);
                            }}
                            title={isSelf ? 'Cannot delete your own admin account' : 'Delete user from database'}
                            className={`p-1.5 rounded transition-colors ${
                              isSelf
                                ? 'text-neutral-700 cursor-not-allowed'
                                : 'text-neutral-500 hover:text-red-400 hover:bg-neutral-800'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Slideover / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-neutral-800 rounded max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-sm font-bold text-orange-400">
                  {(selectedUser.firstName?.charAt(0) || '') + (selectedUser.lastName?.charAt(0) || '') ||
                    selectedUser.fullName?.charAt(0) ||
                    'P'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-sans">
                    {selectedUser.firstName || selectedUser.lastName
                      ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()
                      : selectedUser.fullName || 'Collector'}
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-black border border-neutral-800 rounded space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Privilege Role</span>
                <span className="text-white font-bold">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-black border border-neutral-800 rounded space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Sign-in Method</span>
                <span className="text-white font-bold">
                  {selectedUser.isGoogleUser ? 'Google OAuth2' : 'Password Credentials'}
                </span>
              </div>
              <div className="p-3 bg-black border border-neutral-800 rounded space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Acquisitions Placed</span>
                <span className="text-white font-bold">{selectedUser.ordersCount} orders</span>
              </div>
              <div className="p-3 bg-black border border-neutral-800 rounded space-y-1">
                <span className="text-[10px] uppercase text-neutral-500 block">Lifetime Spend</span>
                <span className="text-emerald-400 font-bold">${selectedUser.totalSpent.toFixed(2)}</span>
              </div>
            </div>

            {/* Profile & Shipping Coordinates */}
            <div className="p-4 bg-black border border-neutral-800 rounded space-y-3 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-orange-400 font-mono font-bold block">
                Primary Contact & Delivery Coordinates
              </span>
              <div className="space-y-1.5 font-mono text-neutral-300">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{selectedUser.email}</span>
                </p>
                {selectedUser.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{selectedUser.phone}</span>
                  </p>
                ) : (
                  <p className="text-neutral-500 italic">No phone number registered.</p>
                )}
                {selectedUser.address ? (
                  <p className="flex items-start gap-2 pt-1 border-t border-neutral-800">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 mt-0.5" />
                    <span>
                      {selectedUser.address}
                      {selectedUser.apartment ? `, ${selectedUser.apartment}` : ''}
                      <br />
                      {[selectedUser.city, selectedUser.postcode, selectedUser.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </p>
                ) : (
                  <p className="text-neutral-500 italic pt-1 border-t border-neutral-800">
                    No physical address registered in profile.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-[11px] text-neutral-500 font-mono">
                Registered {new Date(selectedUser.createdAt).toLocaleDateString()}
              </span>

              <button
                type="button"
                disabled={currentAdmin?.id === selectedUser.id}
                onClick={() => {
                  setUserToDelete(selectedUser);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentAdmin?.id === selectedUser.id
                    ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
                    : 'bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 cursor-pointer'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanent Deletion */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141312] border border-red-900/60 rounded max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete User?</h3>
                <span className="text-[11px] text-neutral-400 font-mono">Irreversible Database Action</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              You are about to delete user <strong className="text-white font-bold">{userToDelete.email}</strong>.
              This will completely clean their account, shopping bag, wishlist, reviews, and order history from the
              PostgreSQL database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Cleaning Database...' : 'Confirm Permanent Deletion'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
