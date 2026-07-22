import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost, createCommunityTask, updateTaskStatus } from './actions';
import LocalTime from '../../components/LocalTime';
import Link from 'next/link';
import { Users, LayoutGrid, ArrowLeft, MessageSquare, CheckSquare, Calendar, Plus } from 'lucide-react';

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
  const activeTab = resolvedSearchParams.tab || 'chat';

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      creator: true,
      tasks: {
        include: { assignee: true, creator: true },
        orderBy: { createdAt: 'desc' }
      },
      members: {
        include: { user: true }
      },
      posts: {
        include: { author: true },
        orderBy: { createdAt: 'asc' } // Ascending for chat view
      }
    }
  });

  if (!community) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
        <h2 className="heading-jakaas">Space not found</h2>
        <Link href="/communities" className="btn btn-outline" style={{ display: 'inline-flex', marginTop: 'var(--space-4)' }}><ArrowLeft size={16} /> Back</Link>
      </div>
    );
  }

  const isMember = community.members.some(member => member.userId === userId);

  return (
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/communities" className="btn-text" style={{ padding: '4px' }} title="Back">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{community.name}</h1>
              <span style={{ fontSize: '0.7rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--accent-cyan)' }}>
                {community.type === 'FRIEND_GROUP' ? 'Private Group' : 'Public Space'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>{community.members.length} Members</p>
          </div>
        </div>

        {isMember && (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link href={`/communities/${community.id}?tab=chat`} className={`btn btn-small ${activeTab === 'chat' ? '' : 'btn-outline'}`} style={{ display: 'flex', gap: '6px' }}>
              <MessageSquare size={16} /> Chat
            </Link>
            <Link href={`/communities/${community.id}?tab=tasks`} className={`btn btn-small ${activeTab === 'tasks' ? '' : 'btn-outline'}`} style={{ display: 'flex', gap: '6px' }}>
              <CheckSquare size={16} /> Tasks
            </Link>
          </div>
        )}
      </div>

      {!isMember ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>You need to join this space to participate.</p>
          <Link href="/communities" className="btn btn-outline" style={{ display: 'inline-flex' }}>Go Back</Link>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="glass-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
              <div id="chat-container" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {community.posts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'var(--space-8)' }}>It's quiet here. Say hello!</p>
                ) : (
                  community.posts.map(post => {
                    const isMe = post.authorId === userId;
                    return (
                      <div key={post.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {!isMe && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px', marginBottom: '2px' }}>{post.author.name || post.author.username}</span>}
                        <div style={{ 
                          maxWidth: '75%', padding: 'var(--space-2) var(--space-4)', 
                          background: isMe ? 'var(--gradient-primary)' : 'var(--surface-2)', 
                          color: isMe ? '#fff' : 'var(--text-primary)',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        }}>
                          {post.content && <div style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>{post.content}</div>}
                          {post.mediaUrl && (
                            <div style={{ marginTop: post.content ? '8px' : '0', borderRadius: '8px', overflow: 'hidden' }}>
                              {post.mediaType === 'image' ? <img src={post.mediaUrl} style={{ maxWidth: '100%' }} /> : <video src={post.mediaUrl} controls style={{ maxWidth: '100%' }} />}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                          <LocalTime date={post.createdAt} format="time" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Chat Input */}
              <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-color)', background: 'var(--surface-1)' }}>
                <form action={createCommunityPost} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                  <input type="hidden" name="communityId" value={community.id} />
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-2)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', alignItems: 'center' }}>
                    <input type="file" name="media" id="media-upload" accept="image/*,video/*" style={{ display: 'none' }} />
                    <label htmlFor="media-upload" style={{ cursor: 'pointer', padding: '4px 8px', color: 'var(--text-secondary)' }} title="Attach Media">
                      <Plus size={20} />
                    </label>
                  </div>
                  <input type="text" name="content" className="input-field" placeholder="Message group..." style={{ margin: 0, flexGrow: 1, borderRadius: 'var(--radius-full)' }} autoComplete="off" />
                  <button type="submit" className="btn" style={{ borderRadius: 'var(--radius-full)', padding: '0 20px' }}>Send</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', paddingRight: '8px' }}>
              <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
                <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: '1.1rem' }}>Assign a New Task</h3>
                <form action={createCommunityTask} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input type="hidden" name="communityId" value={community.id} />
                  <input type="text" name="title" className="input-field" placeholder="Task Title (e.g., Design new logo)" required />
                  <textarea name="description" className="input-field" placeholder="Task details..." rows={2} style={{ resize: 'none' }}></textarea>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <select name="assigneeId" className="input-field" style={{ flexGrow: 1 }}>
                      <option value="">Unassigned (Open for anyone)</option>
                      {community.members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.user.name || m.user.username}</option>
                      ))}
                    </select>
                    <input type="date" name="deadline" className="input-field" style={{ flexGrow: 1 }} />
                  </div>
                  <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Create Task</button>
                </form>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {community.tasks.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>No tasks in this space yet.</p>
                ) : (
                  community.tasks.map(task => (
                    <div key={task.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', margin: 0, borderLeft: task.status === 'COMPLETED' ? '4px solid var(--success)' : '4px solid var(--accent-purple)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>{task.title}</h4>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>Assigned to: <strong>{task.assignee ? (task.assignee.name || task.assignee.username) : 'Anyone'}</strong></span>
                          {task.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Calendar size={12}/> {new Date(task.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      
                      <form action={updateTaskStatus}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="communityId" value={community.id} />
                        {task.status === 'PENDING' ? (
                          <>
                            <input type="hidden" name="status" value="COMPLETED" />
                            <button type="submit" className="btn btn-small btn-outline">Mark Done</button>
                          </>
                        ) : (
                          <>
                            <input type="hidden" name="status" value="PENDING" />
                            <button type="submit" className="btn btn-small btn-text" style={{ color: 'var(--text-secondary)' }}>Reopen</button>
                          </>
                        )}
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
