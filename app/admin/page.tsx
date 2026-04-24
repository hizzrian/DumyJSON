'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export default function AdminDashboard() {
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
    is_active: true
  });

  useEffect(() => {
    fetchEndpoints();
  }, []);

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
          .update({
            ...formData,
            response_template: template,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('endpoints')
          .insert({
            ...formData,
            response_template: template
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
      is_active: true
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
      is_active: endpoint.is_active
    });
    setShowForm(true);
  }

  async function deleteEndpoint(id: string) {
    if (!confirm('Delete this endpoint?')) return;

    try {
      const { error } = await supabase
        .from('endpoints')
        .delete()
        .eq('id', id);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">JSON Mock API - Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your custom endpoints</p>
          </div>
          <button
            onClick={() => { setShowForm(true); resetForm(); setEditingId(null); }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
          >
            + New Endpoint
          </button>
        </header>

        {/* Endpoints List */}
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
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold
                      ${ep.method === 'GET' ? 'bg-green-600' :
                        ep.method === 'POST' ? 'bg-blue-600' :
                        ep.method === 'PUT' ? 'bg-orange-600' :
                        ep.method === 'DELETE' ? 'bg-red-600' : 'bg-purple-600'}`}>
                      {ep.method}
                    </span>
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
                    <div className="flex gap-2">
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
                  </td>
                </tr>
              ))}
              {endpoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Endpoint' : 'New Endpoint'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Method</label>
                    <select
                      value={formData.method}
                      onChange={e => setFormData({ ...formData, method: e.target.value })}
                      className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status Code</label>
                    <input
                      type="number"
                      value={formData.status_code}
                      onChange={e => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                      className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Path</label>
                  <input
                    type="text"
                    value={formData.path}
                    onChange={e => setFormData({ ...formData, path: e.target.value })}
                    placeholder="/api/custom/my-endpoint"
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Delay (ms)</label>
                    <input
                      type="number"
                      value={formData.delay_ms}
                      onChange={e => setFormData({ ...formData, delay_ms: parseInt(e.target.value) })}
                      className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Response Template (JSON)
                    <span className="text-slate-400 font-normal ml-2">
                      Use {'{{now}}'}, {'{{body}}'}, {'{{query.paramName}}'}
                    </span>
                  </label>
                  <textarea
                    value={formData.response_template}
                    onChange={e => setFormData({ ...formData, response_template: e.target.value })}
                    rows={8}
                    className="w-full bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-slate-600 hover:bg-slate-700 px-6 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
