import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import { login, signup, logout, loginWithGoogle } from './actions';
import Image from 'next/image';
import Link from 'next/link';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    redirect('/feed');
  }

  return (
    <div className="login-container">
      {/* Background Texture Overlay */}
      <div className="login-bg-texture"></div>

      <div className="login-content">
        {/* Logo Section */}
        <div className="login-logo-section">
          {/* Using amerigam-logo-2.png which is likely the transparent white logo as per instructions */}
          <div className="logo-symbol">
            <Image 
              src="/amerigam-logo-2.png" 
              alt="Amerigam Logo" 
              width={70} 
              height={70} 
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="logo-wordmark">
            A M E R I G A M
          </div>
        </div>

        {/* Text Section */}
        <div className="login-text-section">
          <h1 className="login-headline">Be known for<br />what you do.</h1>
          <p className="login-subtext">
            Build your identity, share your work<br />
            and connect with people who<br />
            think like you.
          </p>
        </div>

        {/* Actions Section */}
        <div className="login-actions">
          {/* Create Account - Primary White Button */}
          <form action={signup}>
            {/* The real app would need a separate signup page or modal for email/password. 
                For now, we keep the formAction but style it as a button. 
                We will use dummy inputs just to make the server action work if needed, 
                or better, redirect to a signup page. For now, it's just a button. */}
            <button type="submit" className="login-btn-primary">
              Create account
            </button>
          </form>

          {/* Log In - Secondary Outlined Button */}
          <form action={login}>
            <button type="button" className="login-btn-secondary" onClick={() => alert('Log In clicked - redirecting to form...')}>
              Log in
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Continue with Google */}
          <form action={loginWithGoogle}>
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
        </div>

        {/* Footer */}
        <div className="login-footer">
          By continuing, you agree to our<br />
          <Link href="/terms" className="login-link">Terms of Service</Link> and <Link href="/privacy" className="login-link">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
