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
  const [glitchActive, setGlitchActive] = useState(false);

  // Trigger glitch effect periodically
  useState(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 7000 + Math.random() * 3000);
    return () => clearInterval(interval);
  });

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
    if (length === 0) return { label: '', color: '' };
    if (length < 6) return { label: 'WEAK', color: 'text-red-400' };
    if (length < 10) return { label: 'MODERATE', color: 'text-yellow-400' };
    return { label: 'STRONG', color: 'text-green-400' };
  };

  const strength = getPasswordStrength();

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

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-green-500 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header with glitch effect */}
          <div className={`text-center mb-8 ${glitchActive ? 'animate-pulse' : ''}`}>
            <div className="inline-block relative">
              <h1 className="text-4xl font-bold text-green-400 tracking-wider" style={{ textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>
                [ NEW USER ]
              </h1>
              {glitchActive && (
                <>
                  <h1 className="absolute top-0 left-0 text-4xl font-bold text-red-400 tracking-wider opacity-50" style={{ transform: 'translate(-2px, 0)', textShadow: '2px 0 red' }}>
                    [ NEW USER ]
                  </h1>
                  <h1 className="absolute top-0 left-0 text-4xl font-bold text-cyan-400 tracking-wider opacity-50" style={{ transform: 'translate(2px, 0)', textShadow: '-2px 0 cyan' }}>
                    [ NEW USER ]
                  </h1>
                </>
              )}
            </div>
            <p className="mt-2 text-green-600 text-sm">
              &gt; REGISTRATION_PROTOCOL
            </p>
            <div className="mt-1 flex items-center justify-center gap-1">
              {[...Array(40)].map((_, i) => (
                <span key={i} className="text-green-800 text-xs">█</span>
              ))}
            </div>
          </div>

          {/* Registration form container */}
          <div className="border border-green-800 bg-black/80 backdrop-blur-sm p-8 relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-green-500" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-green-500" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-500" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-green-500" />

            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs text-green-600">
                {loading ? 'PROCESSING...' : 'SYSTEM_READY'}
              </span>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-3 border border-red-800 bg-red-950/30 text-red-400 text-sm">
                <span className="text-red-500">[!] ERROR:</span> {error}
              </div>
            )}

            {/* Success display */}
            {success && (
              <div className="mb-6 p-3 border border-green-800 bg-green-950/30 text-green-400 text-sm">
                <span className="text-green-500">[✓] SUCCESS:</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <div className="relative">
                <label className="block text-xs text-green-600 mb-1">
                  &gt; USERNAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black border border-green-800 text-green-400 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-green-900"
                    placeholder="Choose username..."
                    autoComplete="username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-800 text-xs">
                    {username.length > 0 && '✓'}
                  </div>
                </div>
              </div>

              {/* Email field */}
              <div className="relative">
                <label className="block text-xs text-green-600 mb-1">
                  &gt; EMAIL_ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-green-800 text-green-400 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-green-900"
                    placeholder="Enter email..."
                    autoComplete="email"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-800 text-xs">
                    {email.includes('@') && '✓'}
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div className="relative">
                <label className="block text-xs text-green-600 mb-1">
                  &gt; PASSWORD
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-green-800 text-green-400 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-green-900"
                    placeholder="Create password..."
                    autoComplete="new-password"
                  />
                </div>
                {password.length > 0 && (
                  <div className={`mt-1 text-xs ${strength.color}`}>
                    STRENGTH: {strength.label}
                  </div>
                )}
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <label className="block text-xs text-green-600 mb-1">
                  &gt; CONFIRM_PASSWORD
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black border border-green-800 text-green-400 px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-green-900"
                    placeholder="Confirm password..."
                    autoComplete="new-password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                    {confirmPassword && password === confirmPassword ? (
                      <span className="text-green-500">✓ MATCH</span>
                    ) : confirmPassword && password !== confirmPassword ? (
                      <span className="text-red-500">✗ MISMATCH</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || success !== ''}
                className="w-full bg-green-900/20 border border-green-700 text-green-400 py-3 px-4 hover:bg-green-900/40 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm font-semibold relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="animate-spin">◐</span>
                      Creating account...
                    </>
                  ) : success ? (
                    <>
                      <span>✓</span>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <span>INITIATE_REGISTRATION</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
                {/* Button hover effect */}
                <div className="absolute inset-0 bg-green-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-300" />
              </button>
            </form>

            {/* Info box */}
            <div className="mt-6 p-4 border border-green-900 bg-green-950/10">
              <p className="text-xs text-green-600">
                <span className="text-green-500">[i] NOTE:</span> All new accounts require admin approval before access is granted.
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-green-900" />
              <span className="text-green-800 text-xs">OR</span>
              <div className="flex-1 h-px bg-green-900" />
            </div>

            {/* Login link */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-400 transition-colors text-sm group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>RETURN_TO_LOGIN</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-6 text-center">
            <p className="text-green-800 text-xs">
              ENCRYPTION: BCRYPT-12 | SECURITY: JWT-AES256
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-green-900 text-xs">
              {[...Array(20)].map((_, i) => (
                <span key={i} className="hover:text-green-600 cursor-pointer transition-colors">▒</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ASCII art decoration */}
      <div className="fixed bottom-4 right-4 z-0 text-green-900 text-xs font-mono opacity-30 hidden lg:block">
        <pre>{`
   /  ___|  __ \\
   \\  \\--| /  \\/
    \\  \\  | |
   /\\__/  | \\__/\\
   \\______/\\____/
        `}</pre>
      </div>
    </div>
  );
}
