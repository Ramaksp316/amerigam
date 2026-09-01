
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import FollowButton from './FollowButton';

export default async function HomeNetwork({ userId, currentUser }: { userId: string, currentUser: any }) {
  const allUsers = await prisma.user.findMany({
    where: { id: { not: userId }, accountType: 'PERSONAL' },
    include: {
      outgoingConnections: { include: { target: true } },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } }
    }
  });

  const currentUserFollows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = currentUserFollows.map(f => f.followingId);

  const userKeywords = [
    currentUser.mainIdentity,
    ...(currentUser.skills ? JSON.parse(currentUser.skills) : [])
  ].filter(Boolean).map(k => k.toLowerCase());

  let usersToDisplay = allUsers.map(user => {
    if (followingIds.includes(user.id)) return { user, score: -1, reasons: [] }; // Don't suggest people already followed

    let score = 0;
    let reasons = [];
    const matchText = (user.mainIdentity || '') + ' ' + (user.bio || '');
    
    const userTerms = [
      user.mainIdentity,
      ...(user.skills ? JSON.parse(user.skills) : [])
    ].filter(Boolean);

    userKeywords.forEach(kw => {
      if (matchText.toLowerCase().includes(kw)) { score++; }
      userTerms.forEach(t => {
        if (t.toLowerCase().includes(kw)) { score++; reasons.push('Shared skill'); }
      });
    });

    if (user.mainIdentity && user.mainIdentity === currentUser.mainIdentity) {
      score += 2;
      reasons.push('Same field');
    }

    return { user, score, reasons: [...new Set(reasons)] };
  }).filter(item => item.score > 0 || userKeywords.length === 0)
    .sort((a, b) => b.score - a.score)
    .map(item => ({ ...item.user, relevanceContext: item.reasons[0] || 'Relevant to your field' }));

  if (usersToDisplay.length === 0) {
    usersToDisplay = allUsers.filter(u => !followingIds.includes(u.id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
      <div style={{ padding: '0 16px', marginTop: '16px' }}>
        <h2 style={{ color: 'white', fontSize: '13px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>SUGGESTED FOR YOUR NETWORK</h2>
        
        {usersToDisplay.slice(0, 10).map(person => {
          const isVerified = person.followers && person.followers.length > 100;
          let identityLine = person.mainIdentity || 'Amerigam Member';
          if (person.outgoingConnections && person.outgoingConnections.length > 0) {
            const conn = person.outgoingConnections[0];
            identityLine = `${conn.role.replace('_', ' ')} @ ${conn.target?.name || conn.target?.username || ''}`;
          }

          return (
            <div key={person.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #27272A', gap: '12px' }}>
              <Link href={`/user/${person.id}`} style={{ flexShrink: 0, width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A' }}>
                {person.profilePictureUrl ? (
                  <img src={person.profilePictureUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : null}
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
                {person.relevanceContext && (
                  <div style={{ fontSize: '12px', color: '#1D9BF0', marginTop: '4px', fontWeight: 500 }}>
                    {person.relevanceContext}
                  </div>
                )}
              </div>

              <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a href={`/api/messages/start?targetId=${person.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px',
                  borderRadius: '50%', backgroundColor: '#18181B', color: 'white', border: '1px solid #27272A', textDecoration: 'none'
                }}>
                  <MessageSquare size={14} />
                </a>
                
                <FollowButton targetUserId={person.id} initialIsFollowing={false}  />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
