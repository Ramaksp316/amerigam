'use client';

interface CommunityAvatarProps {
  community?: {
    name?: string | null;
    avatarData?: string | null;
  } | null;
  size?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function CommunityAvatar({ community, size = 48, onClick, style }: CommunityAvatarProps) {
  const displayName = community?.name || 'G';
  const initials = displayName.charAt(0).toUpperCase();

  const getAvatarUrl = (data?: string | null) => {
    if (!data) return null;
    const trimmed = data.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
  };

  const avatarUrl = getAvatarUrl(community?.avatarData);

  return (
    <div 
      onClick={onClick}
      style={{ 
        position: 'relative', 
        width: size, 
        height: size, 
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={displayName} 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.comm-avatar-initials-fallback') as HTMLElement | null;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : null}
      <div
        className="comm-avatar-initials-fallback"
        style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)', 
          color: 'white',
          display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 'bold',
          boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.2)'
        }}
      >
        {initials}
      </div>
    </div>
  );
}
