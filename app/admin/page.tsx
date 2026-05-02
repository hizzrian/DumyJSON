'use client';

import { useEffect, useState } from 'react';
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

type Tab = 'endpoints' | 'content';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('endpoints');

  // Endpoints state
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

  // CMS state
  const [landingContent, setLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  useEffect(() => {
    if (activeTab === 'content') fetchLandingContent();
  }, [activeTab]);

  // ── Endpoints ────────────────────────────────────────────────────────────────

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
    } finally {
      setLoading(false);
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
          .update({ ...formData, response_template: template, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('endpoints').insert({ ...formData, response_template: template });
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
    setFormData({ path: '', method: 'GET', description: '', response_template: '{}', delay_ms: 0, status_code: 200, is_active: true });
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
      const { error } = await supabase.from('endpoints').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      fetchEndpoints();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  }

  // ── CMS ─────────────────────────────────────────────────────────────────────

  async function fetchLandingContent() {
    setContentLoading(true);
    try {
      const res = await fetch('/api/landing-content');
      if (res.ok) setLandingContent(await res.json());
    } catch (error) {
      console.error('Error fetching landing content:', error);
    } finally {
      setContentLoading(false);
    }
  }

  async function saveLandingContent() {
    setContentSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/landing-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingContent),
      });
      setSaveMessage(res.ok
        ? { type: 'success', text: 'Landing page content saved!' }
        : { type: 'error', text: 'Failed to save. Check Supabase connection.' }
      );
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
    setLandingContent(prev => {
      const features = [...prev.features];
      features[idx] = { ...features[idx], [field]: value };
      return { ...prev, features };
    });
  }

  function addFeature() {
    setLandingContent(prev => ({
      ...prev,
      features: [...prev.features, { icon: '✨', title: 'New Feature', description: '' }],
    }));
  }

  function removeFeature(idx: number) {
    setLandingContent(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  }

  function updateAbout(field: keyof Omit<LandingContent['about'], 'paragraphs' | 'stats' | 'useCases'>, value: string) {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));
  }

  function updateParagraph(idx: number, value: string) {
    setLandingContent(prev => {
      const paragraphs = [...prev.about.paragraphs];
      paragraphs[idx] = value;
      return { ...prev, about: { ...prev.about, paragraphs } };
    });
  }

  function addParagraph() {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, paragraphs: [...prev.about.paragraphs, ''] } }));
  }

  function removeParagraph(idx: number) {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, paragraphs: prev.about.paragraphs.filter((_, i) => i !== idx) } }));
  }

  function updateStat(idx: number, field: 'value' | 'label', value: string) {
    setLandingContent(prev => {
      const stats = [...prev.about.stats];
      stats[idx] = { ...stats[idx], [field]: value };
      return { ...prev, about: { ...prev.about, stats } };
    });
  }

  function addStat() {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, stats: [...prev.about.stats, { value: '', label: '' }] } }));
  }

  function removeStat(idx: number) {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, stats: prev.about.stats.filter((_, i) => i !== idx) } }));
  }

  function updateUseCase(idx: number, value: string) {
    setLandingContent(prev => {
      const useCases = [...prev.about.useCases];
      useCases[idx] = value;
      return { ...prev, about: { ...prev.about, useCases } };
    });
  }

  function addUseCase() {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, useCases: [...prev.about.useCases, ''] } }));
  }

  function removeUseCase(idx: number) {
    setLandingContent(prev => ({ ...prev, about: { ...prev.about, useCases: prev.about.useCases.filter((_, i) => i !== idx) } }));
  }

  function updateContact(field: keyof LandingContent['contact'], value: string) {
    setLandingContent(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const inputCls = 'w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none text-sm';
  const labelCls = 'block text-xs font-medium text-slate-400 mb-1';
  const sectionHeadCls = 'text-base font-semibold text-white mb-4 pb-2 border-b border-slate-700';

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">JSON Mock API — Admin</h1>
            <p className="text-slate-400 mt-1">Manage endpoints and landing page content</p>
          </div>
          <a href="/" className="text-slate-400 hover:text-white text-sm transition">← View Site</a>
        </header>

        {/* Tab navigation */}
        <nav className="flex gap-1 border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'endpoints' ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Endpoints
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'content' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Landing Page CMS
          </button>
        </nav>

        {/* ── Endpoints Tab ── */}
        {activeTab === 'endpoints' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Custom Endpoints</h2>
              <button
                onClick={() => { setShowForm(true); resetForm(); setEditingId(null); }}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                + New Endpoint
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Path</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hits</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {endpoints.map(ep => (
                    <tr key={ep.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          ep.method === 'GET' ? 'bg-green-600' :
                          ep.method === 'POST' ? 'bg-blue-600' :
                          ep.method === 'PUT' ? 'bg-orange-600' :
                          ep.method === 'DELETE' ? 'bg-red-600' : 'bg-purple-600'
                        }`}>{ep.method}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-blue-400">{ep.path}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{ep.description}</td>
                      <td className="px-4 py-3 text-slate-400">{ep.hit_count}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${ep.is_active ? 'bg-green-900 text-green-300' : 'bg-slate-600 text-slate-400'}`}>
                          {ep.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => editEndpoint(ep)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                          <button onClick={() => toggleActive(ep.id, ep.is_active)} className="text-yellow-400 hover:text-yellow-300 text-sm">
                            {ep.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => deleteEndpoint(ep.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {endpoints.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No endpoints yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CMS Tab ── */}
        {activeTab === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Landing Page Content</h2>
                <p className="text-slate-400 text-sm mt-1">Changes are saved to Supabase and reflected on the landing page immediately.</p>
              </div>
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className={`text-sm px-3 py-1.5 rounded-lg ${
                    saveMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>{saveMessage.text}</span>
                )}
                <button
                  onClick={saveLandingContent}
                  disabled={contentSaving || contentLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  {contentSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {contentLoading ? (
              <div className="text-slate-400 text-center py-12">Loading content...</div>
            ) : (
              <div className="space-y-8">

                {/* Hero Section */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Hero Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Badge Text</label>
                      <input className={inputCls} value={landingContent.hero.badge} onChange={e => updateHero('badge', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Title (before gradient)</label>
                      <input className={inputCls} value={landingContent.hero.title} onChange={e => updateHero('title', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Title Gradient Text</label>
                      <input className={inputCls} value={landingContent.hero.titleGradient} onChange={e => updateHero('titleGradient', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Subtitle</label>
                      <textarea className={inputCls} rows={2} value={landingContent.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Features Section Header */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Features Section Header</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input className={inputCls} value={landingContent.featuresSection.title} onChange={e => updateFeaturesSection('title', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Subtitle</label>
                      <input className={inputCls} value={landingContent.featuresSection.subtitle} onChange={e => updateFeaturesSection('subtitle', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Feature Cards</h3>
                    <button onClick={addFeature} className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-slate-700 transition">+ Add Feature</button>
                  </div>
                  <div className="space-y-4">
                    {landingContent.features.map((feature, idx) => (
                      <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs text-slate-500 font-medium">Feature {idx + 1}</span>
                          <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded hover:bg-slate-600 transition">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className={labelCls}>Icon (emoji)</label>
                            <input className={inputCls} value={feature.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} />
                          </div>
                          <div>
                            <label className={labelCls}>Title</label>
                            <input className={inputCls} value={feature.title} onChange={e => updateFeature(idx, 'title', e.target.value)} />
                          </div>
                          <div className="md:col-span-1">
                            <label className={labelCls}>Description</label>
                            <textarea className={inputCls} rows={2} value={feature.description} onChange={e => updateFeature(idx, 'description', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>About Section</h3>

                  <div className="mb-5">
                    <label className={labelCls}>Section Title</label>
                    <input className={inputCls} value={landingContent.about.title} onChange={e => updateAbout('title', e.target.value)} />
                  </div>

                  {/* Paragraphs */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Paragraphs</label>
                      <button onClick={addParagraph} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-700 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.paragraphs.map((p, idx) => (
                        <div key={idx} className="flex gap-2">
                          <textarea className={`${inputCls} flex-1`} rows={2} value={p} onChange={e => updateParagraph(idx, e.target.value)} />
                          <button onClick={() => removeParagraph(idx)} className="text-red-400 hover:text-red-300 self-start mt-1 px-1.5 py-1 rounded hover:bg-slate-700 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Stats</label>
                      <button onClick={addStat} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-700 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.stats.map((stat, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input className={`${inputCls} w-28`} placeholder="Value" value={stat.value} onChange={e => updateStat(idx, 'value', e.target.value)} />
                          <input className={`${inputCls} flex-1`} placeholder="Label" value={stat.label} onChange={e => updateStat(idx, 'label', e.target.value)} />
                          <button onClick={() => removeStat(idx)} className="text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-slate-700 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelCls}>Use Cases ("Perfect for" list)</label>
                      <button onClick={addUseCase} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-slate-700 transition">+ Add</button>
                    </div>
                    <div className="space-y-2">
                      {landingContent.about.useCases.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input className={`${inputCls} flex-1`} value={item} onChange={e => updateUseCase(idx, e.target.value)} />
                          <button onClick={() => removeUseCase(idx)} className="text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-slate-700 transition">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className={sectionHeadCls}>Contact / CTA Section</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input className={inputCls} value={landingContent.contact.title} onChange={e => updateContact('title', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea className={inputCls} rows={2} value={landingContent.contact.description} onChange={e => updateContact('description', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Bottom save button */}
                <div className="flex justify-end pb-4">
                  <button
                    onClick={saveLandingContent}
                    disabled={contentSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-xl font-medium transition"
                  >
                    {contentSaving ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Endpoint Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Endpoint' : 'New Endpoint'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Method</label>
                  <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none">
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status Code</label>
                  <input type="number" value={formData.status_code} onChange={e => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Path</label>
                <input type="text" value={formData.path} onChange={e => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/api/custom/my-endpoint" className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono" required />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Delay (ms)</label>
                  <input type="number" value={formData.delay_ms} onChange={e => setFormData({ ...formData, delay_ms: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="mr-1" />
                    Active
                  </label>
                </div>
              </div>
              <div>
                <label className={labelCls}>Response Template (JSON)</label>
                <textarea value={formData.response_template} onChange={e => setFormData({ ...formData, response_template: e.target.value })}
                  rows={8} className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-600 hover:bg-slate-700 px-6 py-2 rounded-lg font-medium transition">
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
