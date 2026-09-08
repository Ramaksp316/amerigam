
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost, sendCommunityMessage } from './actions';
import LocalTime from '../../components/LocalTime';
import Link from 'next/link';
import ProfilePicture from '../../components/ProfilePicture';
import CommunityAvatar from '../../components/CommunityAvatar';
import Image from 'next/image';
import { Users, LayoutGrid, ArrowLeft, MessageSquare, Info, Plus } from 'lucide-react';
import CommunityChatClient from './CommunityChatClient';
import DeleteCommunityButton from './DeleteCommunityButton';
import InviteMembersButton from './InviteMembersButton';
import AddMemberSection from './AddMemberSection';
import RemoveMemberButton from './RemoveMemberButton';

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

  if (community.type !== 'PUBLIC' && !isMember) {
    return (
      <div style={{ backgroundColor: '#000000', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Users size={32} color="#71717A" />
        </div>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Private Community</h1>
        <p style={{ color: '#A1A1AA', fontSize: '15px', maxWidth: '300px', marginBottom: '24px' }}>This community is private. You must be invited to join.</p>
        <Link href="/communities" style={{ backgroundColor: '#ffffff', color: '#000000', padding: '10px 24px', borderRadius: '24px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#000000', position: 'fixed', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Premium Compact Header */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
          <Link href="/communities" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {community.avatarData ? (
                <img src={community.avatarData} alt={community.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Users size={20} color="#71717A" />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h1 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-sans), sans-serif' }}>{community.name}</h1>
              <p style={{ color: '#A1A1AA', fontSize: '13px', margin: 0, fontFamily: 'var(--font-sans), sans-serif' }}>{community._count.members} members {community.type === 'PRIVATE' && '• Private'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #18181B', padding: '0 8px', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {['Posts', 'Chat', 'Members', 'About'].map(tab => {
            const tabKey = tab.toLowerCase();
            const isActive = activeTab === tabKey;
            return (
              <Link key={tabKey} href={`/communities/${communityId}?tab=${tabKey}`} style={{
                textAlign: 'center', padding: '12px 4px',
                color: isActive ? 'white' : '#71717A',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                position: 'relative',
                fontSize: '14px',
                fontFamily: 'var(--font-sans), sans-serif',
                whiteSpace: 'nowrap'
              }}>
                {tab}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '0', right: '0', height: '2px', background: 'white', borderRadius: '2px 2px 0 0' }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: activeTab === 'chat' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '80px' }}>
            {isMember ? (
              <div style={{ padding: '16px', borderBottom: '1px solid #18181B' }}>
                <Link href={`/create?communityId=${communityId}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Users size={16} color="#71717A" />
                   </div>
                   <div style={{ flexGrow: 1, color: '#A1A1AA', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>
                     Share something with the community...
                   </div>
                   <div style={{ padding: '6px 12px', backgroundColor: 'rgba(29, 155, 240, 0.1)', color: '#1D9BF0', borderRadius: '16px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>
                     Post
                   </div>
                </Link>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#71717A', fontFamily: 'var(--font-sans), sans-serif' }}>
                Join this community to post.
              </div>
            )}

            {community.posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>No posts yet</h3>
                <p style={{ color: '#71717A', margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'var(--font-sans), sans-serif' }}>{isMember ? 'Start the conversation.' : 'Be the first to know when members post.'}</p>
                {isMember && (
                  <Link href={`/create?communityId=${communityId}`} style={{ display: 'inline-block', backgroundColor: '#1D9BF0', color: 'white', fontWeight: 600, fontSize: '14px', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'var(--font-sans), sans-serif' }}>
                    Create Post
                  </Link>
                )}
              </div>
            ) : (
              community.posts.map(post => {
                const author = post.author;
                return (
                  <div key={post.id} style={{ display: 'flex', gap: '12px', padding: '16px', borderBottom: '1px solid #18181B' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
                       {author.avatarData ? <img src={author.avatarData} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A'}}><Users size={20}/></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Link href={`/user/${author.id}`} style={{ color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          @{author.username}
                        </Link>
                      </div>
                      <p style={{ color: 'white', fontSize: '15px', margin: '0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4', fontFamily: 'var(--font-sans), sans-serif' }}>{post.content}</p>
                      {post.mediaUrl && (
                        <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #27272A' }}>
                          <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', display: 'block' }} />
                        </div>
                      )}
                      <div style={{ marginTop: '8px', color: '#71717A', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif' }}>
                        <LocalTime date={post.createdAt} compact={false} />
                      </div>
                    </div>
                  </div>
                );
              })
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
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '100px' }}>
            {isAdmin && (
              <div style={{ padding: '16px', borderBottom: '1px solid #18181B' }}>
                {community.type === 'PUBLIC' ? (
                  <InviteMembersButton communityId={communityId} />
                ) : (
                  <AddMemberSection communityId={communityId} members={community.members} />
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {community.members.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #18181B' }}>
                  <Link href={`/user/${member.user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
                      {member.user.avatarData ? (
                        <img src={member.user.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A' }}><Users size={24} /></div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.user.name || member.user.username}</span>
                        {member.userId === community.creatorId && (
                          <span style={{ backgroundColor: 'rgba(29, 155, 240, 0.1)', color: '#1D9BF0', fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-sans), sans-serif', flexShrink: 0 }}>Admin</span>
                        )}
                      </div>
                      <span style={{ color: '#71717A', fontSize: '13px', fontFamily: 'var(--font-sans), sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{member.user.username}</span>
                    </div>
                  </Link>
                  {isAdmin && member.userId !== userId && (
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <RemoveMemberButton communityId={communityId} userId={member.userId} userName={member.user.name || member.user.username} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0, fontFamily: 'var(--font-sans), sans-serif' }}>About</h2>
              {community.description && (
                <p style={{ color: '#E4E4E7', fontSize: '15px', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-sans), sans-serif' }}>
                  {community.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #18181B' }}>
                <span style={{ color: '#A1A1AA', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>Category</span>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans), sans-serif' }}>{community.category || 'General'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #18181B' }}>
                <span style={{ color: '#A1A1AA', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>Type</span>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans), sans-serif' }}>{community.type === 'PUBLIC' ? 'Public' : 'Private'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #18181B' }}>
                <span style={{ color: '#A1A1AA', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>Members</span>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans), sans-serif' }}>{community._count.members}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #18181B' }}>
                <span style={{ color: '#A1A1AA', fontSize: '15px', fontFamily: 'var(--font-sans), sans-serif' }}>Created</span>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-sans), sans-serif' }}>
                  {new Date(community.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div style={{ marginTop: '32px' }}>
                <DeleteCommunityButton communityId={communityId} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
