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

  const getAvatarUrl = (data?: string | null) => {
    if (!data) return null;
    const trimmed = data.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
  };

  const avatarUrl = getAvatarUrl(user?.avatarData);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={displayName} 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.avatar-initials-fallback') as HTMLElement | null;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : null}
      <div
        className="avatar-initials-fallback"
        style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          background: bgColor, color: '#FFFFFF',
          display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.45, fontWeight: '500', fontFamily: 'sans-serif'
        }}
      >
        {initials}
      </div>
    </div>
  );
}
