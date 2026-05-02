'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_LANDING_CONTENT, type LandingContent } from '@/lib/defaultLandingContent';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#api', label: 'API Docs' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
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
      "lastName": "Smith"
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
      "category": "Electronics",
      "price": 79.99,
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
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'posts'>('users');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/landing-content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg shadow-slate-950/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              JSON Mock API
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <button key={link.href} onClick={() => scrollToSection(link.href)}
                  className="text-sm text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </button>
              ))}
              <Link href="/admin" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Admin
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              {navLinks.map(link => (
                <button key={link.href} onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left py-2 text-slate-400 hover:text-white">{link.label}</button>
              ))}
              <Link href="/admin" className="block mt-2 bg-blue-600 text-center py-2 rounded-lg text-sm font-medium">Admin</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="relative max-w-7xl mx-auto text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">{content.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {content.hero.title}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {content.hero.titleGradient}
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">{content.hero.subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => scrollToSection('#api')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all">
              Explore Endpoints
            </button>
            <Link href="/playground"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all border border-slate-700">
              API Playground
            </Link>
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
                  <span className="text-blue-400">http://localhost:3000/api/users?limit=2</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto">{`{
  "users": [
    { "id": 1, "username": "james.smith1", "email": "james.smith1@example.com" },
    { "id": 2, "username": "mary.johnson2", "email": "mary.johnson2@example.com" }
  ],
  "total": 100, "skip": 0, "limit": 2
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.featuresSection.title}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">{content.featuresSection.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.features.map(feature => (
              <div key={feature.title}
                className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section id="api" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pre-built API Endpoints</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Ready-to-use endpoints with pagination, filtering, search, and sort support.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-6">
              {Object.keys(apiExamples).map(key => (
                <button key={key} onClick={() => setActiveTab(key as keyof typeof apiExamples)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}>
                  /{key}
                </button>
              ))}
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <code className="text-sm text-green-400 font-mono">{apiExamples[activeTab].endpoint}</code>
                <Link href="/playground" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Try in Playground →
                </Link>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">{apiExamples[activeTab].response}</pre>
              </div>
            </div>
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {[
                { path: '/api/todos', desc: 'Todo items with completion status' },
                { path: '/api/quotes', desc: 'Inspirational quotes' },
                { path: '/api/team', desc: 'Team member profiles' },
                { path: '/api/reviews', desc: 'Product reviews' },
                { path: '/api/carts', desc: 'Shopping cart data' },
                { path: '/api/comments', desc: 'Blog comments' },
              ].map(ep => (
                <div key={ep.path} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <code className="text-blue-400 text-sm font-mono">{ep.path}</code>
                  <span className="text-slate-500 text-sm">— {ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{content.about.title}</h2>
              <div className="space-y-4 text-slate-400">
                {content.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                <div className="pt-4 grid grid-cols-3 gap-6">
                  {content.about.stats.map(stat => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Perfect for</h3>
              <ul className="space-y-3">
                {content.about.useCases.map(item => (
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

      {/* Contact */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{content.contact.title}</h2>
          <p className="text-slate-400 mb-8">{content.contact.description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all">
              Open Admin Dashboard
            </Link>
            <Link href="/playground"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all border border-slate-700">
              API Playground
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">© {new Date().getFullYear()} JSON Mock API. Built with Next.js and Supabase.</div>
          <div className="flex items-center gap-6">
            <Link href="/playground" className="text-slate-500 hover:text-white transition-colors text-sm">Playground</Link>
            <Link href="/admin" className="text-slate-500 hover:text-white transition-colors text-sm">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
