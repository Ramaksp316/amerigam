'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, LayoutGrid } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import NewConversationModal from './NewConversationModal';

export interface SerializedConversation {
  id: string;
  partner: {
    id: string;
    name: string | null;
    username: string;
    avatarData: string | null;
    status?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
}

function formatFigmaTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ConversationSidebar({
  conversations = [],
  activeConversationId,
  currentUserId,
  availableContacts = [],
}: {
  conversations: SerializedConversation[];
  activeConversationId?: string;
  currentUserId: string;
  availableContacts?: any[];
}) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = conversations.filter((c) => {
    const term = search.toLowerCase();
    const partnerName = (c.partner.name || '').toLowerCase();
    const partnerUsername = (c.partner.username || '').toLowerCase();
    const lastMsg = (c.lastMessage?.content || '').toLowerCase();
    return (
      partnerName.includes(term) ||
      partnerUsername.includes(term) ||
      lastMsg.includes(term)
    );
  });

  return (
    <>
      <div
        className="messages-sidebar-panel"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Top Header & Tabs matching Figma 17.png */}
        <div style={{ flexShrink: 0 }}>
          {/* Top Tabs: Message | Community */}
          <div
            className="messages-tabs-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '20px 20px 14px 20px'
            }}
          >
            <span
              className="messages-tab-btn active"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                borderBottom: '2px solid #FFFFFF',
                paddingBottom: '4px',
                cursor: 'default',
                letterSpacing: '-0.2px'
              }}
            >
              Message
            </span>
            <Link
              href="/communities"
              className="messages-tab-btn"
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#8E8E93',
                paddingBottom: '4px',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.2s ease'
              }}
            >
              Community
            </Link>
          </div>

          {/* Subtitle matching Figma 17.png: "Recent messages for you" */}
          <div
            className="messages-section-title-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 20px 10px 20px'
            }}
          >
            <h2
              className="messages-section-title"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#8E8E93',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0
              }}
            >
              Recent messages for you
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="messages-new-chat-link"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1D9BF0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              + New
            </button>
          </div>

          {/* Search bar matching Windows / Figma border-glow pill */}
          <div
            className="messages-search-container"
            style={{
              margin: '0 16px 14px 16px',
              position: 'relative'
            }}
          >
            <Search
              size={15}
              className="messages-search-icon"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717A',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="messages-search-input"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#18191D',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '9px 16px 9px 38px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div
          className="messages-threads-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxSizing: 'border-box'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <p style={{ color: '#71717A', fontSize: '13px', margin: '0 0 12px 0' }}>
                {conversations.length === 0
                  ? 'No conversations yet'
                  : 'No matching messages'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Start a conversation
              </button>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasUnread = conv.unreadCount > 0;
              const timeString = formatFigmaTime(conv.lastMessage?.createdAt);

              let snippet = 'No messages yet';
              if (conv.lastMessage) {
                const isMe = conv.lastMessage.senderId === currentUserId;
                snippet = isMe
                  ? `You: ${conv.lastMessage.content}`
                  : conv.lastMessage.content;
              }

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`messages-thread-item ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#22242B' : 'transparent',
                    border: isActive
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#16171B';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Partner Avatar */}
                  <div
                    className="messages-thread-avatar"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ProfilePicture
                      user={conv.partner}
                      size={44}
                      showStatus={false}
                    />
                  </div>

                  {/* Info */}
                  <div
                    className="messages-thread-info"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div
                      className="messages-thread-top"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <span
                        className="messages-thread-name"
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {conv.partner.name || conv.partner.username}
                      </span>
                      {timeString && (
                        <span
                          className="messages-thread-time"
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#71717A',
                            flexShrink: 0
                          }}
                        >
                          {timeString}
                        </span>
                      )}
                    </div>
                    <div
                      className="messages-thread-bottom"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <p
                        className={`messages-thread-snippet ${hasUnread ? 'unread' : ''}`}
                        style={{
                          fontSize: '13px',
                          color: hasUnread ? '#E4E4E7' : '#8E8E93',
                          fontWeight: hasUnread ? 600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          margin: 0,
                          lineHeight: 1.4
                        }}
                      >
                        {snippet}
                      </p>
                      {/* Unread Blue Dot matching Figma 17.png */}
                      {hasUnread && (
                        <div
                          className="messages-thread-unread-dot"
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#1D9BF0',
                            boxShadow: '0 0 8px #1D9BF0',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom Bar with Green Action Button matching Figma 17.png */}
        <div
          className="messages-sidebar-footer"
          style={{
            padding: '14px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#000000',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            title="New Conversation"
            className="messages-action-green-btn"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              flexShrink: 0
            }}
          >
            <LayoutGrid size={18} strokeWidth={2.4} />
          </button>
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
            {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={availableContacts}
      />
    </>
  );
}
