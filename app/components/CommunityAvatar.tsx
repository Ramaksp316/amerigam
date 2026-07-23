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
      {community?.avatarData ? (
        <img 
          src={community.avatarData.startsWith('data:') ? community.avatarData : `data:image/jpeg;base64,${community.avatarData}`} 
          alt={displayName} 
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        />
      ) : (
        <div style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)', 
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 'bold',
          boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.2)'
        }}>
          {initials}
        </div>
      )}
    </div>
  );
}
