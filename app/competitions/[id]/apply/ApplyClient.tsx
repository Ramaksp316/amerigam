'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info, MapPin, Calendar, Building2, AlertCircle } from 'lucide-react';

export default function ApplyClient({ event, currentUser, eligibilityError }: { event: any, currentUser: any, eligibilityError: string | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(eligibilityError);

  const handleConfirm = async () => {
    if (error) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/competitions/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register');
        setIsSubmitting(false);
        return;
      }
      
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push(`/competitions/${event.id}/manage`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const compStart = new Date(event.startDate);
  const compEnd = new Date(event.endDate);
  const dateStr = `${compStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${compEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  
  const isFree = !event.entryFee || event.entryFee === 0;

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1F1F22' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FFF', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: '32px' }}>Registration</h1>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Error Alert */}
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{error}</div>
          </div>
        )}

        {/* Competition Summary */}
        <h2 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#A1A1AA', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>Event Summary</h2>
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
             {event.coverImage ? (
                <Image src={event.coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />
             ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1F1F22' }} />
             )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{event.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#A1A1AA', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {dateStr}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {event.locationType === 'ONLINE' ? 'Online' : 'In-Person'}
              </div>
            </div>
          </div>
        </div>

        {/* Participant Details */}
        <h2 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#A1A1AA', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '12px' }}>Participant Details</h2>
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '16px', padding: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
              {currentUser.avatarData && currentUser.avatarData.startsWith('http') ? (
                <Image src={currentUser.avatarData} alt="Avatar" fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1F1F22' }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: '14px', color: '#A1A1AA' }}>@{currentUser.username}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #1F1F22', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '14px', color: '#FFF' }}>{currentUser.email}</div>
            </div>
            {currentUser.location && (
              <div>
                <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '14px', color: '#FFF' }}>{currentUser.location}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', backgroundColor: '#0A0A0A', borderTop: '1px solid #1F1F22', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: '12px', color: '#A1A1AA' }}>Total Payable</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFF' }}>{isFree ? 'Free Entry' : `₹${event.entryFee}`}</div>
        </div>
        <button 
          onClick={handleConfirm}
          disabled={!!error || isSubmitting}
          style={{
            backgroundColor: (error || isSubmitting) ? '#1F1F22' : '#1D9BF0',
            color: (error || isSubmitting) ? '#A1A1AA' : '#FFFFFF',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: (error || isSubmitting) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '160px'
          }}
        >
          {isSubmitting ? 'Processing...' : (isFree ? 'Confirm Participation' : 'Proceed to Payment')}
        </button>
      </div>
    </div>
  );
}
