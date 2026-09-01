'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, User as UserIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Participant {
  id: string; // registrationId
  userId: string;
  name: string;
  username: string;
  avatarData: string;
  status: string;
  qualificationStatus: string | null;
}

interface ResultManagerClientProps {
  event: {
    id: string;
    name: string;
    resultStatus: string;
    creatorName: string | null;
    totalParticipants: number;
    eligibleCount: number;
  };
  participants: Participant[];
  existingResults: { rank: number; registrationId: string }[];
}

export default function ResultManagerClient({ event, participants, existingResults }: ResultManagerClientProps) {
  const router = useRouter();
  
  // Placements state: mapping rank (1 to 10) to registrationId
  const [placements, setPlacements] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    existingResults.forEach(r => {
      initial[r.rank] = r.registrationId;
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Maximum ranks logic
  // If there are less than 10 eligible participants, only show up to that many ranks
  const maxRanks = Math.min(10, event.eligibleCount);

  // Array from 1 to maxRanks
  const ranks = Array.from({ length: maxRanks }, (_, i) => i + 1);

  const getRankLabel = (rank: number) => {
    if (rank === 1) return 'Winner / 1st Place';
    if (rank === 2) return 'Runner-up / 2nd Place';
    if (rank === 3) return '3rd Place';
    return `Top 10 - #${rank}`;
  };

  const handleSelect = (rank: number, registrationId: string) => {
    setError('');
    // Remove if selecting empty
    if (!registrationId) {
      const newP = { ...placements };
      delete newP[rank];
      setPlacements(newP);
      return;
    }

    // Check if registrationId is already used in another rank
    const existingRank = Object.entries(placements).find(([r, id]) => id === registrationId && Number(r) !== rank);
    if (existingRank) {
      setError(`This participant is already assigned to Rank #${existingRank[0]}`);
      return;
    }

    setPlacements(prev => ({ ...prev, [rank]: registrationId }));
  };

  const handleSave = async (isPublishing: boolean) => {
    setError('');
    setLoading(true);

    try {
      // Validate unique (already done by state constraints, but double check)
      const ids = Object.values(placements);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        throw new Error('Duplicate participants assigned.');
      }

      // Convert to array
      const resultsArray = Object.entries(placements).map(([r, regId]) => ({
        rank: Number(r),
        registrationId: regId
      }));

      const res = await fetch(`/api/competitions/${event.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: resultsArray,
          action: isPublishing ? 'PUBLISH' : 'DRAFT'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save results');
      }

      if (isPublishing) {
        router.push(`/competitions/${event.id}`);
      } else {
        router.refresh(); // Update draft status if any
        setShowConfirm(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Render a clean participant option
  const renderParticipantOption = (p: Participant) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#3F3F46', flexShrink: 0, position: 'relative' }}>
          {p.avatarData && p.avatarData.startsWith('http') ? (
            <Image src={p.avatarData} alt={p.name} fill style={{ objectFit: 'cover' }} />
          ) : (
             <UserIcon size={12} color="#FFF" style={{ position: 'absolute', top: '4px', left: '4px' }} />
          )}
        </div>
        <span style={{ fontSize: '14px', color: '#FFF' }}>{p.name} <span style={{ color: '#A1A1AA' }}>@{p.username}</span></span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'PUBLISHED') return '#10B981';
    if (status === 'DRAFT') return '#F59E0B';
    return '#6B7280';
  };

  if (showConfirm) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#FFF', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Confirm Publish</h1>
        <p style={{ color: '#A1A1AA', marginBottom: '24px', lineHeight: '1.5' }}>
          Publishing these results will make them visible to the public and all participants. Are you sure?
        </p>
        
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          {ranks.filter(r => placements[r]).map(rank => {
            const p = participants.find(p => p.id === placements[rank]);
            if (!p) return null;
            return (
              <div key={rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1F1F22' }}>
                <span style={{ fontWeight: rank <= 3 ? 700 : 500, color: rank <= 3 ? '#3B82F6' : '#A1A1AA' }}>{getRankLabel(rank)}</span>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            style={{ flex: 1, padding: '16px', backgroundColor: '#1F1F22', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            style={{ flex: 1, padding: '16px', backgroundColor: '#1D9BF0', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Publishing...' : 'Publish Results'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#FFF', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F1F22', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <Link href={`/competitions/${event.id}`} style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Manage Results</h1>
          <div style={{ fontSize: '13px', color: '#A1A1AA' }}>{event.name}</div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', backgroundColor: getStatusColor(event.resultStatus), borderRadius: '12px', color: '#FFF' }}>
          {event.resultStatus === 'NOT_STARTED' ? 'Not Started' : event.resultStatus === 'PUBLISHED' ? 'Published' : 'Draft'}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <div style={{ flex: 1, backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '4px' }}>Total</div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{event.totalParticipants}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '4px' }}>Eligible</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#3B82F6' }}>{event.eligibleCount}</div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {event.eligibleCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#0A0A0A', borderRadius: '12px', border: '1px solid #1F1F22' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Eligible Participants</div>
            <p style={{ fontSize: '14px', color: '#A1A1AA', margin: 0, lineHeight: '1.5' }}>
              You need participants who are Qualified (or Accepted if there are no qualification rounds) to assign results.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {ranks.map(rank => (
              <div key={rank} style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: rank <= 3 ? '#3B82F6' : '#FFF', marginBottom: '12px' }}>
                  {getRankLabel(rank)}
                </label>
                <select
                  value={placements[rank] || ''}
                  onChange={(e) => handleSelect(rank, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1F1F22',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '15px',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="">Select Participant</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (@{p.username}) - {p.qualificationStatus || p.status}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {event.eligibleCount > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.9)', borderTop: '1px solid #1F1F22', display: 'flex', gap: '12px', zIndex: 20 }}>
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#1F1F22',
              border: '1px solid #3F3F46',
              color: '#FFF',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Save size={18} />
            Save Draft
          </button>
          
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#1D9BF0',
              border: 'none',
              color: '#FFF',
              borderRadius: '12px',
              padding: '16px',
              fontWeight: 700,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Upload size={18} />
            Publish
          </button>
        </div>
      )}
    </div>
  );
}
