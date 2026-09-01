'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ChallengeCreateClient({ targetUser }: { targetUser: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    category: 'Technology',
    tags: '',
    difficulty: 'Medium',
    startDate: '',
    endDate: '',
    completionReq: '',
    proofReq: 'Photo',
    rules: ''
  });

  const handleNext = () => {
    if (!formData.title || !formData.objective) {
      setError('Title and Objective are required');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengedId: targetUser.id,
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send challenge');
      }
      router.push(`/user/${targetUser.id}`);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, backgroundColor: 'rgba(11,12,16,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <button onClick={() => step === 2 ? setStep(1) : router.back()} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ flex: 1, margin: '0 16px', fontSize: '18px', fontWeight: 600 }}>
          Challenge @{targetUser.username || targetUser.name}
        </h2>
      </header>

      <div style={{ padding: '24px 16px' }}>
        {error && <div style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Challenge Title *</label>
              <input 
                type="text" 
                placeholder="e.g. 30-Day Coding Challenge"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Objective *</label>
              <textarea 
                placeholder="What needs to be achieved?"
                value={formData.objective}
                onChange={e => setFormData({ ...formData, objective: e.target.value })}
                style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
                >
                  <option>Technology</option><option>Sports</option><option>Fitness</option><option>Art</option><option>Design</option>
                  <option>Reading</option><option>Learning</option><option>Music</option><option>Productivity</option><option>Gaming</option>
                  <option>Photography</option><option>Other</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Difficulty</label>
                <select 
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
                >
                  <option>Easy</option><option>Medium</option><option>Hard</option><option>Major</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Tags (comma separated)</label>
              <input 
                type="text" 
                placeholder="coding, daily, productivity"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Start Date (Optional)</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
                  color-scheme="dark"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>End Date (Optional)</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Completion Requirement</label>
              <input 
                type="text" 
                placeholder="What counts as completion?"
                value={formData.completionReq}
                onChange={e => setFormData({ ...formData, completionReq: e.target.value })}
                style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Proof Requirement</label>
              <select 
                value={formData.proofReq}
                onChange={e => setFormData({ ...formData, proofReq: e.target.value })}
                style={{ width: '100%', padding: '12px', background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: 'white', fontSize: '16px' }}
              >
                <option>No proof</option><option>Photo</option><option>Video</option><option>Text/Link</option><option>Manual confirmation</option>
              </select>
            </div>

            <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: 'var(--accent-pink)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '12px' }}>
              Preview Challenge
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '12px', padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ color: '#A1A1AA', fontSize: '14px', margin: '0 0 8px 0' }}>You are challenging</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#27272A', padding: '8px 16px', borderRadius: '24px' }}>
                  {targetUser.avatarData ? (
                    <img src={targetUser.avatarData} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3F3F46' }} />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>@{targetUser.username || targetUser.name}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{formData.title}</h3>
                  <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(29,155,240,0.1)', color: '#1D9BF0', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{formData.difficulty}</span>
                </div>
                
                <div>
                  <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objective</p>
                  <p style={{ fontSize: '15px', lineHeight: 1.5, margin: 0 }}>{formData.objective}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #27272A', paddingTop: '16px' }}>
                  <div>
                    <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0' }}>Category</p>
                    <p style={{ fontSize: '15px', margin: 0, fontWeight: 500 }}>{formData.category}</p>
                  </div>
                  <div>
                    <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0' }}>Proof</p>
                    <p style={{ fontSize: '15px', margin: 0, fontWeight: 500 }}>{formData.proofReq}</p>
                  </div>
                </div>
              </div>
            </div>

            <button disabled={loading} onClick={handleSend} style={{ width: '100%', padding: '14px', background: '#1D9BF0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              <Send size={20} />
              {loading ? 'Sending...' : 'Send Challenge'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
