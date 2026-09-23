'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DevBoardLoginPage() {
  const [pin, setPin] = useState(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  const [pinStr, setPinStr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirected = searchParams.get('redirect') === 'true';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinStr.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/dev/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinStr }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dev-board/dashboard');
      } else {
        setShake(true);
        setError('Access Denied. Wrong PIN.');
        setPinStr('');
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050507',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />
      {/* Top-center glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        padding: '0 24px',
        animation: shake ? 'devShake 0.5s ease' : 'none',
      }}>
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            marginBottom: '20px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#FAFAFA',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
          }}>
            Mission Control
          </h1>
          <p style={{ fontSize: '13px', color: '#52525B', margin: 0 }}>
            Amerigam Developer Board
          </p>
          {redirected && (
            <p style={{
              marginTop: '10px',
              fontSize: '12px',
              color: '#EF4444',
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              Session expired. Please re-authenticate.
            </p>
          )}
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717A',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              Access PIN
            </label>
            <input
              ref={inputRef}
              type="password"
              value={pinStr}
              onChange={e => setPinStr(e.target.value)}
              placeholder="Enter your secure PIN"
              autoComplete="current-password"
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '0 18px',
                fontSize: '16px',
                color: '#FAFAFA',
                outline: 'none',
                letterSpacing: pinStr ? '4px' : 'normal',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              marginBottom: '16px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
                <path d="M12 8v5M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#EF4444' }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pinStr.trim()}
            style={{
              width: '100%',
              height: '52px',
              background: loading || !pinStr.trim()
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading || !pinStr.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'devSpin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Verifying...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Authenticate
              </>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '11px',
          color: '#3F3F46',
        }}>
          Amerigam Dev Board · Restricted Access
        </p>
      </div>

      <style>{`
        @keyframes devShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        @keyframes devSpin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #3F3F46; letter-spacing: normal; }
        input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  );
}
