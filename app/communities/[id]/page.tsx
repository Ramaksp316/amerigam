
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost, sendCommunityMessage } from './actions';
import LocalTime from '../../components/LocalTime';
import Link from 'next/link';
import Image from 'next/image';
import { Users, LayoutGrid, ArrowLeft, MessageSquare, Info, Plus } from 'lucide-react';
import CommunityChatClient from './CommunityChatClient';
import DeleteCommunityButton from './DeleteCommunityButton';
import InviteMembersButton from './InviteMembersButton';

export default async function CommunityDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ tab?: string }> 
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const communityId = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || 'posts';

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      creator: true,
      members: {
        include: { user: true }
      },
      posts: {
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      },
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'asc' }
      },
      _count: { select: { members: true } }
    }
  });

  if (!community) {
    return <div style={{ color: 'white', padding: '20px' }}>Community not found.</div>;
  }

  const isMember = community.members.some(m => m.userId === userId);
  const isAdmin = community.creatorId === userId;

  return (
    <div style={{ backgroundColor: '#000000', height: '100dvh', width: '100%', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Premium Header */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <Link href="/communities" style={{ color: 'white', textDecoration: 'none' }}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {community.avatarData ? (
                <img src={community.avatarData} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Users size={20} color="#71717A" />
              )}
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{community.name}</h1>
              <p style={{ color: '#A1A1AA', fontSize: '12px', margin: 0 }}>{community._count.members} members</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #27272A', padding: '0 8px' }}>
          {['Posts', 'Chat', 'Members', 'About'].map(tab => {
            const tabKey = tab.toLowerCase();
            const isActive = activeTab === tabKey;
            return (
              <Link key={tabKey} href={`/communities/${communityId}?tab=${tabKey}`} style={{
                flex: 1, textAlign: 'center', padding: '14px 0',
                color: isActive ? 'white' : '#71717A',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                position: 'relative',
                fontSize: '14px'
              }}>
                {tab}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '36px', height: '4px', background: '#1D9BF0', borderRadius: '4px 4px 0 0' }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
            {isMember ? (
              <form action={createCommunityPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0A0A0A', padding: '16px', borderRadius: '16px', border: '1px solid #27272A' }}>
                <input type="hidden" name="communityId" value={communityId} />
                <textarea 
                  name="content"
                  placeholder="Share something with the community..."
                  style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '15px', resize: 'none', outline: 'none' }}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ backgroundColor: '#1D9BF0', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Post</button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#71717A', border: '1px solid #27272A', borderRadius: '12px' }}>
                Join this community to post.
              </div>
            )}

            {community.posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>No posts yet.</div>
            ) : (
              community.posts.map(post => (
                <div key={post.id} style={{ display: 'flex', gap: '12px', padding: '16px', borderBottom: '1px solid #27272A' }}>
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
              ))
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
            {!isMember ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#71717A' }}>
                You must join the community to view and participate in chat.
              </div>
            ) : (
              <CommunityChatClient 
                initialMessages={community.messages} 
                communityId={communityId} 
                currentUserId={userId} 
              />
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isAdmin && <InviteMembersButton communityId={communityId} />}

            {community.members.map(member => (
              <Link key={member.id} href={`/user/${member.user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden' }}>
                  {member.user.profilePictureUrl ? <img src={member.user.profilePictureUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A'}}><Users size={24}/></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{member.user.name}</span>
                    {member.userId === community.creatorId && <span style={{ backgroundColor: '#27272A', color: '#1D9BF0', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>Admin</span>}
                  </div>
                  <div style={{ color: '#A1A1AA', fontSize: '13px' }}>@{member.user.username}</div>
                  {member.user.career && <div style={{ color: '#71717A', fontSize: '13px', marginTop: '2px' }}>{member.user.career}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>About</h2>
              <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.5' }}>{community.description || 'No description provided.'}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0A0A0A', padding: '16px', borderRadius: '12px', border: '1px solid #27272A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A', fontSize: '14px' }}>Category</span>
                <span style={{ color: 'white', fontSize: '14px' }}>{community.category || 'General'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A', fontSize: '14px' }}>Members</span>
                <span style={{ color: 'white', fontSize: '14px' }}>{community._count.members}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717A', fontSize: '14px' }}>Created</span>
                <span style={{ color: 'white', fontSize: '14px' }}><LocalTime date={community.createdAt} /></span>
              </div>
            </div>

            {isAdmin && <DeleteCommunityButton communityId={community.id} />}
          </div>
        )}
      </div>
    </div>
  );
}
