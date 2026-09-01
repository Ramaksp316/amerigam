'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, loginWithGoogle } from '../login/actions';

export default function SignInPage() {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
      // On success, login() redirects to /feed server-side
    });
  };

  return (
    <div className="login-container">
      <div className="login-bg-texture" />
      <div className="login-content">

        {/* Logo */}
        <div className="login-logo-section" style={{ marginBottom: '40px' }}>
          <div className="logo-wordmark">A M E R I G A M</div>
        </div>

        <div style={{ width: '100%', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 6px 0', textAlign: 'center' }}>
            Welcome back
          </h1>
          <p style={{ color: '#71717A', fontSize: '15px', textAlign: 'center', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {/* Email / Password form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="login-form-group">
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Email address"
              autoComplete="email"
              required
            />
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '20px' }}>
            <Link href="/forgot-password" className="login-link" style={{ fontSize: '13px', color: '#71717A' }}>
              Forgot password?
            </Link>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn-primary" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Google OAuth */}
        <form action={loginWithGoogle} style={{ width: '100%' }}>
          <button type="submit" className="login-btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="login-link">Sign up</Link>
        </p>

        <div className="login-footer" style={{ marginTop: '16px' }}>
          <Link href="/login/test-accounts" style={{ color: '#3F3F46', fontSize: '12px', textDecoration: 'none' }}>
            Dev: Switch test account
          </Link>
        </div>
      </div>
    </div>
  );
}
