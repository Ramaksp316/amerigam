import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Bell, CheckCircle2, MessageSquare, X } from 'lucide-react';
import FollowButton from '../components/FollowButton';

export default async function NetworkPage({ searchParams }: { searchParams: Promise<{ tab?: string, q?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {}
  });

  if (!currentUser) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'foryou';
  const searchQuery = resolvedSearchParams.q || '';

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

  const currentUserFollows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = currentUserFollows.map(f => f.followingId);

  let usersToDisplay: any[] = [];

  const allUsers = await prisma.user.findMany({
    where: { id: { not: userId }, accountType: 'PERSONAL' },
    include: {
      outgoingConnections: { include: { target: true } },
      followers: { select: { followerId: true } }
    }
  });

  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    const isIdSearch = /^[0-9a-fA-F]{24}$/.test(searchQuery) || /^[0-9a-fA-F-]{36}$/.test(searchQuery);
    
    usersToDisplay = allUsers.filter(u => {
      if (isIdSearch && u.id === searchQuery) return true;
      if (u.username && u.username.toLowerCase().includes(qLower)) return true;
      if (u.name && u.name.toLowerCase().includes(qLower)) return true;
      // Handle exact @username
      if (qLower.startsWith('@') && u.username && u.username.toLowerCase() === qLower.substring(1)) return true;
      return false;
    });
  } else if (currentTab === 'following') {
    usersToDisplay = allUsers.filter(u => followingIds.includes(u.id));
  } else if (currentTab === 'discover') {
    usersToDisplay = allUsers;
  } else {
    // For You
    const userKeywords = [
      (currentUser as any).mainIdentity,
      ...(((currentUser as any).skills ? JSON.parse((currentUser as any).skills) : []) || [])
    ].filter(Boolean).map(k => k.toLowerCase());

    usersToDisplay = allUsers.map(user => {
      let score = 0;
      let reasons: string[] = [];
      const matchText = ((user as any).mainIdentity || '') + ' ' + ((user as any).mainIdentity || '');
      
      const userTerms = [
        (user as any).mainIdentity,
        ...(((user as any).skills ? JSON.parse((user as any).skills) : []) || [])
      ].filter(Boolean);

      userKeywords.forEach(kw => {
        if (matchText.toLowerCase().includes(kw)) { score++; }
        userTerms.forEach(t => {
          if (t.toLowerCase().includes(kw)) { score++; reasons.push('Shared interest'); }
        });
      });

      if ((user as any).mainIdentity && (user as any).mainIdentity === (currentUser as any).mainIdentity) {
        score += 2;
        reasons.push('Same career');
      }

      return { user, score, reasons: [...new Set(reasons)] };
    }).filter(item => item.score > 0 || userKeywords.length === 0)
      .sort((a, b) => b.score - a.score)
      .map(item => ({ ...item.user, relevanceContext: item.reasons[0] }));
      
    if (usersToDisplay.length === 0) {
      usersToDisplay = allUsers;
    }
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      
      {/* Header */}
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/feed">
              <Image src="/logo-new.jpg" alt="Amerigam" width={34} height={34} style={{ objectFit: 'contain', mixBlendMode: 'screen' }} priority />
            </Link>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>Network</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/notifications" style={{ color: 'white', position: 'relative' }}>
              <Bell size={22} strokeWidth={2} />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--accent-primary)', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #000' }} />
              )}
            </Link>
          </div>
        </div>
        
        {/* Search Bar */}
        <div style={{ padding: '0 16px 12px 16px' }}>
          <form action="/network" method="GET" style={{ position: 'relative' }}>
            <Search size={18} color="#71717A" style={{ position: 'absolute', left: '12px', top: '10px' }} strokeWidth={2} />
            <input 
              name="q"
              type="text" 
              defaultValue={searchQuery}
              placeholder="Search users..." 
              style={{
                width: '100%',
                background: '#18181B',
                border: '1px solid #27272A',
                borderRadius: '8px',
                padding: '10px 10px 10px 38px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <Link href="/network" style={{ position: 'absolute', right: '12px', top: '10px', color: '#71717A' }}>
                <X size={18} />
              </Link>
            )}
          </form>
        </div>

        {/* Tabs Row */}
        {!searchQuery && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #27272A',
            padding: '0 8px'
          }}>
            {['Discover', 'Following'].map((tabLabel) => {
              const tabKey = tabLabel.toLowerCase().replace(' ', '');
              const isActive = currentTab === tabKey || (!currentTab && tabKey === 'discover');
              return (
                <Link key={tabKey} href={`/network?tab=${tabKey}`} style={{
                  flex: 1, textAlign: 'center', padding: '14px 0',
                  color: isActive ? 'white' : '#71717A',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  fontSize: '14px'
                }}>
                  {tabLabel}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '0', display: 'flex', flexDirection: 'column', paddingBottom: '100px' }}>
        {usersToDisplay.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>
            <p style={{ fontSize: '15px' }}>No users found.</p>
          </div>
        ) : (
          usersToDisplay.map(person => {
            const isVerified = person.accountType !== 'PERSONAL' || (person.followers && person.followers.length > 100);
            
            let identityLine = person.career || 'Amerigam Member';
            if (person.outgoingConnections && person.outgoingConnections.length > 0) {
              const conn = person.outgoingConnections[0];
              identityLine = `${conn.role.replace('_', ' ')} @ ${conn.target?.name || conn.target?.username || ''}`;
            }

            const isFollowing = followingIds.includes(person.id);

            return (
              <div key={person.id} style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #27272A',
                gap: '12px',
                overflow: 'hidden'
              }}>
                <Link href={`/user/${person.id}`} style={{ flexShrink: 0, width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A' }}>
                  {person.avatarData ? (
                    <img src={person.avatarData} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  ) : null}
                </Link>
                
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link href={`/user/${person.id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {person.name || person.username}
                    </Link>
                    {isVerified && <CheckCircle2 size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                  </div>
                  <span style={{ color: '#71717A', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{person.username}</span>
                  <span style={{ color: '#A1A1AA', fontSize: '13px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{identityLine}</span>
                  {person.relevanceContext && (
                    <span style={{ color: 'var(--accent-primary)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px' }}>✦</span> {person.relevanceContext}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/messages/${person.id}`} style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #27272A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <MessageSquare size={16} />
                  </Link>
                  <FollowButton 
                    targetUserId={person.id} 
                    initialIsFollowing={isFollowing} 
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
