'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(data.message || 'Registration successful!');

      // Redirect to login after delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const length = password.length;
    if (length === 0) return { label: '', color: 'bg-slate-700' };
    if (length < 6) return { label: 'Weak', color: 'bg-red-500' };
    if (length < 10) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              JSON Mock API
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-slate-400">Get started with your free account</p>
          </div>

          {/* Registration form container */}
          <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
            {/* Error display */}
            {error && (
              <div className="mb-6 p-3 border border-red-800 bg-red-950/30 text-red-400 text-sm rounded-lg">
                <span className="text-red-500">Error:</span> {error}
              </div>
            )}

            {/* Success display */}
            {success && (
              <div className="mb-6 p-3 border border-green-800 bg-green-950/30 text-green-400 text-sm rounded-lg">
                <span className="text-green-500">Success:</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 rounded-full ${strength.color} transition-colors`} />
                    <span className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </div>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <div className="mt-1 text-xs text-red-400">
                    Passwords do not match
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || success !== ''}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-600/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">◐</span>
                    Creating account...
                  </span>
                ) : success ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Redirecting...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-slate-500 text-sm">or</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Login link */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Already have an account?{' '}
                <span className="text-blue-400 hover:text-blue-300">Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
