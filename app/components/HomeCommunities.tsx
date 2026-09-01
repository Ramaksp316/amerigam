
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { joinCommunity } from '../communities/actions';
import LocalTime from './LocalTime';

export default async function HomeCommunities({ userId, currentUser }: { userId: string, currentUser: any }) {
  const allCommunities = await prisma.community.findMany({
    include: {
      _count: { select: { members: true } },
      members: { where: { userId } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const userKeywords = [
    ...(currentUser.interests ? JSON.parse(currentUser.interests) : []),
    ...(currentUser.hobbies ? JSON.parse(currentUser.hobbies) : [])
  ].filter(Boolean).map(k => k.toLowerCase());

  let displayCommunities = allCommunities.filter(c => {
    if (c.members.length > 0) return false;
    const matchText = (c.name + ' ' + (c.category || '')).toLowerCase();
    if (userKeywords.length === 0) return true;
    return userKeywords.some(kw => matchText.includes(kw));
  });

  if (displayCommunities.length === 0) {
    displayCommunities = allCommunities.filter(c => c.members.length === 0);
  }

  const joinedCommunityIds = allCommunities.filter(c => c.members.length > 0).map(c => c.id);
  let recentPosts = [];
  if (joinedCommunityIds.length > 0) {
    recentPosts = await prisma.communityPost.findMany({
      where: { communityId: { in: joinedCommunityIds } },
      include: { author: true, community: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
      <div style={{ padding: '0 16px', marginTop: '16px' }}>
        <h2 style={{ color: 'white', fontSize: '13px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '0.5px' }}>SUGGESTED COMMUNITIES</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayCommunities.slice(0, 5).map(community => {
            const contextText = userKeywords.length > 0 ? "Based on your interests" : "Suggested community";
            
            return (
              <div key={community.id} style={{ 
                display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '16px',
                border: '1px solid #27272A', backgroundColor: '#0A0A0A', gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Link href={`/communities/${community.id}`} style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#18181B', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #27272A' }}>
                    <Users size={24} color="#71717A" />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link href={`/communities/${community.id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '16px', letterSpacing: '-0.3px', display: 'block' }}>
                      {community.name}
                    </Link>
                    <div style={{ fontSize: '12px', color: '#1D9BF0', marginTop: '2px', fontWeight: 500 }}>
                      {contextText}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717A', fontSize: '13px', fontWeight: 500 }}>
                    <Users size={14} /> 
                    <span>{community._count.members} members</span>
                  </div>

                  <form action={joinCommunity} style={{ margin: 0 }}>
                    <input type="hidden" name="communityId" value={community.id} />
                    <button type="submit" style={{ backgroundColor: 'white', color: 'black', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      Join
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {recentPosts.length > 0 && (
        <div style={{ borderTop: '1px solid #27272A' }}>
          <h2 style={{ color: 'white', fontSize: '13px', fontWeight: 700, margin: '16px 16px', letterSpacing: '0.5px' }}>RECENT ACTIVITY</h2>
          {recentPosts.map(post => (
             <div key={post.id} style={{ padding: '16px', borderBottom: '1px solid #27272A' }}>
               <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '8px', fontWeight: 600 }}>
                 <Link href={`/communities/${post.communityId}`} style={{ color: '#71717A', textDecoration: 'none' }}>c/{post.community.name}</Link>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden' }}>
                    {post.author.profilePictureUrl ? <img src={post.author.profilePictureUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A'}}><Users size={20}/></div>}
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                     <Link href={`/user/${post.author.id}`} style={{ color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '15px' }}>{post.author.name}</Link>
                     <span style={{ color: '#71717A', fontSize: '13px' }}>@{post.author.username}</span>
                     <span style={{ color: '#71717A', fontSize: '13px' }}>· <LocalTime date={post.createdAt} /></span>
                   </div>
                   <p style={{ color: 'white', fontSize: '15px', marginTop: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4' }}>{post.content}</p>
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
