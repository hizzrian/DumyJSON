import Link from 'next/link';

export default function Home() {
  const endpoints = [
    { path: "/api/users", desc: "Get list of users", params: "limit, skip, select" },
    { path: "/api/users/:id", desc: "Get user by ID", params: "select" },
    { path: "/api/products", desc: "Get list of products", params: "limit, skip, category, minPrice, maxPrice, select" },
    { path: "/api/products/:id", desc: "Get product by ID", params: "select" },
    { path: "/api/posts", desc: "Get list of posts", params: "limit, skip, tag" },
    { path: "/api/posts/:id", desc: "Get post by ID", params: "" },
    { path: "/api/todos", desc: "Get list of todos", params: "limit, skip, completed, userId" },
    { path: "/api/todos/:id", desc: "Get todo by ID", params: "" },
    { path: "/api/quotes", desc: "Get inspirational quotes", params: "" },
    { path: "/api/team", desc: "Get team members", params: "" },
    { path: "/api/reviews", desc: "Get product reviews", params: "" },
    { path: "/api/carts", desc: "Get shopping carts", params: "" },
    { path: "/api/comments", desc: "Get comments", params: "" },
    { path: "/api/auth/login", desc: "Login (POST)", params: "username, password" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
                JSON Mock API
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                A free REST API for testing and prototyping. Similar to dummyjson.com
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Admin Dashboard
            </Link>
          </div>
        </header>

        <section className="mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Quick Start
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 dark:text-slate-300 mb-2">Try it with curl:</p>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>curl http://localhost:3000/api/users</code>
                </pre>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-300 mb-2">Or fetch in browser:</p>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>http://localhost:3000/api/products?limit=5</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">
              Custom Endpoints
            </h2>
            <p className="mb-4 text-blue-100">
              Create your own JSON API endpoints with custom responses! Use the Admin Dashboard to define endpoints with any path, method, and JSON response.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-100 mb-2">Template Variables:</p>
              <code className="text-xs text-green-400">
                {'{{now}}'} - Current timestamp<br />
                {'{{body}}'} - Request body (for POST/PUT/PATCH)<br />
                {'{{method}}'} - HTTP method<br />
                {'{{path}}'} - Request path<br />
                {'{{query.paramName}}'} - Query parameter value
              </code>
            </div>
            <Link
              href="/admin"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition"
            >
              Create Custom Endpoints
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Pre-built API Endpoints
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Endpoint</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {endpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <code className="text-blue-600 dark:text-blue-400 text-sm">{ep.path}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm">{ep.desc}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm font-mono">{ep.params}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Example Responses
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                GET /api/users?limit=2
              </h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "users": [
    {
      "id": 1,
      "username": "james.smith1",
      "email": "james.smith1@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "gender": "male",
      "image": "https://i.pravatar.cc/150?u=1",
      "phone": "+1-555-123-4567",
      "address": { ... }
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                GET /api/products?category=Electronics&limit=2
              </h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "products": [
    {
      "id": 1,
      "title": "Wireless Headphones 1",
      "description": "Premium noise-cancelling...",
      "category": "Electronics",
      "price": 79.99,
      "discountPercentage": 12.5,
      "rating": 4.5,
      "stock": 150,
      "images": [...],
      "thumbnail": "..."
    }
  ],
  "total": 25,
  "skip": 0,
  "limit": 10
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                POST /api/auth/login
              </h3>
              <pre className="bg-slate-900 text-yellow-400 p-4 rounded-lg overflow-x-auto text-sm mb-3">
{`{
  "username": "admin",
  "password": "admin123"
}`}
              </pre>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "token": "a1b2c3d4e5f6...",
  "expiresIn": 3600
}`}
              </pre>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-slate-500 dark:text-slate-400">
            JSON Mock API - Self-hosted mock JSON service for testing and development
          </p>
        </footer>
      </div>
    </div>
  );
}
