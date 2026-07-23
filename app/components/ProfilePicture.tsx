interface ProfilePictureProps {
  user?: {
    name?: string | null;
    username?: string | null;
    avatarData?: string | null;
    status?: string | null;
    lastSeen?: Date | string | null;
  } | null;
  size?: number;
  showStatus?: boolean;
}

export default function ProfilePicture({ user, size = 48, showStatus = true }: ProfilePictureProps) {
  const displayName = user?.name || user?.username || 'U';
  const initials = displayName.charAt(0).toUpperCase();

  const renderStatusDot = () => {
    if (!showStatus || !user) return null;
    
    // Check if user is offline due to inactivity (e.g. lastSeen > 2 minutes ago)
    // But only if their status is not manually set to DND or OFFLINE
    let currentStatus = user.status || 'ONLINE';
    if (currentStatus === 'ONLINE' && user.lastSeen) {
      const lastSeenTime = new Date(user.lastSeen).getTime();
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      if (lastSeenTime < twoMinutesAgo) {
        currentStatus = 'OFFLINE';
      }
    }

    const dotSize = size * 0.28;
    const borderSize = Math.max(1.5, size * 0.04);
    
    if (currentStatus === 'ONLINE') {
      return (
        <div style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: dotSize,
          height: dotSize,
          backgroundColor: '#10b981', // Green
          borderRadius: '50%',
          border: `${borderSize}px solid var(--surface-1, #15161c)`,
          boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)'
        }} title="Online" />
      );
    }

    if (currentStatus === 'DND') {
      return (
        <div style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: dotSize,
          height: dotSize,
          backgroundColor: 'var(--surface-0, #0B0C10)', // matches background
          borderRadius: '50%',
          border: `${borderSize}px solid #4B5563`, // Gray ring
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)'
        }} title="Do Not Disturb">
          <div style={{
            width: '50%',
            height: '2.2px',
            backgroundColor: '#4B5563', // Horizontal line inside
            borderRadius: '1px'
          }} />
        </div>
      );
    }

    // OFFLINE (Dark Ring)
    return (
      <div style={{
        position: 'absolute',
        bottom: '0px',
        right: '0px',
        width: dotSize,
        height: dotSize,
        backgroundColor: 'var(--surface-0, #0B0C10)', // matches background
        borderRadius: '50%',
        border: `${borderSize}px solid #4B5563`, // Gray ring
        boxShadow: '0 0 4px rgba(0,0,0,0.5)'
      }} title="Offline" />
    );
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {user?.avatarData ? (
        <img 
          src={user.avatarData.startsWith('data:') ? user.avatarData : `data:image/jpeg;base64,${user.avatarData}`} 
          alt={displayName} 
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : (
        <div style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          background: 'var(--gradient-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 'bold'
        }}>
          {initials}
        </div>
      )}
      {renderStatusDot()}
    </div>
  );
}
