'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';

export default function PaymentClient({ registration, payment }: { registration: any, payment: any }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulatePayment = async (status: 'SUCCESS' | 'FAILED') => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/competitions/payment/${payment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment processing failed');
        setIsProcessing(false);
        return;
      }
      
      if (status === 'SUCCESS') {
        router.push(`/competitions/${registration.eventId}/manage`);
      } else {
        setError('Payment failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Network error');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1F1F22' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FFF', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: '32px' }}>Checkout</h1>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <CreditCard size={48} color="#3B82F6" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Total Amount to Pay</div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>₹{payment.amount}</div>
          <div style={{ fontSize: '14px', color: '#71717A', marginTop: '8px' }}>For {registration.event.name}</div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E3A8A', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Development Mode</div>
          <div style={{ fontSize: '14px', color: '#93C5FD', lineHeight: '1.5' }}>
            No real payment gateway is integrated yet. Use the buttons below to simulate a successful or failed payment to test the registration lifecycle.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => simulatePayment('SUCCESS')}
            disabled={isProcessing}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            <CheckCircle2 size={20} /> Simulate Successful Payment
          </button>
          
          <button 
            onClick={() => simulatePayment('FAILED')}
            disabled={isProcessing}
            style={{
              backgroundColor: 'transparent',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            <XCircle size={20} /> Simulate Failed Payment
          </button>
        </div>
      </div>
    </div>
  );
}
