import Image from 'next/image';

interface ProfilePictureProps {
  user: {
    name?: string | null;
    username?: string | null;
    avatarData?: string | null;
    status?: string | null;
  };
  size?: number;
  showStatus?: boolean;
}

export default function ProfilePicture({ user, size = 48, showStatus = true }: ProfilePictureProps) {
  const displayName = user.name || user.username || 'U';
  const initials = displayName.charAt(0).toUpperCase();

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'ONLINE': return 'var(--success-color, #10b981)';
      case 'DND': return 'var(--error-color, #ef4444)';
      case 'OFFLINE': return 'var(--text-muted, #6b7280)';
      default: return 'var(--success-color, #10b981)'; // Default to online for now
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {user.avatarData ? (
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
      
      {showStatus && (
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: size * 0.25,
          height: size * 0.25,
          backgroundColor: getStatusColor(user.status),
          border: '2px solid var(--surface-1)',
          borderRadius: '50%',
        }} title={user.status || 'ONLINE'} />
      )}
    </div>
  );
}
