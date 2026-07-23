import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost, createCommunityTask, updateTaskStatus } from './actions';
import LocalTime from '../../components/LocalTime';
import Link from 'next/link';
import { Users, LayoutGrid, ArrowLeft, MessageSquare, CheckSquare, Calendar, Plus } from 'lucide-react';
import CommunityClient from './CommunityClient';
import PageRefresher from '../../components/PageRefresher';

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
      },
      notes: {
        include: { updatedBy: true },
        orderBy: { createdAt: 'asc' }
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
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <PageRefresher intervalMs={15000} />
      {!isMember ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>You need to join this space to participate.</p>
          <Link href="/communities" className="btn btn-outline" style={{ display: 'inline-flex' }}>Go Back</Link>
        </div>
      ) : (
        <CommunityClient 
          community={community} 
          userId={userId} 
          activeTab={activeTab}
          createPostAction={createCommunityPost}
          createTaskAction={createCommunityTask}
          updateTaskAction={updateTaskStatus}
        />
      )}
    </div>
  );
}
