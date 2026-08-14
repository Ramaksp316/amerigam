import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import ProfilePicture from './ProfilePicture';

export default async function RightSidebar({ userId }: { userId: string }) {
  // Fetch some contextual data based on the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      outgoingConnections: {
        include: { target: true }
      }
    }
  });

  // Fetch some communities deterministically
  const communities = await prisma.community.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  // Fetch some suggested users deterministically
  const suggestedUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      accountType: { in: ['PERSONAL', 'CREATOR', 'INFLUENCER'] }
    },
    take: 3,
    orderBy: { createdAt: 'asc' }
  });

  return (
    <aside className="right-sidebar-inner" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Input for Desktop Right Rail */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-full)',
        padding: '12px 20px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search" 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            width: '100%',
            fontSize: '15px'
          }}
        />
      </div>

      {user?.outgoingConnections && user.outgoingConnections.length > 0 && (
        <div className="right-card">
          <h3 className="right-card-title">Your Network</h3>
          {user.outgoingConnections.map(conn => (
            <Link href={`/user/${conn.target.id}`} key={conn.id} className="right-card-item">
              <ProfilePicture user={conn.target} size={36} />
              <div className="right-card-info">
                <strong>{conn.target.name || conn.target.username}</strong>
                <span>{conn.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {communities.length > 0 && (
        <div className="right-card">
          <h3 className="right-card-title">Suggested Communities</h3>
          {communities.map(comm => (
            <Link href={`/communities/${comm.id}`} key={comm.id} className="right-card-item">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {comm.avatarData ? <img src={comm.avatarData} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:14, fontWeight:'bold'}}>{comm.name.charAt(0)}</span>}
              </div>
              <div className="right-card-info">
                <strong>{comm.name}</strong>
                <span>{comm.category || 'General'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {suggestedUsers.length > 0 && (
        <div className="right-card">
          <h3 className="right-card-title">Who to follow</h3>
          {suggestedUsers.map(su => (
            <Link href={`/user/${su.id}`} key={su.id} className="right-card-item">
              <ProfilePicture user={su} size={36} />
              <div className="right-card-info">
                <strong>{su.name || su.username}</strong>
                <span>@{su.username}</span>
              </div>
              <button style={{
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>Follow</button>
            </Link>
          ))}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#71717A', display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 8px' }}>
        <Link href="#">Terms of Service</Link>
        <Link href="#">Privacy Policy</Link>
        <Link href="#">Cookie Policy</Link>
        <Link href="#">Accessibility</Link>
        <Link href="#">Ads info</Link>
        <span>© 2026 Amerigam Corp.</span>
      </div>
    </aside>
  );
}
