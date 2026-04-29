'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Endpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  response_template: Record<string, unknown>;
  delay_ms: number;
  status_code: number;
  is_active: boolean;
  hit_count: number;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  users: {
    total: number;
    active: number;
    pending: number;
    admins: number;
  };
  endpoints: {
    total: number;
    active: number;
    totalHits: number;
    byMethod: { GET: number; POST: number; PUT: number; DELETE: number; PATCH: number };
  };
  traffic: {
    hitsLast24Hours: number;
    hourlyBreakdown: { hour: number; hits: number }[];
  };
  topEndpoints: { path: string; method: string; hit_count: number }[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Tab = 'overview' | 'endpoints' | 'pending' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    path: '',
    method: 'GET',
    description: '',
    response_template: '{}',
    delay_ms: 0,
    status_code: 200,
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');

      if (!res.ok) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await Promise.all([fetchEndpoints(), fetchPendingUsers(), fetchAllUsers(), fetchStats()]);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchEndpoints() {
    try {
      const { data, error } = await supabase
        .from('endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEndpoints(data || []);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  }

  async function fetchPendingUsers() {
    try {
      const res = await fetch('/api/admin/pending-users');
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  }

  async function fetchAllUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      let template;
      try {
        template = JSON.parse(formData.response_template);
      } catch {
        alert('Invalid JSON in response template');
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from('endpoints')
          .update({
            ...formData,
            response_template: template,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('endpoints').insert({
          ...formData,
          response_template: template,
        });

        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
      alert('Error saving endpoint');
    }
  }

  function resetForm() {
    setFormData({
      path: '',
      method: 'GET',
      description: '',
      response_template: '{}',
      delay_ms: 0,
      status_code: 200,
      is_active: true,
    });
  }

  function editEndpoint(endpoint: Endpoint) {
    setEditingId(endpoint.id);
    setFormData({
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description || '',
      response_template: JSON.stringify(endpoint.response_template, null, 2),
      delay_ms: endpoint.delay_ms || 0,
      status_code: endpoint.status_code || 200,
      is_active: endpoint.is_active,
    });
    setShowForm(true);
  }

  async function deleteEndpoint(id: string) {
    if (!confirm('Delete this endpoint?')) return;

    try {
      const { error } = await supabase.from('endpoints').delete().eq('id', id);

      if (error) throw error;
      fetchEndpoints();
    } catch (error) {
      console.error('Error deleting endpoint:', error);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const { error } = await supabase
        .from('endpoints')
        .update({ is_active: !current })
        .eq('id', id);

      if (error) throw error;
      fetchEndpoints();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  }

  async function approveUser(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/approve-user/${id}`, {
        method: 'POST',
      });

      if (res.ok) {
        await fetchPendingUsers();
        await fetchAllUsers();
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectUser(id: string) {
    if (!confirm('Reject this user? This will deactivate their account.')) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/approve-user/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchPendingUsers();
        await fetchAllUsers();
      } else {
        alert('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              JSON Mock API
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link>
              <span className="text-sm text-blue-400 font-medium">Admin</span>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="relative z-10 border-b border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm border-b-2 transition-colors relative ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview
            {stats && (
              <span className="ml-2 px-2 py-0.5 bg-blue-900/50 text-blue-400 text-xs rounded">
                Stats
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-sm border-b-2 transition-colors relative ${
              activeTab === 'pending'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs rounded">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-6 py-3 text-sm border-b-2 transition-colors relative ${
              activeTab === 'endpoints'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Endpoints
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm border-b-2 transition-colors relative ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            All Users
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-slate-400">System analytics and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-blue-400">{stats.users.total}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats.users.active} active, {stats.users.pending} pending
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Endpoints</div>
                <div className="text-3xl font-bold text-green-400">{stats.endpoints.total}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats.endpoints.active} active
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Hits</div>
                <div className="text-3xl font-bold text-cyan-400">{stats.endpoints.totalHits.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats.traffic.hitsLast24Hours} in last 24h
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Pending Approvals</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.users.pending}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Awaiting review
                </div>
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Traffic (Last 24 Hours)</h3>
              <div className="flex items-end gap-1 h-32">
                {stats.traffic.hourlyBreakdown.map((hour) => (
                  <div
                    key={hour.hour}
                    className="flex-1 bg-blue-600/20 border-t border-blue-500/50 rounded-t"
                    style={{ height: `${Math.min(100, (hour.hits / Math.max(...stats.traffic.hourlyBreakdown.map(h => h.hits))) * 100)}%` }}
                    title={`Hour ${hour.hour}: ${hour.hits} hits`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Top Endpoints */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Top Endpoints</h3>
              <div className="space-y-3">
                {stats.topEndpoints.slice(0, 5).map((ep, index) => (
                  <div key={ep.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm w-4">{index + 1}</span>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          ep.method === 'GET'
                            ? 'bg-green-900/30 text-green-400'
                            : ep.method === 'POST'
                            ? 'bg-blue-900/30 text-blue-400'
                            : ep.method === 'PUT'
                            ? 'bg-orange-900/30 text-orange-400'
                            : ep.method === 'DELETE'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-purple-900/30 text-purple-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-blue-400 text-sm font-mono">{ep.path}</code>
                    </div>
                    <span className="text-slate-400 text-sm">{ep.hit_count?.toLocaleString() || 0} hits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Users Tab */}
        {activeTab === 'pending' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
              <p className="text-slate-400">Users awaiting admin approval</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase">
                <div className="col-span-3">Username</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-3">Registered</div>
                <div className="col-span-2">Actions</div>
              </div>

              <div className="divide-y divide-slate-800">
                {pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="col-span-3 font-medium">{user.username}</div>
                      <div className="col-span-4 text-slate-400">{user.email}</div>
                      <div className="col-span-3 text-slate-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button
                          onClick={() => approveUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1 px-2 text-xs rounded transition-all disabled:opacity-50"
                        >
                          {actionLoading === user.id ? (
                            <span className="animate-spin">◐</span>
                          ) : (
                            'Approve'
                          )}
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex-1 border border-red-700 text-red-400 py-1 px-2 text-xs rounded hover:bg-red-900/30 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === user.id ? (
                            <span className="animate-spin">◐</span>
                          ) : (
                            'Reject'
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">✓</div>
                    <p>No pending approvals</p>
                    <p className="text-sm mt-2">All users have been processed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Endpoints</h1>
                <p className="text-slate-400">Manage all custom endpoints</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                  setEditingId(null);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                + New Endpoint
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase">
                <div className="col-span-2">Method</div>
                <div className="col-span-4">Path</div>
                <div className="col-span-2">Hits</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>

              <div className="divide-y divide-slate-800">
                {endpoints.length > 0 ? (
                  endpoints.map((ep) => (
                    <div
                      key={ep.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="col-span-2">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${
                            ep.method === 'GET'
                              ? 'bg-green-900/30 text-green-400'
                              : ep.method === 'POST'
                              ? 'bg-blue-900/30 text-blue-400'
                              : ep.method === 'PUT'
                              ? 'bg-orange-900/30 text-orange-400'
                              : ep.method === 'DELETE'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-purple-900/30 text-purple-400'
                          }`}
                        >
                          {ep.method}
                        </span>
                      </div>
                      <div className="col-span-4 font-mono text-sm text-blue-400 truncate">
                        {ep.path}
                      </div>
                      <div className="col-span-2 text-slate-400">{ep.hit_count || 0}</div>
                      <div className="col-span-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            ep.is_active
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {ep.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button
                          onClick={() => editEndpoint(ep)}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(ep.id, ep.is_active)}
                          className="text-yellow-400 hover:text-yellow-300 text-xs"
                        >
                          {ep.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteEndpoint(ep.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No endpoints found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Template variables reference */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-8">
              <div className="text-slate-400 text-sm mb-2 font-medium">
                Available Template Variables:
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-mono">
                <code className="bg-slate-800 px-2 py-1 rounded">{'{{now}}'}</code>
                <span className="text-slate-600">Current timestamp</span>
                <code className="bg-slate-800 px-2 py-1 rounded">{'{{body}}'}</code>
                <span className="text-slate-600">Request body</span>
                <code className="bg-slate-800 px-2 py-1 rounded">{'{{method}}'}</code>
                <span className="text-slate-600">HTTP method</span>
                <code className="bg-slate-800 px-2 py-1 rounded">{'{{path}}'}</code>
                <span className="text-slate-600">Endpoint path</span>
                <code className="bg-slate-800 px-2 py-1 rounded">{'{{query.param}}'}</code>
                <span className="text-slate-600">Query parameter</span>
              </div>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">All Users</h1>
              <p className="text-slate-400">Total: {allUsers.length} users</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase">
                <div className="col-span-3">Username</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Created</div>
              </div>

              <div className="divide-y divide-slate-800">
                {allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="col-span-3 font-medium">{user.username}</div>
                      <div className="col-span-4 text-slate-400">{user.email}</div>
                      <div className="col-span-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            user.role === 'admin'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-blue-900/30 text-blue-400'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex gap-1">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              user.isActive
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              user.isApproved
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-yellow-900/30 text-yellow-400'
                            }`}
                          >
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 text-slate-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create/Edit Endpoint Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? 'Edit Endpoint' : 'Create New Endpoint'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status Code</label>
                  <input
                    type="number"
                    value={formData.status_code}
                    onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Path</label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/api/custom/my-endpoint"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="What does this endpoint do?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Delay (ms)</label>
                  <input
                    type="number"
                    value={formData.delay_ms}
                    onChange={(e) => setFormData({ ...formData, delay_ms: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 border border-slate-600 rounded bg-slate-800"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Response Template (JSON)
                </label>
                <textarea
                  value={formData.response_template}
                  onChange={(e) => setFormData({ ...formData, response_template: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-all"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-700 text-slate-400 py-2 rounded-lg hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
