import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Amerigam',
  description: 'Amerigam Privacy Policy explaining how we protect and handle your personal data.'
};

export default function PrivacyPage() {
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
          Privacy Policy
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
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when creating an account, editing your profile,
              sharing posts, or participating in communities and competitions. This includes your name, username,
              email address, profile biography, skills, and uploaded media.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              2. How We Use Your Information
            </h2>
            <p>
              We use the collected information to personalize your discovery feed, calculate leaderboard rankings
              and Amerigam Points (AP), facilitate secure messaging, and improve network recommendations
              tailored to your craft and profession.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              3. Data Security & Storage
            </h2>
            <p>
              We utilize encrypted communication channels, secure cloud databases, and strict access controls
              to protect your personal information against unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              4. Cookies & Local Storage
            </h2>
            <p>
              Amerigam uses essential authentication cookies and service workers to maintain your logged-in
              session and enable Progressive Web App (PWA) offline capabilities.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              5. Contact Us
            </h2>
            <p>
              For privacy-related questions or data deletion requests, contact us at{' '}
              <a href="mailto:privacy@amerigam.com" style={{ color: '#0284C7', textDecoration: 'none' }}>
                privacy@amerigam.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
