'use client';

import { useState, useTransition } from 'react';
import { completeCreatorOnboarding } from './actions';
import { createClient } from '@/utils/supabase/client';
import AvatarCropUpload from '../components/AvatarCropUpload';

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

  const handleFinish = () => {
    setError('');
    startTransition(async () => {
      let finalAvatarUrl = avatarUrl;
      if (avatarUrl && avatarUrl.startsWith('data:')) {
        const supabase = createClient();
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const fileName = `avatar-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, blob, { contentType: 'image/jpeg' });
        if (data && !error) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
          finalAvatarUrl = urlData.publicUrl;
        }
      }
      const result = await completeCreatorOnboarding({ username, bio, avatarUrl: finalAvatarUrl || undefined, creatorType, niche });
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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <AvatarCropUpload onImageReady={(base64) => setAvatarUrl(base64)} placeholder="🎥" label="Add profile photo" />
          </div>

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
