'use client';

import { useState, useTransition } from 'react';
import { completeInfluencerOnboarding } from './actions';
import { createClient } from '@/utils/supabase/client';

const INFLUENCER_TYPES = ['Nano (1K–10K)', 'Micro (10K–100K)', 'Macro (100K–1M)', 'Celebrity (1M+)'];
const NICHES = ['Fashion', 'Lifestyle', 'Technology', 'Food & Cooking', 'Travel', 'Fitness & Health', 'Beauty', 'Gaming', 'Business & Finance', 'Entertainment', 'Sports', 'Education', 'Photography', 'Music', 'Other'];

export default function InfluencerOnboarding({ initialData }: { initialData: { name: string; email: string; username: string } }) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState(initialData.name || '');
  const [username, setUsername] = useState(initialData.username || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [influencerType, setInfluencerType] = useState('');
  const [mainNiche, setMainNiche] = useState('');
  const [bio, setBio] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const fileName = `avatar-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const { data, error: ue } = await supabase.storage.from('uploads').upload(fileName, file, { contentType: file.type });
      if (ue) throw ue;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path);
      setAvatarUrl(publicUrl);
    } catch { setError('Photo upload failed.'); }
    finally { setAvatarUploading(false); }
  };

  const handleFinish = () => {
    setError('');
    startTransition(async () => {
      const result = await completeInfluencerOnboarding({ username, bio, avatarUrl: avatarUrl || undefined, influencerType, mainNiche });
      if (result?.error) setError(result.error);
    });
  };

  const progressPct = Math.round((step / 3) * 100);

  return (
    <div className="onboarding-container">
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Step {step} of 3</span>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Influencer Setup</span>
      </div>
      <div className="onboarding-progress-bar"><div className="onboarding-progress-fill" style={{ width: `${progressPct}%` }} /></div>
      {error && <p className="login-error">{error}</p>}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Influencer Profile</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 24px 0' }}>Set up your public identity.</p>

          <label htmlFor="influencer-avatar" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: avatarUrl ? 'transparent' : 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>⭐</span>}
            </div>
            <span style={{ marginTop: '8px', fontSize: '13px', color: '#71717A' }}>{avatarUploading ? 'Uploading…' : 'Add profile photo'}</span>
          </label>
          <input id="influencer-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="onboarding-input" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }}>@</span>
              <input className="onboarding-input" style={{ paddingLeft: '28px' }} placeholder="username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())} />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="btn-onboarding-primary" onClick={() => { if (!username || username.length < 3) return setError('Username must be at least 3 characters.'); setError(''); setStep(2); }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Your influence category</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 16px 0' }}>Tell us your audience size and your main niche.</p>

          <label style={{ fontSize: '13px', color: '#A1A1AA', display: 'block', marginBottom: '8px' }}>Audience Size</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {INFLUENCER_TYPES.map(t => (
              <button key={t} className={`onboarding-pill ${influencerType === t ? 'selected' : ''}`} onClick={() => setInfluencerType(t)}>{t}</button>
            ))}
          </div>

          <label style={{ fontSize: '13px', color: '#A1A1AA', display: 'block', marginBottom: '8px' }}>Main Niche</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {NICHES.map(n => (
              <button key={n} className={`onboarding-pill ${mainNiche === n ? 'selected' : ''}`} onClick={() => setMainNiche(n)}>{n}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => setStep(3)}>Continue →</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={() => setStep(3)}>Skip</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Your bio</h2>
          <textarea className="onboarding-input" placeholder="Tell your audience what you're about…" value={bio} onChange={e => setBio(e.target.value.slice(0, 200))} rows={4} style={{ resize: 'none', marginBottom: '4px' }} />
          <p style={{ textAlign: 'right', fontSize: '12px', color: '#52525B' }}>{bio.length}/200</p>
          {error && <p className="login-error">{error}</p>}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={handleFinish} disabled={isPending}>{isPending ? 'Setting up…' : '🎉 Go to Amerigam'}</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={handleFinish} disabled={isPending}>Skip & finish</button>
          </div>
        </div>
      )}
    </div>
  );
}
