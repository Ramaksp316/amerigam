import Image from 'next/image';

export default function DesktopComingSoon() {
  return (
    <>
      <style>{`
        /* Reset any layout constraints */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #000000 !important;
        }
        .sidebar, .sidebar-container, .bottom-nav, .mobile-topbar { 
          display: none !important; 
        }
        .app-layout { 
          display: block !important;
          background-color: #000000 !important;
        }
        .main-content { 
          margin: 0 !important; 
          padding: 0 !important;
          border: none !important;
          background-color: #000000 !important;
        }
      `}</style>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), sans-serif'
      }}>
        
        {/* Decorative Background Logo (Absolute) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <Image 
            src="/amerigam-logo-transparent.png" 
            alt="" 
            width={1200} 
            height={1200} 
            style={{ objectFit: 'contain', width: '80vw', maxWidth: '1000px' }}
            priority
          />
        </div>

        {/* 
          Main Content Group 
          Everything is grouped in a single centered column with gap-based spacing 
          so it remains perfectly centered vertically and horizontally.
        */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          gap: '64px', /* Large gap between the 3 main sections */
          padding: '0 24px'
        }}>
          
          {/* Section 1: Logo & Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <Image 
              src="/amerigam-logo-transparent.png" 
              alt="Amerigam Logo" 
              width={72} 
              height={36} 
              style={{ objectFit: 'contain' }}
              priority
            />
            <div style={{ 
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 300,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginLeft: '0.4em'
            }}>
              Amerigam
            </div>
          </div>

          {/* Section 2: Main Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <h1 style={{
              color: '#FFFFFF',
              fontSize: '56px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1.1
            }}>
              Desktop is coming soon.
            </h1>
            
            <p style={{
              color: '#A1A1AA', 
              fontSize: '22px',
              fontWeight: 400,
              margin: 0,
              maxWidth: '600px',
              lineHeight: 1.5,
              letterSpacing: '-0.01em'
            }}>
              Amerigam is currently built for mobile.<br/>
              The desktop experience is on the way.
            </p>
          </div>
          
          {/* Section 3: Call to Action */}
          <p style={{
            color: '#71717A',
            fontSize: '15px',
            fontWeight: 400,
            margin: 0,
            letterSpacing: '0.01em'
          }}>
            Open Amerigam on your mobile device to continue.
          </p>

        </div>
      </div>
    </>
  );
}
