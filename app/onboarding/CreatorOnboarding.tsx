'use client';

import { useState, useTransition } from 'react';
import { completeCreatorOnboarding } from './actions';
import { createClient } from '@/utils/supabase/client';

const CREATOR_TYPES = ['Tech Creator', 'Lifestyle Creator', 'Gaming Creator', 'Fashion Creator', 'Food Creator', 'Travel Creator', 'Educational Creator', 'Entertainment Creator', 'Sports Creator', 'Beauty Creator', 'Other'];

export default function CreatorOnboarding({ initialData }: { initialData: { name: string; email: string; username: string } }) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState(initialData.name || '');
  const [username, setUsername] = useState(initialData.username || '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [creatorType, setCreatorType] = useState('');
  const [niche, setNiche] = useState('');
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
      const result = await completeCreatorOnboarding({ username, bio, avatarUrl: avatarUrl || undefined, creatorType, niche });
      if (result?.error) setError(result.error);
    });
  };

  const progressPct = Math.round((step / 3) * 100);

  return (
    <div className="onboarding-container">
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Step {step} of 3</span>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Creator Setup</span>
      </div>
      <div className="onboarding-progress-bar"><div className="onboarding-progress-fill" style={{ width: `${progressPct}%` }} /></div>
      {error && <p className="login-error">{error}</p>}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Creator Profile</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 24px 0' }}>Set up your creator identity.</p>

          <label htmlFor="creator-avatar" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: avatarUrl ? 'transparent' : 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>🎥</span>}
            </div>
            <span style={{ marginTop: '8px', fontSize: '13px', color: '#71717A' }}>{avatarUploading ? 'Uploading…' : 'Add profile photo'}</span>
          </label>
          <input id="creator-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="onboarding-input" placeholder="Creator / Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }}>@</span>
              <input className="onboarding-input" style={{ paddingLeft: '28px' }} placeholder="username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => { if (!username || username.length < 3) return setError('Username must be at least 3 characters.'); setError(''); setStep(2); }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>What do you create?</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 20px 0' }}>Choose your creator category.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {CREATOR_TYPES.map(t => (
              <button key={t} className={`onboarding-pill ${creatorType === t ? 'selected' : ''}`} onClick={() => setCreatorType(t)}>{t}</button>
            ))}
          </div>

          <input className="onboarding-input" placeholder="Your content niche (e.g. AI tools, Street food, Indie games)" value={niche} onChange={e => setNiche(e.target.value)} />

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => setStep(3)}>Continue →</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={() => setStep(3)}>Skip</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Your creator bio</h2>
          <textarea className="onboarding-input" placeholder="Describe what you create and what people can expect from you…" value={bio} onChange={e => setBio(e.target.value.slice(0, 200))} rows={4} style={{ resize: 'none', marginBottom: '8px' }} />
          <p style={{ textAlign: 'right', fontSize: '12px', color: '#52525B', marginTop: '0' }}>{bio.length}/200</p>
          {error && <p className="login-error">{error}</p>}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={handleFinish} disabled={isPending}>{isPending ? 'Setting up…' : '🎉 Start Creating'}</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={handleFinish} disabled={isPending}>Skip & finish</button>
          </div>
        </div>
      )}
    </div>
  );
}
