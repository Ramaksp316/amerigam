'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Plus,
  ChevronLeft,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Type,
  LayoutGrid,
} from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import { sendMessage, getLatestMessages } from './actions';

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string | Date;
  isRead?: boolean;
}

export default function ChatClient({
  initialMessages = [],
  conversationId,
  currentUserId,
  partner,
  isMobileOnly = false,
}: {
  initialMessages: MessageItem[];
  conversationId: string;
  currentUserId: string;
  partner: {
    id: string;
    name: string | null;
    username: string;
    avatarData: string | null;
    status?: string;
  };
  isMobileOnly?: boolean;
}) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // Real-time polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const latest = await getLatestMessages(conversationId, 60);
        if (latest && latest.length > 0) {
          setMessages((prev) => {
            // Check if there are any new messages or state changes
            if (latest.length !== prev.length || latest[latest.length - 1].id !== prev[prev.length - 1]?.id) {
              return latest as MessageItem[];
            }
            return prev;
          });
        }
      } catch (err) {
        // silent
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistic message update
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: MessageItem = {
      id: tempId,
      content,
      senderId: currentUserId,
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage(conversationId, partner.id, content);
      if (res && res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
        );
      } else {
        // Rollback
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18191c] rounded-none md:rounded-[28px] overflow-hidden select-none border border-white/5">
      {/* Header matching Figma 16.png */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#18191c]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button (Mobile only or when requested) */}
          <Link
            href="/messages"
            className="md:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white mr-1 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>

          {/* Red Status Dot matching Figma 16.png */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          </div>

          {/* Partner Avatar */}
          <Link href={`/user/${partner.id}`} className="shrink-0">
            <ProfilePicture user={partner} size={40} showStatus={false} />
          </Link>

          {/* Partner Name & Tag */}
          <div className="flex flex-col min-w-0">
            <Link
              href={`/user/${partner.id}`}
              className="text-base sm:text-lg font-bold text-white hover:text-sky-400 transition-colors truncate font-sans"
            >
              {partner.name || partner.username}
            </Link>
            <span className="text-[11px] text-zinc-400 truncate">
              @{partner.username}
            </span>
          </div>
        </div>

        {/* Right action indicator */}
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${partner.id}`}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 transition-all hidden sm:inline-block"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <ProfilePicture user={partner} size={54} showStatus={false} />
            </div>
            <h4 className="text-white font-bold text-base mb-1">
              Say hello to {partner.name || partner.username}!
            </h4>
            <p className="text-zinc-500 text-xs max-w-xs">
              This is the beginning of your direct conversation. Send a message to connect.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[index - 1];
            const isFirstInGroup =
              !prevMsg ||
              prevMsg.senderId !== msg.senderId ||
              new Date(msg.createdAt).getTime() -
                new Date(prevMsg.createdAt).getTime() >
                5 * 60000;

            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                {/* Incoming Message (Left) matching Figma 16.png */}
                {!isMe ? (
                  <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%]">
                    {/* Partner Avatar on left */}
                    <div className="shrink-0 mt-1">
                      <ProfilePicture
                        user={partner}
                        size={32}
                        showStatus={false}
                      />
                    </div>

                    <div className="flex flex-col">
                      {/* Dark bubble with cyan handle tag matching Figma 16 */}
                      <div className="bg-[#26282c] border border-white/[0.04] text-white rounded-[22px] px-4 py-2.5 shadow-sm">
                        <div className="text-[11px] font-semibold text-[#38bdf8] mb-0.5">
                          @{partner.username}
                        </div>
                        <div className="text-[14px] text-zinc-100 leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 ml-2 mt-1">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Outgoing Message (Right) matching Figma 16.png vibrant blue bubble */
                  <div className="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
                    <div className="bg-[#0284c7] text-white rounded-[22px] px-4 py-2.5 shadow-md">
                      <div className="text-[14px] text-white leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 mr-2 mt-1">
                      {timeStr}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-[#202227] border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          {['👋', '🔥', '👏', '🚀', '❤️', '😂', '👍', '✨', '🎯', '💯', '🙌'].map(
            (emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            )
          )}
        </div>
      )}

      {/* Chat Footer / Input Bar matching Figma 16.png */}
      <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#18191c]/95 backdrop-blur-md shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 sm:gap-3 w-full"
        >
          {/* Green circular button matching Figma 16 */}
          <button
            type="button"
            title="Apps & Tools"
            className="w-9 h-9 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center shrink-0 shadow transition-transform active:scale-95"
          >
            <LayoutGrid size={17} strokeWidth={2.4} />
          </button>

          {/* Plus (+) circle button matching Figma 16 */}
          <button
            type="button"
            title="Attach Media"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="w-9 h-9 rounded-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Plus size={18} strokeWidth={2.2} />
          </button>

          {/* Pill Input Container matching Figma 16 */}
          <div className="flex-1 flex items-center bg-[#202227] border border-white/10 rounded-full px-3.5 sm:px-4 py-1.5 focus-within:border-sky-500/50 transition-all gap-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="History is on"
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm outline-none resize-none py-1 leading-normal max-h-24"
            />

            {/* Utility action icons cluster matching Figma 16 */}
            <div className="hidden sm:flex items-center gap-2 text-zinc-400">
              <button
                type="button"
                title="Formatting"
                className="hover:text-white transition-colors"
              >
                <Type size={16} />
              </button>
              <button
                type="button"
                title="Emoji"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="hover:text-white transition-colors"
              >
                <Smile size={16} />
              </button>
              <button
                type="button"
                title="Stickers"
                className="hover:text-white transition-colors"
              >
                <ImageIcon size={16} />
              </button>
              <button
                type="button"
                title="Attach file"
                className="hover:text-white transition-colors"
              >
                <Paperclip size={16} />
              </button>
              <button
                type="button"
                title="Voice note"
                className="hover:text-white transition-colors"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>

          {/* Send Button matching Figma 16 (Paper plane circle) */}
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            title="Send"
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              text.trim()
                ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-lg shadow-sky-500/25 active:scale-95'
                : 'bg-[#24262b] text-zinc-500 cursor-default'
            }`}
          >
            <Send size={18} className="translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}