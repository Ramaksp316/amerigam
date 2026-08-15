import Image from 'next/image';

export default function DesktopComingSoon() {
  return (
    <>
      <style>{`
        /* Hide the sidebar and reset layout just for this page */
        .sidebar { display: none !important; }
        .sidebar-container { display: none !important; }
        .app-layout { 
          grid-template-columns: 1fr !important; 
          display: block !important;
        }
        .main-content { 
          margin-left: 0 !important; 
          border-left: none !important;
          padding: 0 !important;
        }
        /* Mobile layout overrides if any */
        @media (max-width: 768px) {
          .bottom-nav { display: none !important; }
          .mobile-topbar { display: none !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background, #0B0C10)',
        color: 'white',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* Background Texture */}
        <div 
          className="login-bg-texture" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 0, 
            opacity: 0.3, 
            pointerEvents: 'none' 
          }}
        ></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image 
            src="/amerigam-logo-transparent.png" 
            alt="Amerigam Logo" 
            width={70} 
            height={32} 
            style={{ objectFit: 'contain' }}
          />
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 300, // Thin font as requested
            letterSpacing: '0.4em', // Wide spacing like A M E R I G A M
            textTransform: 'uppercase',
            marginTop: '16px',
            marginBottom: '40px',
            marginLeft: '0.4em' // Offset to center properly with the huge letter spacing
          }}>
            Amerigam
          </h1>
          
          <div style={{
            display: 'inline-block',
            background: 'rgba(29, 155, 240, 0.08)',
            border: '1px solid rgba(29, 155, 240, 0.2)',
            color: '#1D9BF0',
            padding: '8px 24px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Desktop Version Coming Soon
          </div>
          
          <p style={{
            marginTop: '32px',
            color: '#A1A1AA',
            fontSize: '15px',
            maxWidth: '450px',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            We are currently focusing entirely on crafting the perfect mobile experience. A dedicated desktop application will be designed and built later. 
            <br /><br />
            <strong style={{ color: 'white', fontWeight: 600 }}>Please access Amerigam using your mobile device.</strong>
          </p>
        </div>
      </div>
    </>
  );
}
