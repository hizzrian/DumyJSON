'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#api', label: 'API Docs' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

const features = [
  {
    title: 'Pre-built Endpoints',
    description: 'Ready-to-use REST API endpoints for users, products, posts, todos, and more. Zero setup required.',
    icon: '⚡',
  },
  {
    title: 'Custom Endpoints',
    description: 'Define your own API endpoints with custom JSON responses using our intuitive Admin Dashboard.',
    icon: '🔧',
  },
  {
    title: 'Supabase Integration',
    description: 'Persistent storage for custom endpoints with PostgreSQL reliability and scalability.',
    icon: '🗄️',
  },
  {
    title: 'Request Logging',
    description: 'Track every API call with detailed request/response logging for debugging and analytics.',
    icon: '📊',
  },
  {
    title: 'Template Variables',
    description: 'Dynamic responses with {{now}}, {{body}}, {{query.param}}, and other template placeholders.',
    icon: '🧩',
  },
  {
    title: 'Fast Mock Data',
    description: 'Generate realistic mock data for 100+ users, products, and posts with customizable filters.',
    icon: '🚀',
  },
];

const apiExamples = {
  users: {
    endpoint: 'GET /api/users?limit=2',
    response: `{
  "users": [
    {
      "id": 1,
      "username": "james.smith1",
      "email": "james.smith1@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "gender": "male",
      "image": "https://i.pravatar.cc/150?u=1"
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}`,
  },
  products: {
    endpoint: 'GET /api/products?category=Electronics',
    response: `{
  "products": [
    {
      "id": 1,
      "title": "Wireless Headphones 1",
      "description": "Premium noise-cancelling...",
      "category": "Electronics",
      "price": 79.99,
      "discountPercentage": 12.5,
      "rating": 4.5,
      "stock": 150
    }
  ],
  "total": 25,
  "skip": 0,
  "limit": 10
}`,
  },
  posts: {
    endpoint: 'GET /api/posts?limit=2',
    response: `{
  "posts": [
    {
      "id": 1,
      "title": "Getting Started with Next.js",
      "body": "Learn how to build modern web applications...",
      "userId": 42,
      "tags": ["tutorial", "guide", "web-dev"],
      "reactions": { "likes": 234, "dislikes": 12 },
      "views": 5420
    }
  ],
  "total": 100,
  "skip": 0,
  "limit": 10
}`,
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'posts'>('users');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg shadow-slate-950/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              JSON Mock API
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Link
                href="/login"
                className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left py-2 text-slate-400 hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              <Link href="/login" className="block mt-4 border border-slate-700 text-center py-2 rounded-lg text-sm font-medium text-slate-300">
                Login
              </Link>
              <Link href="/register" className="block mt-2 bg-blue-600 text-center py-2 rounded-lg text-sm font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Free REST API for testing & prototyping</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build faster with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                mock JSON APIs
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              A self-hosted mock API service for developers. Pre-built endpoints, custom routes,
              and realistic data generation—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#api"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
              >
                Explore Endpoints
              </Link>
              <a
                href="http://localhost:3000/api/users"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all border border-slate-700"
              >
                Try Live Demo
              </a>
            </div>
          </div>

          {/* Code Preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-slate-500 font-mono">Terminal</span>
              </div>
              <div className="p-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <span>$</span>
                  <span className="text-green-400">curl</span>
                  <span className="text-blue-400">http://localhost:3000/api/users?limit=3</span>
                </div>
                <div className="text-slate-300 overflow-x-auto">
                  <pre>{`{
  "users": [
    { "id": 1, "username": "james.smith1", "email": "james.smith1@example.com" },
    { "id": 2, "username": "mary.johnson2", "email": "mary.johnson2@example.com" },
    { "id": 3, "username": "robert.williams3", "email": "robert.williams3@example.com" }
  ],
  "total": 100,
  "skip": 0,
  "limit": 3
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for API testing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From pre-built endpoints to fully customizable routes, JSON Mock API has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Preview Section */}
      <section id="api" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pre-built API Endpoints</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Ready-to-use endpoints with pagination, filtering, and field selection support.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {Object.keys(apiExamples).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof apiExamples)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  /{key}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <code className="text-sm text-green-400 font-mono">
                  {apiExamples[activeTab].endpoint}
                </code>
                <button
                  onClick={() => window.open(`http://localhost:3000/api/${activeTab}`, '_blank')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Open in browser →
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">
                  {apiExamples[activeTab].response}
                </pre>
              </div>
            </div>

            {/* Additional Endpoints */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {[
                { path: '/api/todos', desc: 'Todo items with completion status' },
                { path: '/api/quotes', desc: 'Inspirational quotes' },
                { path: '/api/team', desc: 'Team member profiles' },
                { path: '/api/reviews', desc: 'Product reviews' },
                { path: '/api/carts', desc: 'Shopping cart data' },
                { path: '/api/comments', desc: 'Blog comments' },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  <code className="text-blue-400 text-sm font-mono">{ep.path}</code>
                  <span className="text-slate-500 text-sm">— {ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for developers, by developers</h2>
              <div className="space-y-4 text-slate-400">
                <p>
                  JSON Mock API started as an internal tool for rapid prototyping and has evolved into
                  a comprehensive mock API solution used by developers worldwide.
                </p>
                <p>
                  Whether you're building a frontend app and need mock data, testing API integrations,
                  or creating educational content, our platform provides the flexibility and reliability
                  you need.
                </p>
                <div className="pt-4 grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-sm text-slate-500">Mock Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">100+</div>
                    <div className="text-sm text-slate-500">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">∞</div>
                    <div className="text-sm text-slate-500">Custom Endpoints</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Perfect for</h3>
              <ul className="space-y-3">
                {[
                  'Frontend developers needing mock data',
                  'API integration testing',
                  'Prototyping new applications',
                  'Educational projects and tutorials',
                  'Load testing and performance benchmarks',
                  'CI/CD pipeline testing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">
            Spin up your own JSON Mock API instance in minutes. Open source and free to use.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              Open Admin Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} JSON Mock API. Built with Next.js and Supabase.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
              Next.js
            </a>
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
              Supabase
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
