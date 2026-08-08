import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CertificateActions from './CertificateActions';

export default async function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: certificateId } = await params;

  const certificate = await prisma.eventCertificate.findUnique({
    where: { certificateId },
    include: {
      registration: {
        include: {
          user: { select: { name: true, amerigamId: true } },
          event: { select: { name: true, category: true, startDate: true } }
        }
      }
    }
  });

  if (!certificate) {
    notFound();
  }

  const { registration } = certificate;
  const { user, event } = registration;

  return (
    <div style={{ minHeight: '100vh', padding: 'var(--space-8) var(--space-4)', background: 'var(--background)' }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', marginBottom: 'var(--space-6)' }}>
        <Link href="/my-tickets" className="btn btn-small btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ArrowLeft size={16} /> Back to My Passes
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {/* Certificate Container - Fixed A4 Landscape aspect ratio */}
        <div 
          id="certificate-container"
          style={{
            width: '100%',
            maxWidth: '1000px',
            aspectRatio: '1.414 / 1', // A4 Landscape ratio
            background: '#ffffff',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            color: '#1a1a1a', // Ensure text is dark on white background
          }}
        >
          {/* Inner Border */}
          <div style={{
            position: 'absolute',
            top: '20px', left: '20px', right: '20px', bottom: '20px',
            border: '2px solid #b89345',
            pointerEvents: 'none',
            zIndex: 10
          }}></div>

          <div style={{
            position: 'absolute',
            top: '24px', left: '24px', right: '24px', bottom: '24px',
            border: '1px solid #b89345',
            pointerEvents: 'none',
            zIndex: 10
          }}></div>

          {/* Decorative Corner Elements (Top Left / Bottom Right) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '250px', height: '250px', background: 'linear-gradient(135deg, #df2a35 0%, #a01a24 100%)', clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '300px', height: '300px', background: 'rgba(223, 42, 53, 0.2)', clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 0 }}></div>
          
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '350px', height: '350px', background: '#1c1e26', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '400px', height: '400px', background: 'linear-gradient(135deg, #df2a35 0%, #a01a24 100%)', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)', zIndex: 0 }}></div>
          
          {/* Top Right Ribbon Element */}
          <div style={{ position: 'absolute', top: '-10px', right: '100px', width: '50px', height: '150px', background: '#b89345', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', zIndex: 2 }}></div>

          {/* Content Area */}
          <div style={{ 
            position: 'relative', 
            zIndex: 5, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 80px',
            textAlign: 'center'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #df2a35, #a01a24)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px', fontFamily: 'serif' }}>A</span>
              </div>
              <h2 style={{ fontSize: '20px', letterSpacing: '4px', color: '#1c1e26', margin: 0, fontWeight: 800 }}>AMERIGAM</h2>
            </div>

            <h1 style={{ fontSize: '48px', color: '#df2a35', margin: '0 0 10px 0', fontWeight: 900, letterSpacing: '8px' }}>
              CERTIFICATE
            </h1>
            <p style={{ fontSize: '18px', letterSpacing: '6px', color: '#666', textTransform: 'uppercase', margin: '0 0 50px 0' }}>
              OF {certificate.type === 'WINNER' ? 'EXCELLENCE & ACHIEVEMENT' : 'PARTICIPATION'}
            </p>

            <p style={{ fontSize: '16px', color: '#444', margin: '0 0 20px 0', fontStyle: 'italic' }}>
              Proudly presented to
            </p>

            {/* Name Field */}
            <h2 style={{ 
              fontSize: '56px', 
              color: '#1c1e26', 
              margin: '0 0 10px 0', 
              fontFamily: '"Playfair Display", "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 700,
              borderBottom: '2px solid #df2a35',
              paddingBottom: '10px',
              width: '80%',
              maxWidth: '600px'
            }}>
              {user.name}
            </h2>

            <p style={{ fontSize: '16px', color: '#444', margin: '30px 0 10px 0', maxWidth: '600px', lineHeight: 1.6 }}>
              For outstanding performance and securing the <strong>{certificate.type}</strong> title at the <br/>
              <strong style={{ color: '#1c1e26', fontSize: '18px' }}>{event.name}</strong> event.
            </p>

            {/* Signatures & Badges Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '80%', maxWidth: '700px', marginTop: 'auto' }}>
              
              <div style={{ textAlign: 'center', width: '200px' }}>
                <p style={{ fontSize: '16px', margin: '0 0 5px 0', color: '#444' }}>{new Date(certificate.issueDate).toLocaleDateString()}</p>
                <div style={{ borderTop: '1px solid #999', paddingTop: '5px', fontSize: '14px', color: '#666' }}>Date</div>
              </div>

              {/* Center Seal */}
              <div style={{ 
                width: '120px', height: '120px', 
                background: '#df2a35', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                color: '#fff',
                boxShadow: '0 10px 20px rgba(223, 42, 53, 0.3)',
                border: '5px solid #b89345',
                transform: 'translateY(20px)'
              }}>
                <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Verified</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{certificate.type === 'WINNER' ? '🏆' : '⭐'}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>ID: {certificate.certificateId.substring(0,8)}</span>
              </div>

              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ fontFamily: '"Great Vibes", "Playfair Display", cursive', fontSize: '32px', color: '#1c1e26', marginBottom: '5px', lineHeight: 1 }}>
                  Ramaks
                </div>
                <div style={{ borderTop: '1px solid #999', paddingTop: '5px', fontSize: '14px', color: '#666' }}>
                  <strong>Ramaks</strong><br/>Founder, Amerigam
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <CertificateActions targetId="certificate-container" fileName={`Amerigam_Certificate_${user.name.replace(/\s+/g, '_')}`} />
      
    </div>
  );
}
