'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, ChevronLeft, Zap, ShieldCheck, Copy, Check } from 'lucide-react';

export default function PaymentClient({ registration, payment }: { registration: any, payment: any }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  // Load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1-Click Instant Razorpay Payment
  const handleRazorpayPayment = async () => {
    setIsRazorpayLoading(true);
    setError(null);

    try {
      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        setError(orderData.error || 'Failed to initialize payment gateway');
        setIsRazorpayLoading(false);
        return;
      }

      // 2. Ensure Razorpay script is loaded
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        // Fallback load
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      // 3. Configure Razorpay Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Amerigam',
        description: `Entry Fee for ${orderData.eventName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.userName || '',
          email: orderData.userEmail || '',
          contact: orderData.userPhone || '',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: function () {
            setIsRazorpayLoading(false);
          },
        },
        handler: async function (response: any) {
          setIsRazorpayLoading(true);
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: payment.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              alert('🎉 Payment Successful! Your registration is now officially APPROVED!');
              router.push(`/competitions/${registration.eventId}`);
            } else {
              setError(verifyData.error || 'Payment verification failed');
              setIsRazorpayLoading(false);
            }
          } catch (err) {
            console.error(err);
            setError('Network error verifying payment');
            setIsRazorpayLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Payment failed event:', resp);
        setError(resp.error?.description || 'Payment was not completed');
        setIsRazorpayLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment initiation error');
      setIsRazorpayLoading(false);
    }
  };

  // Manual UTR submission
  const submitManualPayment = async () => {
    if (!transactionId.trim()) {
      setError('Please enter the 12-digit Transaction ID / UTR number');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/competitions/payment/${payment.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING', transactionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment submission failed');
        setIsProcessing(false);
        return;
      }

      alert('✅ Payment details submitted! The organizer will verify your transaction.');
      router.push(`/competitions/${registration.eventId}`);
    } catch (err) {
      setError('Network error');
      setIsProcessing(false);
    }
  };

  const copyUpiId = () => {
    if (registration.event.upiId) {
      navigator.clipboard.writeText(registration.event.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1F1F22' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FFF', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: '32px' }}>Checkout</h1>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Amount Card */}
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <CreditCard size={44} color="#3B82F6" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '6px' }}>Total Registration Fee</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFF' }}>{payment.currency === 'INR' ? '₹' : ''}{payment.amount}</div>
          <div style={{ fontSize: '14px', color: '#71717A', marginTop: '6px' }}>For {registration.event.name}</div>
        </div>

        {/* PRIMARY METHOD: Instant Razorpay */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={handleRazorpayPayment}
            disabled={isRazorpayLoading}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px 20px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 700,
              width: '100%',
              cursor: isRazorpayLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
              opacity: isRazorpayLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={20} fill="#FFD700" color="#FFD700" />
            {isRazorpayLoading ? 'Connecting to Payment Gateway...' : `Pay ₹${payment.amount} Instantly (Auto-Approve)`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', fontSize: '12px', color: '#71717A' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Secured by Razorpay • GPay, PhonePe, Paytm, Cards, Netbanking</span>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '14px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* OR DIVIDER */}
        {(registration.event.paymentQrCode || registration.event.upiId) && (
          <div style={{ position: 'relative', textAlign: 'center', margin: '32px 0 24px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#27272A' }} />
            <span style={{ position: 'relative', backgroundColor: '#000', padding: '0 12px', color: '#71717A', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              Or Pay Manually via UPI
            </span>
          </div>
        )}

        {/* SECONDARY FALLBACK: Manual Direct UPI */}
        {(registration.event.paymentQrCode || registration.event.upiId) && (
          <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            {registration.event.upiId && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#A1A1AA', fontSize: '12px', marginBottom: '6px' }}>Organizer UPI ID</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#18181B', padding: '12px', borderRadius: '10px', border: '1px solid #27272A' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, color: '#FFF', flex: 1, wordBreak: 'break-all' }}>
                    {registration.event.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    style={{
                      backgroundColor: copied ? '#10B981' : '#27272A',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>
            )}

            {registration.event.paymentQrCode && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ color: '#A1A1AA', fontSize: '12px', marginBottom: '10px' }}>Organizer Payment QR Code</div>
                <img
                  src={registration.event.paymentQrCode}
                  alt="Payment QR Code"
                  style={{ width: '180px', height: '180px', objectFit: 'contain', margin: '0 auto 10px', display: 'block', borderRadius: '12px', border: '1px solid #27272A' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', borderTop: '1px solid #1F1F22', paddingTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#D4D4D8' }}>Enter 12-Digit Transaction ID / UTR</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 123456789012"
                style={{ backgroundColor: '#000', border: '1px solid #27272A', color: '#FFF', padding: '12px 14px', borderRadius: '10px', fontSize: '15px', outline: 'none' }}
              />
              <button
                onClick={submitManualPayment}
                disabled={isProcessing}
                style={{
                  backgroundColor: '#27272A',
                  color: '#FFFFFF',
                  border: '1px solid #3F3F46',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: isProcessing ? 0.7 : 1,
                }}
              >
                {isProcessing ? 'Submitting...' : <><CheckCircle2 size={16} /> Submit UTR for Manual Verification</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
