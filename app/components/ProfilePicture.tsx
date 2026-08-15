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

  const colors = [
    '#4285F4', // Google Blue
    '#DB4437', // Google Red
    '#F4B400', // Google Yellow
    '#0F9D58', // Google Green
    '#673AB7', // Deep Purple
    '#FF9800', // Orange
    '#009688', // Teal
    '#E91E63'  // Pink
  ];
  const charCode = initials.charCodeAt(0) || 0;
  const bgColor = colors[charCode % colors.length];

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
          background: bgColor, color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.45, fontWeight: '500', fontFamily: 'sans-serif'
        }}>
          {initials}
        </div>
      )}
    </div>
  );
}
