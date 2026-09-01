'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signupNewUser } from './actions';

const ACCOUNT_TYPES = [
  {
    id: 'PERSONAL',
    icon: '🧑',
    title: 'Personal',
    desc: 'For individuals building identity, skills, career, hobbies and achievements.',
  },
  {
    id: 'BUSINESS',
    icon: '🏢',
    title: 'Business',
    desc: 'For companies, startups, brands and organizations operating as businesses.',
  },
  {
    id: 'CREATOR',
    icon: '🎥',
    title: 'Content Creator',
    desc: 'For video/content creators and creator brands.',
  },
  {
    id: 'INFLUENCER',
    icon: '⭐',
    title: 'Influencer',
    desc: 'For public/social influence-focused profiles.',
  },
  {
    id: 'ORGANIZATION',
    icon: '🏆',
    title: 'Competition Organization',
    desc: 'For organizations that host and manage competitions.',
  },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'PERSONAL',
  });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Please enter your full name.');
    if (!formData.email.trim()) return setError('Please enter your email.');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');

    setStep(2);
  };

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('password', formData.password);
      fd.append('confirmPassword', formData.confirmPassword);
      fd.append('accountType', formData.accountType);

      const result = await signupNewUser(fd);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="login-container">
      <div className="login-bg-texture" />
      <div className="login-content">

        {/* Header */}
        <div className="login-logo-section" style={{ marginBottom: '32px' }}>
          <div className="logo-wordmark">A M E R I G A M</div>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#71717A' }}>Step {step} of 2</span>
            <span style={{ fontSize: '13px', color: '#71717A' }}>
              {step === 1 ? 'Account details' : 'Choose account type'}
            </span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: '#3B82F6', borderRadius: '99px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1Continue} style={{ width: '100%' }}>
            <div className="login-form-group">
              <input
                className="login-input"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                autoComplete="name"
                required
              />
              <input
                className="login-input"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                autoComplete="email"
                required
              />
              <input
                className="login-input"
                type="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
                required
              />
              <input
                className="login-input"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn-primary">
              Continue →
            </button>

            <p style={{ textAlign: 'center', color: '#71717A', fontSize: '14px', marginTop: '20px' }}>
              Already have an account?{' '}
              <Link href="/signin" className="login-link">Sign in</Link>
            </p>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0' }}>Choose your account type</h2>
            <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 20px 0' }}>
              This helps Amerigam personalize your experience.
            </p>

            {ACCOUNT_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData(p => ({ ...p, accountType: type.id }))}
                className={`account-type-card ${formData.accountType === type.id ? 'selected' : ''}`}
              >
                <span className="account-type-card-icon">{type.icon}</span>
                <div>
                  <div className="account-type-card-title">{type.title}</div>
                  <div className="account-type-card-desc">{type.desc}</div>
                </div>
              </button>
            ))}

            {error && <p className="login-error" style={{ marginTop: '8px' }}>{error}</p>}

            <button
              type="button"
              className="login-btn-primary"
              style={{ marginTop: '16px' }}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Creating account…' : 'Create Account'}
            </button>

            <button
              type="button"
              className="login-btn-secondary"
              style={{ marginTop: '10px' }}
              onClick={() => { setStep(1); setError(''); }}
            >
              ← Back
            </button>
          </div>
        )}

        <div className="login-footer" style={{ marginTop: '32px' }}>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="login-link">Terms</Link> and{' '}
          <Link href="/privacy" className="login-link">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
