import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Bell, CheckCircle2 } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import FollowButton from '../components/FollowButton';

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'suggested';

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  // Basic deterministic fetching for now based on active account type
  let usersToDisplay = [];
  
  if (currentTab === 'following') {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: { outgoingConnections: { include: { target: true } } }
        }
      }
    });
    usersToDisplay = following.map(f => f.following);
  } else if (currentTab === 'professional') {
    usersToDisplay = await prisma.user.findMany({
      where: { 
        id: { not: userId },
        accountType: { in: ['BUSINESS', 'ORGANIZATION', 'PERSONAL'] }
      },
      include: { outgoingConnections: { include: { target: true } } },
      take: 20
    });
  } else {
    // Suggested & Similar
    usersToDisplay = await prisma.user.findMany({
      where: { 
        id: { not: userId }
      },
      include: { outgoingConnections: { include: { target: true } } },
      take: 30
    });
    
    // Sort randomly to simulate suggestions for the beta
    usersToDisplay = usersToDisplay.sort(() => Math.random() - 0.5).slice(0, 15);
  }

  // Get current user's followings to pass to the FollowButton
  const currentUserFollows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = currentUserFollows.map(f => f.followingId);

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      
      {/* Mobile Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Icons Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/feed">
              <Image 
                src="/logo-new.jpg" 
                alt="Amerigam" 
                width={34} 
                height={34} 
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
                priority
              />
            </Link>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>Network</span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/search" style={{ color: 'white' }}>
              <Search size={22} strokeWidth={2.5} />
            </Link>
            <Link href="/notifications" style={{ color: 'white', position: 'relative' }}>
              <Bell size={22} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#F91880',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: '2px solid #000'
                }} />
              )}
            </Link>
          </div>
        </div>

        {/* Tabs Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272A',
          padding: '0 8px'
        }}>
          {['Suggested', 'Similar', 'Professional', 'Following'].map((tabLabel) => {
            const tabKey = tabLabel.toLowerCase().split(' ')[0];
            const isActive = currentTab === tabKey;
            return (
              <Link key={tabKey} href={`/network?tab=${tabKey}`} style={{
                flex: 1, textAlign: 'center', padding: '14px 0',
                color: isActive ? 'white' : '#71717A',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                position: 'relative',
                fontSize: '14px'
              }}>
                {tabLabel}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '36px', height: '4px', background: '#1D9BF0', borderRadius: '4px 4px 0 0' }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '0', display: 'flex', flexDirection: 'column', paddingBottom: '100px' }}>
        {usersToDisplay.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>
            <p style={{ fontSize: '15px' }}>No connections found.</p>
          </div>
        ) : (
          usersToDisplay.map(person => {
            const isVerified = person.accountType !== 'PERSONAL' || (person.followers && person.followers.length > 100);
            const isFollowing = followingIds.includes(person.id);
            
            let identityLine = '';
            if (person.outgoingConnections && person.outgoingConnections.length > 0) {
              const conn = person.outgoingConnections[0];
              identityLine = `${conn.role.replace('_', ' ')} • ${conn.target?.name || conn.target?.username || ''}`;
            } else {
              if (person.username === 'diyadraws') identityLine = 'Illustrator • Digital Artist';
              else if (person.username === 'aaravbuilds') identityLine = 'Aspiring Founder • Tech';
              else if (person.username === 'rohan.cuts') identityLine = 'Video Editor • Filmmaking';
              else if (person.username === 'kabir.runs') identityLine = 'Athlete • Training';
              else if (person.username === 'meeraframes') identityLine = 'Photographer • Visual Arts';
              else if (person.username === 'ishaan.codes') identityLine = 'Developer • Apps';
              else if (person.username === 'arjunstrings') identityLine = 'Musician • Songwriting';
              else identityLine = person.accountType.charAt(0) + person.accountType.slice(1).toLowerCase();
            }

            return (
              <div key={person.id} style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #27272A',
                gap: '12px'
              }}>
                <Link href={`/user/${person.id}`} style={{ flexShrink: 0 }}>
                  <ProfilePicture user={person} size={50} />
                </Link>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link href={`/user/${person.id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.3px' }}>
                      {person.name || person.username}
                    </Link>
                    {isVerified && <CheckCircle2 size={14} color="#1D9BF0" fill="#1D9BF0" />}
                  </div>
                  <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px', fontWeight: 400 }}>
                    {identityLine}
                  </div>
                  {person.bio && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#71717A', 
                      marginTop: '4px',
                      display: '-webkit-box', 
                      WebkitLineClamp: 1, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden'
                    }}>
                      {person.bio}
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0 }}>
                  <FollowButton 
                    targetUserId={person.id} 
                    initialIsFollowing={isFollowing} 
                    isMutual={false} 
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
