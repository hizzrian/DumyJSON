'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Endpoint {
  id: string;
  owner_id: string;
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
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setUser(data.user);

      if (data.user.role === 'admin') {
        router.push('/admin');
        return;
      }

      await fetchUserEndpoints(data.user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserEndpoints(userId: string) {
    try {
      const { data, error } = await supabase
        .from('endpoints')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEndpoints(data || []);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

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
          owner_id: user.id,
          ...formData,
          response_template: template,
        });

        if (error) throw error;
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      await fetchUserEndpoints(user.id);
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
      if (user) await fetchUserEndpoints(user.id);
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
      if (user) await fetchUserEndpoints(user.id);
    } catch (error) {
      console.error('Error toggling active:', error);
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
              <Link href="/dashboard" className="text-sm text-blue-400 font-medium">Dashboard</Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">Admin</Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Endpoints</h1>
          <p className="text-slate-400">
            Manage your custom JSON API endpoints
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{endpoints.length}</div>
            <div className="text-sm text-slate-500">Total Endpoints</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {endpoints.filter(e => e.is_active).length}
            </div>
            <div className="text-sm text-slate-500">Active</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-cyan-400">
              {endpoints.reduce((sum, e) => sum + (e.hit_count || 0), 0)}
            </div>
            <div className="text-sm text-slate-500">Total Hits</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">
              {endpoints.filter(e => e.method === 'GET').length}
            </div>
            <div className="text-sm text-slate-500">GET Endpoints</div>
          </div>
        </div>

        {/* Endpoints list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold">Your Endpoints</h2>
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

          <div className="divide-y divide-slate-800">
            {endpoints.length > 0 ? (
              endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="px-6 py-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
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
                      {ep.description && (
                        <span className="text-slate-500 text-sm hidden md:inline">— {ep.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-sm">
                        {ep.hit_count || 0} hits
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          ep.is_active
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {ep.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => editEndpoint(ep)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(ep.id, ep.is_active)}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        {ep.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteEndpoint(ep.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-slate-500">
                <div className="text-4xl mb-4">📝</div>
                <p>No endpoints yet</p>
                <p className="text-sm mt-2">Create your first custom endpoint to get started</p>
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
