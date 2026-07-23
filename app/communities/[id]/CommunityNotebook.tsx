'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Trash2, Save, FileText, ChevronRight, CornerDownRight, Edit2 } from 'lucide-react';
import { createNotebookPage, updateNotebookPage, deleteNotebookPage } from './actions';

export default function CommunityNotebook({
  community,
  userId
}: {
  community: any;
  userId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activePageId, setActivePageId] = useState<string | null>(
    community.notes.length > 0 ? community.notes[0].id : null
  );
  const [saving, setSaving] = useState(false);

  const activePage = community.notes.find((p: any) => p.id === activePageId);

  // Local state for editing to prevent lag
  const [localTitle, setLocalTitle] = useState(activePage?.title || '');
  const [localContent, setLocalContent] = useState(activePage?.content || '');
  const [localPenColor, setLocalPenColor] = useState(activePage?.penColor || '#1e3a8a');

  // When active page changes, update local state
  const handlePageSelect = (page: any) => {
    setActivePageId(page.id);
    setLocalTitle(page.title);
    setLocalContent(page.content);
    setLocalPenColor(page.penColor);
  };

  const handleAddPage = async () => {
    const newPage = await createNotebookPage(community.id);
    if (newPage) {
      router.refresh();
      setActivePageId(newPage.id);
      setLocalTitle(newPage.title);
      setLocalContent(newPage.content);
      setLocalPenColor(newPage.penColor);
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this page?")) {
      await deleteNotebookPage(pageId, community.id);
      router.refresh();
      if (activePageId === pageId) {
        const remaining = community.notes.filter((p: any) => p.id !== pageId);
        if (remaining.length > 0) {
          handlePageSelect(remaining[0]);
        } else {
          setActivePageId(null);
          setLocalTitle('');
          setLocalContent('');
          setLocalPenColor('#1e3a8a');
        }
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePageId) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('pageId', activePageId);
    formData.append('communityId', community.id);
    formData.append('title', localTitle);
    formData.append('content', localContent);
    formData.append('penColor', localPenColor);

    await updateNotebookPage(formData);
    setSaving(false);
    router.refresh();
  };

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 'var(--space-2)' }}>
      {/* Load handwriting font */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap');
        
        .notebook-rules {
          background-color: #fdfbf7;
          background-image: linear-gradient(rgba(30, 58, 138, 0.08) 1px, transparent 1px);
          background-size: 100% 32px;
          line-height: 32px;
        }

        .notebook-text {
          font-family: 'Caveat', cursive;
          font-size: 21px;
          line-height: 32px;
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          resize: none;
        }

        .spiral-binding {
          width: 24px;
          background: linear-gradient(to right, #ccc 10%, #fff 30%, #999 60%, #ccc 80%);
          position: relative;
          z-index: 10;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          border-left: 1px solid #777;
          border-right: 1px solid #777;
        }

        .spiral-ring {
          height: 12px;
          width: 32px;
          background: linear-gradient(#999, #eee 40%, #555 70%, #999);
          border-radius: 6px;
          position: absolute;
          left: -4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }
      `}} />

      {!isOpen ? (
        /* Front Cover of Notebook */
        <div style={{
          margin: 'auto',
          maxWidth: '440px',
          width: '100%',
          height: '520px',
          background: 'linear-gradient(135deg, #4A2E1B 0%, #2A190E 100%)',
          borderRadius: '16px 24px 24px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset -5px 0 10px rgba(0,0,0,0.3), inset 5px 0 10px rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 30px',
          cursor: 'pointer',
          transform: 'perspective(1000px) rotateY(-5deg)',
          transition: 'transform 0.5s ease',
          border: '1px solid #5C3D24',
          borderLeft: '15px solid #22130A',
        }}
        onClick={() => setIsOpen(true)}
        className="hover-card"
        >
          {/* Notebook Label Card */}
          <div style={{
            width: '100%',
            background: '#FDFBF7',
            border: '4px double #4A2E1B',
            borderRadius: '8px',
            padding: '24px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            marginTop: '40px'
          }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#4A2E1B', margin: 0, fontSize: '1.6rem', fontWeight: 700, letterSpacing: '1px' }}>
              NOTEBOOK
            </h2>
            <div style={{ width: '40px', height: '2px', background: '#4A2E1B', margin: '12px auto' }}></div>
            <p style={{ fontFamily: 'sans-serif', textTransform: 'uppercase', fontSize: '10px', color: '#8b5a2b', fontWeight: 700, margin: 0, letterSpacing: '2px' }}>
              {community.name}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Click to Open</span>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <BookOpen size={20} />
            </div>
          </div>
        </div>
      ) : (
        /* Open Notebook Side-by-Side */
        <div style={{
          display: 'flex',
          flexGrow: 1,
          background: '#2A190E',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
          border: '8px solid #3E2515',
          overflow: 'hidden',
          height: '100%'
        }}>
          {/* Left Page (Index & Page List) */}
          <div style={{
            flex: '1 1 35%',
            background: '#FAF6EE',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', color: '#3A271A', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Index
              </h3>
              <button
                onClick={handleAddPage}
                className="btn btn-outline"
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderColor: '#8B5A2B',
                  color: '#8B5A2B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} /> New Page
              </button>
            </div>

            {/* List of Pages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {community.notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#8B5A2B', opacity: 0.6 }}>
                  <FileText size={32} style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <p style={{ fontSize: '13px', margin: 0 }}>No pages in this notebook yet.</p>
                </div>
              ) : (
                community.notes.map((page: any) => {
                  const isActive = page.id === activePageId;
                  return (
                    <div
                      key={page.id}
                      onClick={() => handlePageSelect(page)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(139, 90, 43, 0.1)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: isActive ? '1px solid rgba(139, 90, 43, 0.2)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <CornerDownRight size={12} color="#8B5A2B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontFamily: 'sans-serif',
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#3A271A' : '#7A6250',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {page.title || 'Untitled Page'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeletePage(page.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b91c1c',
                          opacity: isActive ? 0.8 : 0,
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        className="delete-btn-hover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Back to Cover button */}
            <button
              onClick={() => setIsOpen(false)}
              className="btn-text"
              style={{
                marginTop: 'auto',
                alignSelf: 'flex-start',
                color: '#8B5A2B',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                paddingTop: '20px'
              }}
            >
              Close Notebook
            </button>
          </div>

          {/* Spiral Metal Binding (Center separator) */}
          <div className="spiral-binding">
            {/* Create loops */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="spiral-ring" style={{ top: `${i * 32 + 24}px` }} />
            ))}
          </div>

          {/* Right Page (Page Editor) */}
          <div style={{
            flex: '1 1 65%',
            background: '#FAF6EE',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
          }}>
            {activePage ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {/* Editor Header / Controls */}
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: 'rgba(0,0,0,0.01)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {/* Ink Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A6250', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ink:</span>
                    <button
                      type="button"
                      onClick={() => setLocalPenColor('#1e3a8a')} // Blue Ink
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#1e3a8a',
                        border: localPenColor === '#1e3a8a' ? '2px solid #FAF6EE' : '1px solid rgba(0,0,0,0.2)',
                        boxShadow: localPenColor === '#1e3a8a' ? '0 0 0 2px #1e3a8a' : 'none',
                        cursor: 'pointer'
                      }}
                      title="Blue Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalPenColor('#111827')} // Black Ink
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#111827',
                        border: localPenColor === '#111827' ? '2px solid #FAF6EE' : '1px solid rgba(0,0,0,0.2)',
                        boxShadow: localPenColor === '#111827' ? '0 0 0 2px #111827' : 'none',
                        cursor: 'pointer'
                      }}
                      title="Black Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalPenColor('#dc2626')} // Red Ink
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#dc2626',
                        border: localPenColor === '#dc2626' ? '2px solid #FAF6EE' : '1px solid rgba(0,0,0,0.2)',
                        boxShadow: localPenColor === '#dc2626' ? '0 0 0 2px #dc2626' : 'none',
                        cursor: 'pointer'
                      }}
                      title="Red Ink"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {activePage.updatedBy && (
                      <span style={{ fontSize: '10px', color: '#7A6250', fontWeight: 500 }}>
                        Edited by <strong>{activePage.updatedBy.name || activePage.updatedBy.username}</strong>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn"
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: '#8B5A2B',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(139, 90, 43, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Save size={12} /> {saving ? 'Writing...' : 'Save Page'}
                    </button>
                  </div>
                </div>

                {/* Notebook Sheet */}
                <div 
                  className="notebook-rules"
                  style={{
                    flexGrow: 1,
                    padding: '24px 24px 24px 60px', // Left padding leaves space for margin line
                    position: 'relative',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Red Margin Line */}
                  <div style={{
                    position: 'absolute',
                    left: '45px',
                    top: 0,
                    bottom: 0,
                    width: '1.5px',
                    background: 'rgba(239, 68, 68, 0.25)',
                    height: '100%'
                  }}></div>

                  {/* Handwritten Title */}
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Page Title"
                    className="notebook-text"
                    style={{
                      fontWeight: 700,
                      fontSize: '24px',
                      color: localPenColor,
                      borderBottom: '1px dashed rgba(0,0,0,0.1)',
                      paddingBottom: '4px',
                      marginBottom: '16px'
                    }}
                  />

                  {/* Ruled Textarea */}
                  <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    placeholder="Start writing notes here..."
                    className="notebook-text"
                    style={{
                      flexGrow: 1,
                      color: localPenColor,
                      minHeight: '280px',
                    }}
                  />
                </div>
              </form>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '40px', color: '#8B5A2B', opacity: 0.6 }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px auto', display: 'block' }} />
                <h3>No Page Active</h3>
                <p style={{ fontSize: '13px' }}>Select an existing page from the index or click "New Page" to begin writing.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
