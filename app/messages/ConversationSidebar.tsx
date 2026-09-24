'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Plus } from 'lucide-react';
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

function formatBlueprintTime(dateString?: string) {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          overflow: 'hidden',
          padding: '16px 12px 16px 16px'
        }}
      >
        {/* Title matching Blueprint: "Recent messages for you" */}
        <div
          style={{
            padding: '4px 8px 14px 8px',
            flexShrink: 0
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#8E8E93',
              letterSpacing: '-0.1px'
            }}
          >
            Recent messages for you
          </span>
        </div>

        {/* Conversation List */}
        <div
          className="messages-threads-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxSizing: 'border-box',
            paddingRight: '4px'
          }}
        >
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <p style={{ color: '#71717A', fontSize: '13px', margin: '0 0 12px 0' }}>
                No conversations yet
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
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasUnread = conv.unreadCount > 0;
              const timeString = formatBlueprintTime(conv.lastMessage?.createdAt);

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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#1E2026' : 'transparent',
                    border: isActive
                      ? '1px solid rgba(255, 255, 255, 0.08)'
                      : '1px solid transparent',
                    boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.4)' : 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Partner Avatar */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#27272A'
                    }}
                  >
                    <ProfilePicture
                      user={conv.partner}
                      size={42}
                      showStatus={false}
                    />
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span
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
                    <span
                      style={{
                        fontSize: '12px',
                        color: hasUnread ? '#FFFFFF' : '#8E8E93',
                        fontWeight: hasUnread ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {snippet}
                      </span>
                      {timeString && (
                        <span style={{ color: '#71717A', fontSize: '11px', flexShrink: 0 }}>
                          {timeString}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Unread Blue Dot matching Blueprint */}
                  {hasUnread && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#0284C7',
                        boxShadow: '0 0 8px #0284C7',
                        flexShrink: 0
                      }}
                    />
                  )}
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom Left: Blueprint Action Button (Dark circular icon with user/grid plus) */}
        <div
          style={{
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            title="Start New Conversation"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#1E2026',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.15s ease, background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = '#272932';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#1E2026';
            }}
          >
            {/* Custom 4-dot + icon matching blueprint */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
              <line x1="17.5" y1="4" x2="17.5" y2="10" />
              <line x1="14.5" y1="7" x2="20.5" y2="7" />
            </svg>
          </button>
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
