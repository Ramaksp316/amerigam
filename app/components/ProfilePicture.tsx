interface ProfilePictureProps {
  user?: {
    name?: string | null;
    username?: string | null;
    avatarData?: string | null;
  } | null;
  size?: number;
}

export default function ProfilePicture({ user, size = 48 }: ProfilePictureProps) {
  const displayName = user?.name || user?.username || 'U';
  const initials = displayName.charAt(0).toUpperCase();

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
    </div>
  );
}
