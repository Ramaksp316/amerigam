import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import { login, signup, logout, loginWithGoogle } from './actions';
import SubmitButton from './SubmitButton';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '0', overflow: 'hidden', textAlign: 'center' }}>
          {/* Top Banner */}
          <div style={{ background: 'var(--gradient-primary)', padding: 'var(--space-8) var(--space-6)', color: '#FFFFFF' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 'var(--space-2)' }}>
              AMERIGAM
            </h1>
            <p style={{ opacity: 0.9, fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              You are already logged in
            </p>
          </div>
          {/* Body */}
          <div style={{ padding: 'var(--space-6)' }}>
            <a href="/feed" className="btn" style={{ marginBottom: 'var(--space-4)', display: 'flex' }}>
              Go to Feed
            </a>
            <form action={logout}>
              <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
                Log Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: 0, overflow: 'hidden' }}>
        
        {/* Top Gradient Banner */}
        <div style={{ 
          background: 'var(--gradient-primary)', 
          padding: 'var(--space-8) var(--space-6)', 
          textAlign: 'center', 
          color: '#FFFFFF' 
        }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 'var(--space-1)', textTransform: 'uppercase' }}>
            Amerigam
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, opacity: 0.95, letterSpacing: '0.5px' }}>
            CONNECT • CREATE • SHARE
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: 'var(--space-6)' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            Welcome back to the collective.
          </p>

          {/* Google Login Button */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <form action={loginWithGoogle}>
              <button type="submit" className="btn btn-outline" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 'var(--space-3)', 
                width: '100%',
                fontWeight: 600
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <div className="divider">OR</div>

          <form>
            <div>
              <input type="email" name="email" className="input-field" placeholder="Email Address" required />
            </div>
            <div>
              <input type="password" name="password" className="input-field" placeholder="Password..." required />
            </div>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <input type="password" name="confirmPassword" className="input-field" placeholder="Confirm Password (for signup)" />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <SubmitButton formAction={login} text="LOG IN" />
              <SubmitButton formAction={signup} text="SIGN UP" variant="secondary" />
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
