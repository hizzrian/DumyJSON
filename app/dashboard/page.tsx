'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getClientToken } from '@/lib/auth-client';

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
  const [glitchActive, setGlitchActive] = useState(false);
  const [formData, setFormData] = useState({
    path: '',
    method: 'GET',
    description: '',
    response_template: '{}',
    delay_ms: 0,
    status_code: 200,
    is_active: true,
  });

  // Glitch effect
  useState(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 7000 + Math.random() * 3000);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = getClientToken(document);
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

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

      fetchEndpoints(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchEndpoints(token: string | null) {
    if (!token) return;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getClientToken(document);
    if (!token) return;

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
      fetchEndpoints(token);
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

    const token = getClientToken(document);
    if (!token) return;

    try {
      const { error } = await supabase.from('endpoints').delete().eq('id', id);

      if (error) throw error;
      fetchEndpoints(token);
    } catch (error) {
      console.error('Error deleting endpoint:', error);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const token = getClientToken(document);
    if (!token) return;

    try {
      const { error } = await supabase
        .from('endpoints')
        .update({ is_active: !current })
        .eq('id', id);

      if (error) throw error;
      fetchEndpoints(token);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          [INITIALIZING_SYSTEM...]
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* CRT scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.6)_100%)]" />

      {/* Animated grid background */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Header */}
      <header className={`relative z-10 border-b border-green-800 bg-black/80 backdrop-blur-sm ${glitchActive ? 'animate-pulse' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-green-400" style={{ textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>
              [ USER_DASHBOARD ]
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              ONLINE
            </div>
          </div>
          <div className="flex items-center gap-6">
            {user && (
              <div className="text-sm text-green-600">
                <span className="text-green-800">USER:</span> {user.username} |{' '}
                <span className="text-green-800">ROLE:</span> {user.role.toUpperCase()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="border border-red-800 text-red-400 px-4 py-2 text-sm hover:bg-red-950/30 hover:border-red-600 transition-colors"
            >
              [ LOGOUT ]
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-green-800 bg-black/50 p-4">
            <div className="text-green-800 text-xs mb-1">TOTAL_ENDPOINTS</div>
            <div className="text-3xl font-bold text-green-400">{endpoints.length}</div>
          </div>
          <div className="border border-green-800 bg-black/50 p-4">
            <div className="text-green-800 text-xs mb-1">ACTIVE</div>
            <div className="text-3xl font-bold text-green-400">
              {endpoints.filter((e) => e.is_active).length}
            </div>
          </div>
          <div className="border border-green-800 bg-black/50 p-4">
            <div className="text-green-800 text-xs mb-1">TOTAL_HITS</div>
            <div className="text-3xl font-bold text-green-400">
              {endpoints.reduce((sum, e) => sum + (e.hit_count || 0), 0)}
            </div>
          </div>
          <div className="border border-green-800 bg-black/50 p-4">
            <div className="text-green-800 text-xs mb-1">SYSTEM_STATUS</div>
            <div className="text-lg font-bold text-green-400 animate-pulse">OPERATIONAL</div>
          </div>
        </div>

        {/* Endpoints table */}
        <div className="border border-green-800 bg-black/80 backdrop-blur-sm mb-8">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-green-800">
            <div className="text-lg font-bold">
              <span className="text-green-600">&gt;</span> ENDPOINT_REGISTRY
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                resetForm();
                setEditingId(null);
              }}
              className="border border-green-700 text-green-400 px-4 py-2 text-sm hover:bg-green-900/30 hover:border-green-500 transition-colors uppercase tracking-wider"
            >
              [ + NEW_ENDPOINT ]
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-green-950/20 border-b border-green-800 text-xs text-green-600 uppercase">
            <div className="col-span-2">Method</div>
            <div className="col-span-4">Path</div>
            <div className="col-span-2">Hits</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-green-900/30">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-green-950/20 transition-colors"
              >
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold border ${
                      ep.method === 'GET'
                        ? 'border-green-700 bg-green-900/30 text-green-400'
                        : ep.method === 'POST'
                        ? 'border-blue-700 bg-blue-900/30 text-blue-400'
                        : ep.method === 'PUT'
                        ? 'border-orange-700 bg-orange-900/30 text-orange-400'
                        : ep.method === 'DELETE'
                        ? 'border-red-700 bg-red-900/30 text-red-400'
                        : 'border-purple-700 bg-purple-900/30 text-purple-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                </div>
                <div className="col-span-4 font-mono text-sm text-blue-400 truncate">{ep.path}</div>
                <div className="col-span-2 text-green-600">{ep.hit_count || 0}</div>
                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 text-xs border ${
                      ep.is_active
                        ? 'border-green-700 bg-green-900/30 text-green-400'
                        : 'border-slate-700 bg-slate-900/30 text-slate-500'
                    }`}
                  >
                    {ep.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={() => editEndpoint(ep)}
                    className="text-blue-400 hover:text-blue-300 text-xs border border-blue-800 px-2 py-1 hover:bg-blue-900/30 transition-colors"
                  >
                    [EDIT]
                  </button>
                  <button
                    onClick={() => toggleActive(ep.id, ep.is_active)}
                    className="text-yellow-400 hover:text-yellow-300 text-xs border border-yellow-800 px-2 py-1 hover:bg-yellow-900/30 transition-colors"
                  >
                    [{ep.is_active ? 'DISABLE' : 'ENABLE'}]
                  </button>
                  <button
                    onClick={() => deleteEndpoint(ep.id)}
                    className="text-red-400 hover:text-red-300 text-xs border border-red-800 px-2 py-1 hover:bg-red-900/30 transition-colors"
                  >
                    [DELETE]
                  </button>
                </div>
              </div>
            ))}
            {endpoints.length === 0 && (
              <div className="px-6 py-12 text-center text-green-800">
                <div className="text-4xl mb-2">◐</div>
                <div>NO_ENDPOINTS_FOUND</div>
                <div className="text-xs mt-2">Initialize your first endpoint to begin</div>
              </div>
            )}
          </div>
        </div>

        {/* Template variables reference */}
        <div className="border border-green-800 bg-black/50 p-4">
          <div className="text-green-600 text-xs mb-2">
            <span className="text-green-500">[i]</span> AVAILABLE_TEMPLATE_VARIABLES:
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-green-700 font-mono">
            <span>{`{{now}}`} - Current timestamp</span>
            <span>{`{{body}}`} - Request body</span>
            <span>{`{{method}}`} - HTTP method</span>
            <span>{`{{path}}`} - Endpoint path</span>
            <span>{`{{query.param}}`} - Query parameter</span>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative border border-green-700 bg-black p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-green-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-green-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-green-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-green-500" />

            <h2 className="text-xl font-bold mb-6 text-green-400">
              {editingId ? '[ EDIT_ENDPOINT ]' : '[ NEW_ENDPOINT ]'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-green-600 mb-1">&gt; METHOD</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-600 mb-1">&gt; STATUS_CODE</label>
                  <input
                    type="number"
                    value={formData.status_code}
                    onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                    className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-green-600 mb-1">&gt; PATH</label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/api/custom/my-endpoint"
                  className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-green-600 mb-1">&gt; DESCRIPTION</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-green-600 mb-1">&gt; DELAY_MS</label>
                  <input
                    type="number"
                    value={formData.delay_ms}
                    onChange={(e) => setFormData({ ...formData, delay_ms: parseInt(e.target.value) })}
                    className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs text-green-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 border border-green-700 bg-black"
                    />
                    ACTIVE
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-green-600 mb-1">
                  &gt; RESPONSE_TEMPLATE
                  <span className="text-green-800 font-normal ml-2">(JSON)</span>
                </label>
                <textarea
                  value={formData.response_template}
                  onChange={(e) => setFormData({ ...formData, response_template: e.target.value })}
                  rows={8}
                  className="w-full bg-black border border-green-800 text-green-400 px-3 py-2 focus:outline-none focus:border-green-500 font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 border border-green-700 text-green-400 py-2 hover:bg-green-900/30 hover:border-green-500 transition-colors uppercase tracking-wider"
                >
                  {editingId ? '[ UPDATE ]' : '[ CREATE ]'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-700 text-slate-400 py-2 hover:bg-slate-900/30 hover:border-slate-500 transition-colors uppercase tracking-wider"
                >
                  [ CANCEL ]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-900 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-green-900 text-xs">
          <div>JSON_MOCK_API v1.0 | SESSION_SECURE | ENCRYPTED_CONNECTION</div>
          <div className="mt-1 flex items-center justify-center gap-1">
            {[...Array(30)].map((_, i) => (
              <span key={i} className="hover:text-green-600 cursor-pointer transition-colors">▒</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
