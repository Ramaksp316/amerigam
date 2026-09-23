'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
      <div className="flex flex-col h-full w-full bg-[#000000] border-r border-white/5 select-none">
        {/* Top Header & Tabs matching Figma 17.png */}
        <div className="pt-4 px-4 pb-2">
          {/* Top Tabs: Message | Community */}
          <div className="flex items-center gap-6 mb-4">
            <span className="text-white font-bold text-base tracking-wide border-b-2 border-white pb-1 cursor-default">
              Message
            </span>
            <Link
              href="/communities"
              className="text-zinc-400 hover:text-white font-medium text-base tracking-wide pb-1 transition-colors"
            >
              Community
            </Link>
          </div>

          {/* Subtitle matching Figma 17.png: "Recent messages for you" */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Recent messages for you
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              + New
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-2">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full bg-[#18191c] text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-white/5 focus:border-white/20 outline-none placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-zinc-500 text-xs mb-3">
                {conversations.length === 0
                  ? 'No conversations yet'
                  : 'No matches found'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
              >
                <Plus size={14} /> Start a conversation
              </button>
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasUnread = conv.unreadCount > 0;
              const timeString = formatFigmaTime(conv.lastMessage?.createdAt);

              // Formatted snippet matching Figma `@username: snippet`
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all group ${
                    isActive
                      ? 'bg-[#22242a] shadow-sm'
                      : 'hover:bg-[#16171a]'
                  }`}
                >
                  {/* Partner Avatar */}
                  <div className="relative shrink-0">
                    <ProfilePicture
                      user={conv.partner}
                      size={44}
                      showStatus={false}
                    />
                  </div>

                  {/* Info: Name, snippet, timestamp */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-white truncate group-hover:text-sky-400 transition-colors">
                        {conv.partner.name || conv.partner.username}
                      </span>
                      {timeString && (
                        <span className="text-[11px] text-zinc-500 shrink-0 font-medium">
                          {timeString}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? 'text-zinc-200 font-semibold'
                            : 'text-zinc-400'
                        }`}
                      >
                        {snippet}
                      </p>
                      {/* Unread Blue Dot matching Figma 17.png */}
                      {hasUnread && (
                        <div className="w-2 h-2 rounded-full bg-[#1D9BF0] shrink-0 shadow-[0_0_8px_#1D9BF0]" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Bottom Bar with Green Action Button matching Figma 17.png */}
        <div className="p-3 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            title="New Conversation"
            className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <LayoutGrid size={18} strokeWidth={2.5} />
          </button>
          <span className="text-[11px] text-zinc-500 font-medium">
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
