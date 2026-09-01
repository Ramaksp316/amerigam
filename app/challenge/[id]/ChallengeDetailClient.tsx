'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ChallengeDetailClient({ challenge, currentUserId }: { challenge: any, currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proofText, setProofText] = useState('');
  
  const isChallenger = currentUserId === challenge.challengerId;
  const isChallenged = currentUserId === challenge.challengedId;

  const handleAction = async (action: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, proofText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
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
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ flex: 1, margin: '0 16px', fontSize: '18px', fontWeight: 600 }}>Challenge Detail</h2>
      </header>

      <div style={{ padding: '24px 16px' }}>
        {error && <div style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(29,155,240,0.1)', color: '#1D9BF0', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{challenge.difficulty}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: challenge.status === 'COMPLETED' ? '#10B981' : '#A1A1AA' }}>{challenge.status}</span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 16px 0', color: 'white' }}>{challenge.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #27272A' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={challenge.challenger.avatarData || ''} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3F3F46', objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA' }}>Challenger</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>@{challenge.challenger.username}</p>
              </div>
            </div>
            <div style={{ color: '#A1A1AA', fontWeight: 600 }}>VS</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', textAlign: 'right' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#A1A1AA' }}>Challenged</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>@{challenge.challenged.username}</p>
              </div>
              <img src={challenge.challenged.avatarData || ''} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3F3F46', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', color: '#A1A1AA', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objective</h3>
            <p style={{ fontSize: '16px', lineHeight: 1.5, margin: 0 }}>{challenge.objective}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0' }}>Category</p>
              <p style={{ fontSize: '15px', margin: 0, fontWeight: 500 }}>{challenge.category || 'General'}</p>
            </div>
            <div>
              <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0' }}>Proof Needed</p>
              <p style={{ fontSize: '15px', margin: 0, fontWeight: 500 }}>{challenge.proofReq}</p>
            </div>
          </div>

          {challenge.completionReq && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0 0 4px 0' }}>Completion Requirement</p>
              <p style={{ fontSize: '15px', margin: 0 }}>{challenge.completionReq}</p>
            </div>
          )}

          {challenge.proofText && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(29,155,240,0.05)', borderRadius: '8px', border: '1px solid rgba(29,155,240,0.2)' }}>
              <h3 style={{ fontSize: '14px', color: '#1D9BF0', margin: '0 0 8px 0' }}>Submitted Proof</h3>
              <p style={{ fontSize: '15px', margin: 0 }}>{challenge.proofText}</p>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {challenge.status === 'PENDING' && isChallenged && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={loading} onClick={() => handleAction('ACCEPT')} style={{ flex: 1, padding: '14px', background: '#1D9BF0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                Accept Challenge
              </button>
              <button disabled={loading} onClick={() => handleAction('DECLINE')} style={{ flex: 1, padding: '14px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                Decline
              </button>
            </div>
          )}

          {challenge.status === 'PENDING' && isChallenger && (
            <button disabled={loading} onClick={() => handleAction('CANCEL')} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel Request
            </button>
          )}

          {challenge.status === 'ACTIVE' && isChallenged && (
            <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>Submit Proof of Completion</h3>
              <textarea 
                placeholder="Describe your completion or drop a link..."
                value={proofText}
                onChange={e => setProofText(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#27272A', border: 'none', borderRadius: '8px', color: 'white', fontSize: '15px', minHeight: '80px', marginBottom: '12px', resize: 'vertical' }}
              />
              <button disabled={loading || (!proofText && challenge.proofReq !== 'No proof')} onClick={() => handleAction('SUBMIT')} style={{ width: '100%', padding: '14px', background: 'var(--accent-pink)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                Submit for Verification
              </button>
            </div>
          )}

          {challenge.status === 'SUBMITTED' && isChallenger && (
            <div style={{ background: '#18181B', border: '1px solid #1D9BF0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: '#1D9BF0' }}>Verification Required</h3>
              <p style={{ fontSize: '14px', color: '#A1A1AA', marginBottom: '16px' }}>The challenged user has submitted proof. Please review and verify.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button disabled={loading} onClick={() => handleAction('APPROVE')} style={{ flex: 1, padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={20} /> Approve
                </button>
                <button disabled={loading} onClick={() => handleAction('REJECT')} style={{ flex: 1, padding: '14px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <X size={20} /> Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
