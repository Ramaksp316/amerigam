
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Bell, Users } from 'lucide-react';
import { joinCommunity } from './actions';

export default async function CommunitiesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    
  });

  if (!currentUser) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'foryou';

  // Fetch unread count for bell
  const unreadCount = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      },
      senderId: { not: userId },
      isRead: false
    }
  });

  const allCommunities = await prisma.community.findMany({
    include: {
      _count: { select: { members: true } },
      members: { where: { userId } }
    },
    orderBy: { createdAt: 'desc' }
  });

  let displayCommunities = [];

  if (currentTab === 'joined') {
    displayCommunities = allCommunities.filter(c => c.members.length > 0);
  } else if (currentTab === 'explore') {
    displayCommunities = allCommunities;
  } else {
    // For You
    const userKeywords = [
      currentUser.bio,
      ...(currentUser.interests?.map(i => i.name) || []),
      ...(currentUser.skills?.map(s => s.name) || [])
    ].filter(Boolean).map(k => k.toLowerCase());

    displayCommunities = allCommunities.filter(c => {
      const matchText = (c.name + ' ' + (c.category || '')).toLowerCase();
      if (userKeywords.length === 0) return true; // If user has no tags, show all
      return userKeywords.some(kw => matchText.includes(kw));
    });

    // Fallback if none match
    if (displayCommunities.length === 0) {
      displayCommunities = allCommunities;
    }
  }

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
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>Communities</span>
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
          {['For You', 'Joined', 'Explore'].map((tabLabel) => {
            const tabKey = tabLabel.toLowerCase().replace(' ', '');
            const isActive = currentTab === tabKey;
            return (
              <Link key={tabKey} href={`/communities?tab=${tabKey}`} style={{
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

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
        {displayCommunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>
            <p style={{ fontSize: '15px' }}>No communities found.</p>
          </div>
        ) : (
          displayCommunities.map(community => {
            const isMember = community.members.length > 0;

            return (
              <div key={community.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #27272A',
                backgroundColor: '#0A0A0A',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    backgroundColor: '#18181B', 
                    flexShrink: 0, 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #27272A'
                  }}>
                    {community.avatarData ? (
                      <img src={community.avatarData} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Users size={24} color="#71717A" />
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Link href={`/communities/${community.id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '16px', letterSpacing: '-0.3px' }}>
                        {community.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px' }}>
                      {community.category}
                    </div>
                  </div>
                </div>

                <p style={{ 
                  fontSize: '14px', 
                  color: '#A1A1AA', 
                  lineHeight: '1.4', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  margin: 0
                }}>
                  {community.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717A', fontSize: '13px', fontWeight: 500 }}>
                    <Users size={14} /> 
                    <span>{community._count.members} {community._count.members === 1 ? 'member' : 'members'}</span>
                  </div>

                  {isMember ? (
                    <Link href={`/communities/${community.id}`} style={{
                      backgroundColor: '#27272A',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: 'none'
                    }}>
                      Joined
                    </Link>
                  ) : (
                    <form action={joinCommunity} style={{ margin: 0 }}>
                      <input type="hidden" name="communityId" value={community.id} />
                      <button type="submit" style={{
                        backgroundColor: 'white',
                        color: 'black',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        Join
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
