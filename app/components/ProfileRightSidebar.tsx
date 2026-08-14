import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import ProfilePicture from './ProfilePicture';

export default async function ProfileRightSidebar({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      outgoingConnections: {
        include: { target: true }
      }
    }
  });

  if (!user) return null;

  return (
    <aside className="right-sidebar-inner" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {user.outgoingConnections && user.outgoingConnections.length > 0 && (
        <div className="right-card">
          <h3 className="right-card-title">Connected Organizations</h3>
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

      {/* Example static block, can be expanded later */}
      <div className="right-card">
        <h3 className="right-card-title">Similar Profiles</h3>
        <div style={{ padding: '16px', color: '#A1A1AA', fontSize: '13px', textAlign: 'center' }}>
          Suggestions will appear here based on your network.
        </div>
      </div>

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
