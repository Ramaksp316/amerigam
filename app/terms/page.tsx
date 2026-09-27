import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Amerigam',
  description: 'Terms of Service and Community Guidelines for Amerigam users and creators.'
};

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: '40px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <Link href="/login" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#A1A1AA',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/amerigam-logo-transparent.png"
              alt="Amerigam"
              width={100}
              height={26}
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Terms of Service
        </h1>
        <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '32px' }}>
          Last updated: September 2026
        </p>

        {/* Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#D4D4D8'
        }}>
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              1. Welcome to Amerigam
            </h2>
            <p>
              By accessing or using Amerigam, you agree to comply with and be bound by these Terms of Service.
              Amerigam is a platform built for creators, professionals, athletes, and innovators to build their identity,
              collaborate, and share their passions authentically.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              2. User Accounts & Identity
            </h2>
            <p>
              You must provide accurate and verifiable information when creating an account. You are responsible
              for safeguarding your account credentials and for all activities that occur under your account.
              Impersonation or misrepresentation of creator or professional identity is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              3. Content & Community Guidelines
            </h2>
            <p>
              You retain ownership of the original content you post on Amerigam. By posting, you grant Amerigam a
              non-exclusive license to host, display, and distribute your content across our platform services.
              Content that promotes hate speech, violence, harassment, copyright infringement, or spam will be removed.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              4. Competitions & Rewards
            </h2>
            <p>
              Participation in Amerigam challenges, hackathons, and competitions is subject to individual event rules.
              Amerigam Points (AP) and leaderboard ranks are awarded based on verified participation, engagement,
              and merit according to our platform scoring algorithms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              5. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding these Terms, please reach out to us at{' '}
              <a href="mailto:support@amerigam.com" style={{ color: '#0284C7', textDecoration: 'none' }}>
                support@amerigam.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
