'use client';

import { useState, useTransition } from 'react';
import { completeOrgOnboarding } from './actions';
import { createClient } from '@/utils/supabase/client';

const ORG_TYPES = ['Sports Organization', 'Hackathon Organizer', 'Academic Institution', 'Government Body', 'NGO / Non-profit', 'Corporate Event Organizer', 'Cultural Organization', 'Gaming Tournament', 'Skill Competition', 'Other'];

export default function OrgOnboarding({ initialData }: { initialData: { name: string; email: string; username: string } }) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [orgName, setOrgName] = useState(initialData.name || '');
  const [username, setUsername] = useState(initialData.username || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [orgType, setOrgType] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const supabase = createClient();
      const fileName = `logo-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const { data, error: ue } = await supabase.storage.from('uploads').upload(fileName, file, { contentType: file.type });
      if (ue) throw ue;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path);
      setLogoUrl(publicUrl);
    } catch { setError('Logo upload failed.'); }
    finally { setLogoUploading(false); }
  };

  const handleFinish = () => {
    setError('');
    startTransition(async () => {
      const result = await completeOrgOnboarding({
        username, orgName, bio,
        avatarUrl: logoUrl || undefined,
        orgType,
        location: city ? `${city}, ${country}`.trim().replace(/^, /, '') : country,
        country,
      });
      if (result?.error) setError(result.error);
    });
  };

  const progressPct = Math.round((step / 3) * 100);

  return (
    <div className="onboarding-container">
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Step {step} of 3</span>
        <span style={{ fontSize: '13px', color: '#71717A' }}>Organization Setup</span>
      </div>
      <div className="onboarding-progress-bar"><div className="onboarding-progress-fill" style={{ width: `${progressPct}%` }} /></div>
      {error && <p className="login-error">{error}</p>}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Organization Profile</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 24px 0' }}>Set up your organization's presence on Amerigam. Organizations can create and host competitions.</p>

          <label htmlFor="org-logo" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: 96, height: 96, borderRadius: '16px', background: logoUrl ? 'transparent' : 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>🏆</span>}
            </div>
            <span style={{ marginTop: '8px', fontSize: '13px', color: '#71717A' }}>{logoUploading ? 'Uploading…' : 'Add organization logo'}</span>
          </label>
          <input id="org-logo" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="onboarding-input" placeholder="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} />
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }}>@</span>
              <input className="onboarding-input" style={{ paddingLeft: '28px' }} placeholder="orghandle" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={() => { if (!orgName) return setError('Organization name is required.'); if (!username || username.length < 3) return setError('Username must be at least 3 characters.'); setError(''); setStep(2); }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>Organization type</h2>
          <p style={{ color: '#71717A', fontSize: '14px', margin: '0 0 16px 0' }}>What kind of competitions do you organize?</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {ORG_TYPES.map(t => (
              <button key={t} className={`onboarding-pill ${orgType === t ? 'selected' : ''}`} onClick={() => setOrgType(t)}>{t}</button>
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>About your organization</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <textarea className="onboarding-input" placeholder="Describe your organization and the competitions you host…" value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={4} style={{ resize: 'none' }} />
            <input className="onboarding-input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
            <input className="onboarding-input" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
          </div>

          {error && <p className="login-error">{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-onboarding-primary" onClick={handleFinish} disabled={isPending}>{isPending ? 'Setting up…' : '🏆 Launch Organization Profile'}</button>
            <button className="btn-onboarding-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-onboarding-skip" onClick={handleFinish} disabled={isPending}>Skip & finish</button>
          </div>
        </div>
      )}
    </div>
  );
}
