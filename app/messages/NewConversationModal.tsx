'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, User as UserIcon } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

interface ContactUser {
  id: string;
  name: string | null;
  username: string;
  avatarData: string | null;
  status?: string;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  contacts = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  contacts: ContactUser[];
}) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const filtered = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      c.username.toLowerCase().includes(term)
    );
  });

  const handleSelect = (userId: string) => {
    onClose();
    router.push(`/messages?userId=${userId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#16171b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white font-sans">New Message</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people to message..."
              autoFocus
              className="w-full bg-[#202227] text-white text-sm pl-10 pr-4 py-2.5 rounded-full border border-white/10 focus:border-sky-500/50 outline-none transition-colors"
            />
          </div>
        </div>

        {/* List of contacts */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4 text-zinc-500 text-sm">
              {contacts.length === 0
                ? "No connections found yet. Explore the network to find friends!"
                : "No matching users found."}
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
              >
                <ProfilePicture user={user} size={44} showStatus={false} />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm group-hover:text-sky-400 transition-colors truncate">
                    {user.name || user.username}
                  </div>
                  <div className="text-zinc-400 text-xs truncate">
                    @{user.username}
                  </div>
                </div>
                <div className="text-xs text-sky-400 font-medium px-3 py-1 rounded-full bg-sky-500/10 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  Chat
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
