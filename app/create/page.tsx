import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createPost } from './actions';

export default async function CreatePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!currentUser) redirect('/login');
  if (!currentUser.onboarded) redirect('/onboarding');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '1.8rem' }}>Create New Post</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Share a status, project, or thought with your network.</p>
      </div>

      <div className="card">
        <form action={createPost}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)', fontWeight: 600 }}>Post Type:</label>
            <select name="type" className="input-field" style={{ cursor: 'pointer', backgroundColor: 'var(--card-bg)' }}>
              <option value="post">Normal Post</option>
              <option value="project">Project / Portfolio Update</option>
              <option value="status">Status Update</option>
            </select>
          </div>

          <div>
            <textarea name="content" className="input-field" placeholder="What's on your mind? Describe your post or project here..." style={{ resize: 'vertical', minHeight: '120px' }}></textarea>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Related Path:</label>
              <select name="relatedMasterPath" className="input-field" defaultValue={currentUser?.masterPath || ""} style={{ cursor: 'pointer' }}>
                <option value="">None</option>
                <option value="The Professional">The Professional</option>
                <option value="The Creator">The Creator</option>
                <option value="The Athlete">The Athlete</option>
                <option value="The Explorer">The Explorer</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Specific Arena (Optional):</label>
              <input type="text" name="relatedCorePath" className="input-field" placeholder="e.g. Tech & AI" defaultValue={currentUser?.corePath || ""} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Upload Photo/Video: </label>
            <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
              <input type="file" name="media" accept="image/*,video/*" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
          <button type="submit" className="btn">Share</button>
        </form>
      </div>
    </div>
  );
}
