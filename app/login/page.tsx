import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import { login, signup, logout, loginWithGoogle } from './actions';
import SubmitButton from './SubmitButton'; // We'll create this to handle loading states

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>You are already logged in.</h2>
        <a href="/feed" className="btn" style={{ marginBottom: '15px', display: 'inline-block' }}>Go to Feed</a>
        <form action={logout}>
          <button type="submit" className="btn btn-text">Log Out</button>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="heading-jakaas">
          CONNECT,<br/>CREATE<br/>& SHARE
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back to the collective.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <form action={loginWithGoogle}>
          <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
            <span style={{ fontSize: '1.2rem' }}>G</span> Continue with Google
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
        <div style={{ marginBottom: '20px' }}>
          <input type="password" name="confirmPassword" className="input-field" placeholder="Confirm Password (for signup)" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <SubmitButton formAction={login} text="LOG IN" />
          <SubmitButton formAction={signup} text="SIGN UP" variant="secondary" />
        </div>
      </form>
    </div>
  );
}
