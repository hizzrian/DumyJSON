'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DEFAULT_LANDING_CONTENT, type LandingContent, type LandingFeature } from '@/lib/defaultLandingContent';

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
  users: { total: number; active: number; pending: number; admins: number };
  endpoints: { total: number; active: number; totalHits: number; byMethod: { GET: number; POST: number; PUT: number; DELETE: number; PATCH: number } };
  traffic: { hitsLast24Hours: number; hourlyBreakdown: { hour: number; hits: number }[] };
  topEndpoints: { path: string; method: string; hit_count: number }[];
}

type Tab = 'overview' | 'pending' | 'endpoints' | 'users' | 'content';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Endpoints state
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    path: '', method: 'GET', description: '', response_template: '{}', delay_ms: 0, status_code: 200, is_active: true,
  });

  // CMS state
  const [landingContent, setLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { if (activeTab === 'content') fetchLandingContent(); }, [activeTab]);

  // ── Auth ─────────────────────────────────────────────────────────────────────

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) { router.push('/login'); return; }
      const data = await res.json();
      if (data.user.role !== 'admin') { router.push('/dashboard'); return; }
      await Promise.all([fetchEndpoints(), fetchPendingUsers(), fetchAllUsers(), fetchStats()]);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  // ── Stats & Users ─────────────────────────────────────────────────────────────

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (error) { console.error('Error fetching stats:', error); }
  }

  async function fetchPendingUsers() {
    try {
      const res = await fetch('/api/admin/pending-users');
      if (res.ok) setPendingUsers((await res.json()).users || []);
    } catch (error) { console.error('Error fetching pending users:', error); }
  }

  async function fetchAllUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setAllUsers((await res.json()).users || []);
    } catch (error) { console.error('Error fetching all users:', error); }
  }

  async function approveUser(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/approve-user/${id}`, { method: 'POST' });
      if (res.ok) { await fetchPendingUsers(); await fetchAllUsers(); }
      else alert('Failed to approve user');
    } catch (error) { console.error('Error approving user:', error); }
    finally { setActionLoading(null); }
  }

  async function rejectUser(id: string) {
    if (!confirm('Reject this user? This will deactivate their account.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/approve-user/${id}`, { method: 'DELETE' });
      if (res.ok) { await fetchPendingUsers(); await fetchAllUsers(); }
      else alert('Failed to reject user');
    } catch (error) { console.error('Error rejecting user:', error); }
    finally { setActionLoading(null); }
  }

  // ── Endpoints ────────────────────────────────────────────────────────────────

  async function fetchEndpoints() {
    try {
      const { data, error } = await supabase.from('endpoints').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEndpoints(data || []);
    } catch (error) { console.error('Error fetching endpoints:', error); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let template;
      try { template = JSON.parse(formData.response_template); }
      catch { alert('Invalid JSON in response template'); return; }

      if (editingId) {
        const { error } = await supabase.from('endpoints').update({ ...formData, response_template: template, updated_at: new Date().toISOString() }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('endpoints').insert({ ...formData, response_template: template });
        if (error) throw error;
      }
      setShowForm(false); setEditingId(null); resetForm(); fetchEndpoints();
    } catch (error) { console.error('Error saving endpoint:', error); alert('Error saving endpoint'); }
  }

  function resetForm() {
    setFormData({ path: '', method: 'GET', description: '', response_template: '{}', delay_ms: 0, status_code: 200, is_active: true });
  }

  function editEndpoint(endpoint: Endpoint) {
    setEditingId(endpoint.id);
    setFormData({
      path: endpoint.path, method: endpoint.method, description: endpoint.description || '',
      response_template: JSON.stringify(endpoint.response_template, null, 2),
      delay_ms: endpoint.delay_ms || 0, status_code: endpoint.status_code || 200, is_active: endpoint.is_active,
    });
    setShowForm(true);
  }

  async function deleteEndpoint(id: string) {
    if (!confirm('Delete this endpoint?')) return;
    try {
      const { error } = await supabase.from('endpoints').delete().eq('id', id);
      if (error) throw error;
      fetchEndpoints();
    } catch (error) { console.error('Error deleting endpoint:', error); }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const { error } = await supabase.from('endpoints').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      fetchEndpoints();
    } catch (error) { console.error('Error toggling active:', error); }
  }

  // ── CMS ─────────────────────────────────────────────────────────────────────

  async function fetchLandingContent() {
    setContentLoading(true);
    try {
      const res = await fetch('/api/landing-content');
      if (res.ok) setLandingContent(await res.json());
    } catch (error) { console.error('Error fetching landing content:', error); }
    finally { setContentLoading(false); }
  }

  async function saveLandingContent() {
    setContentSaving(true); setSaveMessage(null);
    try {
      const res = await fetch('/api/landing-content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(landingContent) });
      setSaveMessage(res.ok
        ? { type: 'success', text: 'Landing page content saved!' }
        : { type: 'error', text: 'Failed to save. Check Supabase connection.' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Network error while saving.' });
    } finally {
      setContentSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  function updateHero(field: keyof LandingContent['hero'], value: string) {
    setLandingContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  }
  function updateFeaturesSection(field: keyof LandingContent['featuresSection'], value: string) {
    setLandingContent(prev => ({ ...prev, featuresSection: { ...prev.featuresSection, [field]: value } }));
  }
  function updateFeature(idx: number, field: keyof LandingFeature, value: string) {
    setLandingContent(prev => { const f = [...prev.features]; f[idx] = { ...f[idx], [field]: value }; return { ...prev, features: f }; });
  }
  function addFeature() {
    setLandingContent(prev => ({ ...prev, features: [...prev.features, { icon: '✨', title: 'New Feature', description: '' }] }));
  }
  function removeFeature(idx: number) {
    setLandingContent(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  }
  function updateAbout(field: keyof Omit<LandingContent['about'], 'paragraphs' | 'stats' | 'useCases'>, value: string) {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));
  }
  function updateParagraph(idx: number, value: string) {
    setLandingContent(prev => { const p = [...prev.about.paragraphs]; p[idx] = value; return { ...prev, about: { ...prev.about, paragraphs: p } }; });
  }
  function addParagraph() { setLandingContent(prev => ({ ...prev, about: { ...prev.about, paragraphs: [...prev.about.paragraphs, ''] } })); }
  function removeParagraph(idx: number) { setLandingContent(prev => ({ ...prev, about: { ...prev.about, paragraphs: prev.about.paragraphs.filter((_, i) => i !== idx) } })); }
  function updateStat(idx: number, field: 'value' | 'label', value: string) {
    setLandingContent(prev => { const s = [...prev.about.stats]; s[idx] = { ...s[idx], [field]: value }; return { ...prev, about: { ...prev.about, stats: s } }; });
  }
  function addStat() { setLandingContent(prev => ({ ...prev, about: { ...prev.about, stats: [...prev.about.stats, { value: '', label: '' }] } })); }
  function removeStat(idx: number) { setLandingContent(prev => ({ ...prev, about: { ...prev.about, stats: prev.about.stats.filter((_, i) => i !== idx) } })); }
  function updateUseCase(idx: number, value: string) {
    setLandingContent(prev => { const u = [...prev.about.useCases]; u[idx] = value; return { ...prev, about: { ...prev.about, useCases: u } }; });
  }
  function addUseCase() { setLandingContent(prev => ({ ...prev, about: { ...prev.about, useCases: [...prev.about.useCases, ''] } })); }
  function removeUseCase(idx: number) { setLandingContent(prev => ({ ...prev, about: { ...prev.about, useCases: prev.about.useCases.filter((_, i) => i !== idx) } })); }
  function updateContact(field: keyof LandingContent['contact'], value: string) {
    setLandingContent(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const inputCls = 'w-full bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1';
  const sectionHeadCls = 'text-base font-semibold text-white mb-4 pb-2 border-b border-slate-700';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
          <button onClick={handleLogout}
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="relative z-10 border-b border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {[
            { key: 'overview', label: 'Overview', color: 'blue', badge: stats ? 'Stats' : null },
            { key: 'pending', label: 'Pending Approvals', color: 'yellow', badge: pendingUsers.length > 0 ? String(pendingUsers.length) : null },
            { key: 'endpoints', label: 'Endpoints', color: 'green', badge: null },
            { key: 'users', label: 'All Users', color: 'purple', badge: null },
            { key: 'content', label: 'Landing Page CMS', color: 'cyan', badge: null },
          ].map(({ key, label, color, badge }) => (
            <button key={key} onClick={() => setActiveTab(key as Tab)}
              className={`px-6 py-3 text-sm border-b-2 transition-colors relative ${
                activeTab === key
                  ? `border-${color}-500 text-${color}-400`
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}>
              {label}
              {badge && (
                <span className={`ml-2 px-2 py-0.5 bg-${color}-900/50 text-${color}-400 text-xs rounded`}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-slate-400">System analytics and statistics</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-blue-400">{stats.users.total}</div>
                <div className="text-xs text-slate-500 mt-1">{stats.users.active} active, {stats.users.pending} pending</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Endpoints</div>
                <div className="text-3xl font-bold text-green-400">{stats.endpoints.total}</div>
                <div className="text-xs text-slate-500 mt-1">{stats.endpoints.active} active</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Total Hits</div>
                <div className="text-3xl font-bold text-cyan-400">{stats.endpoints.totalHits.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">{stats.traffic.hitsLast24Hours} in last 24h</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-sm text-slate-500 mb-1">Pending Approvals</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.users.pending}</div>
                <div className="text-xs text-slate-500 mt-1">Awaiting review</div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Traffic (Last 24 Hours)</h3>
              <div className="flex items-end gap-1 h-32">
                {stats.traffic.hourlyBreakdown.map(hour => (
                  <div key={hour.hour}
                    className="flex-1 bg-blue-600/20 border-t border-blue-500/50 rounded-t"
                    style={{ height: `${Math.min(100, (hour.hits / Math.max(...stats.traffic.hourlyBreakdown.map(h => h.hits), 1)) * 100)}%` }}
                    title={`Hour ${hour.hour}: ${hour.hits} hits`} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Top Endpoints</h3>
              <div className="space-y-3">
                {stats.topEndpoints.slice(0, 5).map((ep, index) => (
                  <div key={ep.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm w-4">{index + 1}</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        ep.method === 'GET' ? 'bg-green-900/30 text-green-400' :
                        ep.method === 'POST' ? 'bg-blue-900/30 text-blue-400' :
                        ep.method === 'PUT' ? 'bg-orange-900/30 text-orange-400' :
                        ep.method === 'DELETE' ? 'bg-red-900/30 text-red-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>{ep.method}</span>
                      <code className="text-blue-400 text-sm font-mono">{ep.path}</code>
                    </div>
                    <span className="text-slate-400 text-sm">{ep.hit_count?.toLocaleString() || 0} hits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
              <p className="text-slate-400">Users awaiting admin approval</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase">
                <div className="col-span-3">Username</div><div className="col-span-4">Email</div>
                <div className="col-span-3">Registered</div><div className="col-span-2">Actions</div>
              </div>
              <div className="divide-y divide-slate-800">
                {pendingUsers.length > 0 ? pendingUsers.map(user => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors">
                    <div className="col-span-3 font-medium">{user.username}</div>
                    <div className="col-span-4 text-slate-400">{user.email}</div>
                    <div className="col-span-3 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-2 flex gap-2">
                      <button onClick={() => approveUser(user.id)} disabled={actionLoading === user.id}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1 px-2 text-xs rounded transition-all disabled:opacity-50">
                        {actionLoading === user.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => rejectUser(user.id)} disabled={actionLoading === user.id}
                        className="flex-1 border border-red-700 text-red-400 py-1 px-2 text-xs rounded hover:bg-red-900/30 transition-colors disabled:opacity-50">
                        {actionLoading === user.id ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">✓</div>
                    <p>No pending approvals</p>
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
              <button onClick={() => { setShowForm(true); resetForm(); setEditingId(null); }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                + New Endpoint
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-xs text-slate-400 uppercase">
                <div className="col-span-2">Method</div><div className="col-span-4">Path</div>
                <div className="col-span-2">Hits</div><div className="col-span-2">Status</div><div className="col-span-2">Actions</div>
              </div>
              <div className="divide-y divide-slate-800">
                {endpoints.length > 0 ? endpoints.map(ep => (
                  <div key={ep.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors">
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        ep.method === 'GET' ? 'bg-green-900/30 text-green-400' :
                        ep.method === 'POST' ? 'bg-blue-900/30 text-blue-400' :
                        ep.method === 'PUT' ? 'bg-orange-900/30 text-orange-400' :
                        ep.method === 'DELETE' ? 'bg-red-900/30 text-red-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>{ep.method}</span>
                    </div>
                    <div className="col-span-4 font-mono text-sm text-blue-400 truncate">{ep.path}</div>
                    <div className="col-span-2 text-slate-400">{ep.hit_count || 0}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-xs rounded ${ep.is_active ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {ep.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <button onClick={() => editEndpoint(ep)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                      <button onClick={() => toggleActive(ep.id, ep.is_active)} className="text-yellow-400 hover:text-yellow-300 text-xs">
                        {ep.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteEndpoint(ep.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </div>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">📝</div><p>No endpoints found</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-8">
              <div className="text-slate-400 text-sm mb-2 font-medium">Available Template Variables:</div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-mono">
                {[['{{now}}', 'Current timestamp'], ['{{body}}', 'Request body'], ['{{method}}', 'HTTP method'], ['{{path}}', 'Endpoint path'], ['{{query.param}}', 'Query parameter']].map(([code, desc]) => (
                  <span key={code}><code className="bg-slate-800 px-2 py-1 rounded">{code}</code> {desc}</span>
                ))}
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
                <div className="col-span-3">Username</div><div className="col-span-4">Email</div>
                <div className="col-span-2">Role</div><div className="col-span-2">Status</div><div className="col-span-1">Created</div>
              </div>
              <div className="divide-y divide-slate-800">
                {allUsers.length > 0 ? allUsers.map(user => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors">
                    <div className="col-span-3 font-medium">{user.username}</div>
                    <div className="col-span-4 text-slate-400">{user.email}</div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-xs rounded ${user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-1">
                      <span className={`px-2 py-1 text-xs rounded ${user.isActive ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${user.isApproved ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="col-span-1 text-slate-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                )) : (
                  <div className="px-6 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">👥</div><p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Landing Page CMS Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Landing Page CMS</h1>
                <p className="text-slate-400">Changes are saved to Supabase and reflected on the landing page immediately.</p>
              </div>
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className={`text-sm px-3 py-1.5 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {saveMessage.text}
                  </span>
                )}
                <button onClick={saveLandingContent} disabled={contentSaving || contentLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-all">
                  {contentSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {contentLoading ? (
              <div className="text-slate-400 text-center py-12">Loading content...</div>
            ) : (
              <div className="space-y-6">

                {/* Hero */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Hero Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Badge Text</label>
                      <input className={inputCls} value={landingContent.hero.badge} onChange={e => updateHero('badge', e.target.value)} /></div>
                    <div><label className={labelCls}>Title (before gradient)</label>
                      <input className={inputCls} value={landingContent.hero.title} onChange={e => updateHero('title', e.target.value)} /></div>
                    <div><label className={labelCls}>Title Gradient Text</label>
                      <input className={inputCls} value={landingContent.hero.titleGradient} onChange={e => updateHero('titleGradient', e.target.value)} /></div>
                    <div className="md:col-span-2"><label className={labelCls}>Subtitle</label>
                      <textarea className={inputCls} rows={2} value={landingContent.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)} /></div>
                  </div>
                </div>

                {/* Features Section Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Features Section Header</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Title</label>
                      <input className={inputCls} value={landingContent.featuresSection.title} onChange={e => updateFeaturesSection('title', e.target.value)} /></div>
                    <div><label className={labelCls}>Subtitle</label>
                      <input className={inputCls} value={landingContent.featuresSection.subtitle} onChange={e => updateFeaturesSection('subtitle', e.target.value)} /></div>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Feature Cards</h3>
                    <button onClick={addFeature} className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-slate-800 transition">+ Add Feature</button>
                  </div>
                  <div className="space-y-4">
                    {landingContent.features.map((feature, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs text-slate-500 font-medium">Feature {idx + 1}</span>
                          <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded hover:bg-slate-700 transition">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div><label className={labelCls}>Icon (emoji)</label>
                            <input className={inputCls} value={feature.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} /></div>
                          <div><label className={labelCls}>Title</label>
                            <input className={inputCls} value={feature.title} onChange={e => updateFeature(idx, 'title', e.target.value)} /></div>
                          <div><label className={labelCls}>Description</label>
                            <textarea className={inputCls} rows={2} value={feature.description} onChange={e => updateFeature(idx, 'description', e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>About Section</h3>
                  <div className="mb-4"><label className={labelCls}>Section Title</label>
                    <input className={inputCls} value={landingContent.about.title} onChange={e => updateAbout('title', e.target.value)} /></div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Paragraphs</label>
                      <button onClick={addParagraph} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-800 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.paragraphs.map((p, idx) => (
                        <div key={idx} className="flex gap-2">
                          <textarea className={`${inputCls} flex-1`} rows={2} value={p} onChange={e => updateParagraph(idx, e.target.value)} />
                          <button onClick={() => removeParagraph(idx)} className="text-red-400 hover:text-red-300 self-start mt-1 px-1.5 py-1 rounded hover:bg-slate-800 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Stats</label>
                      <button onClick={addStat} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-800 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.stats.map((stat, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input className={`${inputCls} w-28`} placeholder="Value" value={stat.value} onChange={e => updateStat(idx, 'value', e.target.value)} />
                          <input className={`${inputCls} flex-1`} placeholder="Label" value={stat.label} onChange={e => updateStat(idx, 'label', e.target.value)} />
                          <button onClick={() => removeStat(idx)} className="text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-slate-800 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Use Cases ("Perfect for" list)</label>
                      <button onClick={addUseCase} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-800 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.useCases.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input className={`${inputCls} flex-1`} value={item} onChange={e => updateUseCase(idx, e.target.value)} />
                          <button onClick={() => removeUseCase(idx)} className="text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-slate-800 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Contact / CTA Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Title</label>
                      <input className={inputCls} value={landingContent.contact.title} onChange={e => updateContact('title', e.target.value)} /></div>
                    <div><label className={labelCls}>Description</label>
                      <textarea className={inputCls} rows={2} value={landingContent.contact.description} onChange={e => updateContact('description', e.target.value)} /></div>
                  </div>
                </div>

                <div className="flex justify-end pb-4">
                  <button onClick={saveLandingContent} disabled={contentSaving}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-xl font-medium transition-all">
                    {contentSaving ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Endpoint Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Endpoint' : 'Create New Endpoint'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Method</label>
                  <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className={inputCls}>
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m}>{m}</option>)}
                  </select></div>
                <div><label className={labelCls}>Status Code</label>
                  <input type="number" value={formData.status_code} onChange={e => setFormData({ ...formData, status_code: parseInt(e.target.value) })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Path</label>
                <input type="text" value={formData.path} onChange={e => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/api/custom/my-endpoint" className={`${inputCls} font-mono`} required /></div>
              <div><label className={labelCls}>Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} placeholder="What does this endpoint do?" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Delay (ms)</label>
                  <input type="number" value={formData.delay_ms} onChange={e => setFormData({ ...formData, delay_ms: parseInt(e.target.value) })} className={inputCls} /></div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer pb-2">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                    Active
                  </label>
                </div>
              </div>
              <div><label className={labelCls}>Response Template (JSON)</label>
                <textarea value={formData.response_template} onChange={e => setFormData({ ...formData, response_template: e.target.value })}
                  rows={8} className={`${inputCls} font-mono`} required /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-all">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-700 text-slate-400 py-2 rounded-lg hover:bg-slate-800 transition-all">
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
