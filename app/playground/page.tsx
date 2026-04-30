'use client';

import { useState } from 'react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  hasBody: boolean;
  pathParams: string[];
}

const ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/api/users', description: 'List users', hasBody: false, pathParams: [] },
  { method: 'GET', path: '/api/users/:id', description: 'Get user by ID', hasBody: false, pathParams: ['id'] },
  { method: 'POST', path: '/api/users', description: 'Create user', hasBody: true, pathParams: [] },
  { method: 'PUT', path: '/api/users/:id', description: 'Replace user', hasBody: true, pathParams: ['id'] },
  { method: 'PATCH', path: '/api/users/:id', description: 'Update user', hasBody: true, pathParams: ['id'] },
  { method: 'DELETE', path: '/api/users/:id', description: 'Delete user', hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/users/:id/posts', description: "User's posts", hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/users/:id/todos', description: "User's todos", hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/products', description: 'List products', hasBody: false, pathParams: [] },
  { method: 'GET', path: '/api/products/:id', description: 'Get product by ID', hasBody: false, pathParams: ['id'] },
  { method: 'POST', path: '/api/products', description: 'Create product', hasBody: true, pathParams: [] },
  { method: 'PUT', path: '/api/products/:id', description: 'Replace product', hasBody: true, pathParams: ['id'] },
  { method: 'PATCH', path: '/api/products/:id', description: 'Update product', hasBody: true, pathParams: ['id'] },
  { method: 'DELETE', path: '/api/products/:id', description: 'Delete product', hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/posts', description: 'List posts', hasBody: false, pathParams: [] },
  { method: 'GET', path: '/api/posts/:id', description: 'Get post by ID', hasBody: false, pathParams: ['id'] },
  { method: 'POST', path: '/api/posts', description: 'Create post', hasBody: true, pathParams: [] },
  { method: 'PUT', path: '/api/posts/:id', description: 'Replace post', hasBody: true, pathParams: ['id'] },
  { method: 'PATCH', path: '/api/posts/:id', description: 'Update post', hasBody: true, pathParams: ['id'] },
  { method: 'DELETE', path: '/api/posts/:id', description: 'Delete post', hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/posts/:id/comments', description: "Post's comments", hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/todos', description: 'List todos', hasBody: false, pathParams: [] },
  { method: 'GET', path: '/api/todos/:id', description: 'Get todo by ID', hasBody: false, pathParams: ['id'] },
  { method: 'POST', path: '/api/todos', description: 'Create todo', hasBody: true, pathParams: [] },
  { method: 'PUT', path: '/api/todos/:id', description: 'Replace todo', hasBody: true, pathParams: ['id'] },
  { method: 'PATCH', path: '/api/todos/:id', description: 'Update todo', hasBody: true, pathParams: ['id'] },
  { method: 'DELETE', path: '/api/todos/:id', description: 'Delete todo', hasBody: false, pathParams: ['id'] },
  { method: 'GET', path: '/api/comments', description: 'List comments', hasBody: false, pathParams: [] },
  { method: 'POST', path: '/api/auth/login', description: 'Login', hasBody: true, pathParams: [] },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-600',
  POST: 'bg-blue-600',
  PUT: 'bg-orange-600',
  PATCH: 'bg-purple-600',
  DELETE: 'bg-red-600',
};

interface QueryParam {
  key: string;
  value: string;
}

export default function PlaygroundPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{ status: number; data: unknown } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<'url' | 'response' | null>(null);

  const endpoint = ENDPOINTS[selectedIdx];

  function buildUrl(): string {
    let path = endpoint.path;
    endpoint.pathParams.forEach(param => {
      path = path.replace(`:${param}`, pathValues[param] || `:${param}`);
    });

    const qs = queryParams
      .filter(p => p.key.trim())
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');

    return qs ? `${path}?${qs}` : path;
  }

  async function handleSend() {
    setLoading(true);
    setResponse(null);
    try {
      const url = buildUrl();
      const options: RequestInit = { method: endpoint.method };

      if (endpoint.hasBody && body.trim()) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => null);
      setResponse({ status: res.status, data });
    } catch (err) {
      setResponse({ status: 0, data: { error: String(err) } });
    } finally {
      setLoading(false);
    }
  }

  function handleEndpointChange(idx: number) {
    setSelectedIdx(idx);
    setPathValues({});
    setQueryParams([{ key: '', value: '' }]);
    setBody('');
    setResponse(null);
  }

  function addQueryParam() {
    setQueryParams(prev => [...prev, { key: '', value: '' }]);
  }

  function removeQueryParam(i: number) {
    setQueryParams(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateQueryParam(i: number, field: 'key' | 'value', val: string) {
    setQueryParams(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }

  async function copyToClipboard(text: string, type: 'url' | 'response') {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  const resolvedUrl = buildUrl();
  const statusOk = response && response.status >= 200 && response.status < 300;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <a href="/" className="text-slate-400 hover:text-white text-sm transition">← Back</a>
          </div>
          <h1 className="text-3xl font-bold mt-3">API Playground</h1>
          <p className="text-slate-400 mt-1">Test endpoints interactively</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel: request builder */}
          <div className="space-y-5">
            {/* Endpoint selector */}
            <div className="bg-slate-800 rounded-xl p-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint</label>
              <select
                value={selectedIdx}
                onChange={e => handleEndpointChange(parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {ENDPOINTS.map((ep, i) => (
                  <option key={i} value={i}>
                    {ep.method} {ep.path} — {ep.description}
                  </option>
                ))}
              </select>

              {/* URL preview */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${METHOD_COLORS[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-blue-400 text-sm flex-1 truncate">{resolvedUrl}</code>
                <button
                  onClick={() => copyToClipboard(resolvedUrl, 'url')}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700 transition"
                >
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Path params */}
            {endpoint.pathParams.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-3">Path Parameters</label>
                <div className="space-y-2">
                  {endpoint.pathParams.map(param => (
                    <div key={param} className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm font-mono w-16 shrink-0">:{param}</span>
                      <input
                        type="text"
                        value={pathValues[param] || ''}
                        onChange={e => setPathValues(prev => ({ ...prev, [param]: e.target.value }))}
                        placeholder={`Enter ${param}`}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query params */}
            <div className="bg-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-slate-300">Query Parameters</label>
                <button
                  onClick={addQueryParam}
                  className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-slate-700 transition"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {queryParams.map((param, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={param.key}
                      onChange={e => updateQueryParam(i, 'key', e.target.value)}
                      placeholder="key"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={e => updateQueryParam(i, 'value', e.target.value)}
                      placeholder="value"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeQueryParam(i)}
                      className="text-slate-500 hover:text-red-400 px-2 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request body */}
            {endpoint.hasBody && (
              <div className="bg-slate-800 rounded-xl p-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">Request Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  placeholder='{ "key": "value" }'
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none resize-y"
                />
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 px-6 py-3 rounded-xl font-semibold transition"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          {/* Right panel: response */}
          <div className="bg-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slate-300">Response</label>
              {response && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusOk ? 'bg-green-800 text-green-300' : 'bg-red-800 text-red-300'}`}>
                    {response.status || 'Error'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2), 'response')}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700 transition"
                  >
                    {copied === 'response' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-auto min-h-[400px]">
              {!response && !loading && (
                <p className="text-slate-500 text-sm">Response will appear here after you send a request.</p>
              )}
              {loading && (
                <p className="text-slate-400 text-sm">Waiting for response...</p>
              )}
              {response && (
                <pre className="text-sm text-green-300 whitespace-pre-wrap break-all">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
