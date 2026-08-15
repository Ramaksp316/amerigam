import Image from 'next/image';

export default function DesktopComingSoon() {
  return (
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
      overflow: 'hidden'
    }}>
      {/* Background Texture (Reusing the login page styling) */}
      <div 
        className="login-bg-texture" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0, 
          opacity: 0.6, 
          pointerEvents: 'none' 
        }}
      ></div>
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image 
          src="/amerigam-logo-transparent.png" 
          alt="Amerigam Logo" 
          width={80} 
          height={36} 
          style={{ objectFit: 'contain', marginBottom: '32px' }}
        />
        
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          marginBottom: '16px'
        }}>
          Amerigam for desktop
        </h1>
        
        <div style={{
          display: 'inline-block',
          background: 'rgba(29, 155, 240, 0.1)',
          border: '1px solid rgba(29, 155, 240, 0.3)',
          color: '#1D9BF0',
          padding: '8px 16px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Coming Soon
        </div>
        
        <p style={{
          marginTop: '24px',
          color: '#A1A1AA',
          fontSize: '16px',
          maxWidth: '450px',
          lineHeight: 1.6
        }}>
          We are currently focusing entirely on crafting the perfect mobile experience. A dedicated desktop application will be designed and built later. 
          <br /><br />
          <strong style={{ color: 'white' }}>Please access Amerigam using your mobile device.</strong>
        </p>
      </div>
    </div>
  );
}
