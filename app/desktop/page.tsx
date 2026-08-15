import Image from 'next/image';

export default function DesktopComingSoon() {
  return (
    <>
      <style>{`
        /* Complete reset to ensure pure full-screen canvas without any app shell artifacts */
        body {
          margin: 0;
          padding: 0;
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
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-inter), sans-serif'
      }}>
        
        {/* Massive subtle background logo acting as abstract texture (X style) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.03, // Extremely subtle
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

        {/* Foreground Content */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px'
        }}>
          
          {/* Logo & Wordmark Group */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
            <Image 
              src="/amerigam-logo-transparent.png" 
              alt="Amerigam Logo" 
              width={72} 
              height={36} 
              style={{ objectFit: 'contain', marginBottom: '20px' }}
              priority
            />
            <div style={{ 
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 300,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginLeft: '0.4em' // Optical centering for extreme tracking
            }}>
              Amerigam
            </div>
          </div>

          {/* Main Copy Group */}
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '56px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 24px 0',
            lineHeight: 1.1
          }}>
            Desktop is coming soon.
          </h1>
          
          <p style={{
            color: '#A1A1AA', // Soft gray
            fontSize: '22px',
            fontWeight: 400,
            margin: '0 0 64px 0',
            maxWidth: '600px',
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
          }}>
            Amerigam is currently built for mobile.<br/>
            The desktop experience is on the way.
          </p>
          
          {/* Subtle Call to Action */}
          <p style={{
            color: '#71717A', // Deeper gray
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
