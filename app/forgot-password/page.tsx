'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email.');
    setError('');
    setLoading(true);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/api/auth/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-texture" />
      <div className="login-content">
        <div className="login-logo-section" style={{ marginBottom: '40px' }}>
          <div className="logo-wordmark">A M E R I G A M</div>
        </div>

        {!sent ? (
          <>
            <div style={{ width: '100%', marginBottom: '28px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px 0' }}>Reset your password</h1>
              <p style={{ color: '#71717A', fontSize: '15px', margin: 0 }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="login-form-group">
                <input
                  className="login-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', marginTop: '24px' }}>
              Remembered it?{' '}
              <Link href="/signin" className="login-link">Sign in</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0' }}>Check your email</h2>
            <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: 1.6 }}>
              We sent a password reset link to<br />
              <strong style={{ color: 'white' }}>{email}</strong>
            </p>
            <Link href="/signin" className="login-btn-secondary" style={{ marginTop: '32px', display: 'block', textAlign: 'center', textDecoration: 'none', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
