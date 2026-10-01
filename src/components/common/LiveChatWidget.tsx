import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  User,
  Shield,
  Smile,
  Sparkles,
  ChevronDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { fetchChatMessages, sendChatMessage, deleteChatMessage } from '../../services/api';
import { ChatMessage } from '../../types';
import { FeedbackModal } from './FeedbackModal';

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [tempName, setTempName] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgCountRef = useRef(0);

  // Kiểm tra token admin
  const isAdmin = Boolean(localStorage.getItem('phimhay247_admin_token'));

  // Khởi tạo nickname
  useEffect(() => {
    const savedName = localStorage.getItem('phimhay247_chat_name');
    if (savedName) {
      setNickname(savedName);
      setTempName(savedName);
    } else {
      const defaultName = isAdmin
        ? 'Quản Trị Viên (Admin)'
        : `Hội viên #${Math.floor(1000 + Math.random() * 9000)}`;
      setNickname(defaultName);
      setTempName(defaultName);
      localStorage.setItem('phimhay247_chat_name', defaultName);
    }
  }, [isAdmin]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load tin nhắn
  const loadMessages = async () => {
    try {
      const data = await fetchChatMessages(60);
      setMessages(data);

      if (!isOpen && data.length > lastMsgCountRef.current && lastMsgCountRef.current > 0) {
        setUnreadCount((prev) => prev + (data.length - lastMsgCountRef.current));
      }
      lastMsgCountRef.current = data.length;
    } catch (err) {
      console.debug('Lỗi tải tin nhắn chat:', err);
    }
  };

  // Polling tin nhắn: 4s/lần khi đang mở hoặc 15s/lần khi đóng
  useEffect(() => {
    loadMessages();
    const intervalTime = isOpen ? 3500 : 15000;
    const interval = setInterval(loadMessages, intervalTime);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages.length]);

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setNickname(tempName.trim());
      localStorage.setItem('phimhay247_chat_name', tempName.trim());
      setShowNameEdit(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const newMsg = await sendChatMessage({
        senderName: nickname,
        content: content.trim(),
        senderBadge: isAdmin ? 'Admin' : 'Hội viên',
      });

      setMessages((prev) => [...prev, newMsg]);
      setContent('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này không?')) return;
    try {
      await deleteChatMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Lỗi xóa tin nhắn:', err);
    }
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded-full shadow-2xl shadow-red-600/40 hover:scale-105 transition-all group font-semibold text-sm border border-red-400/30"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-cinema-900 animate-pulse" />
            </div>
            <span>Kênh Chat</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-red-600 rounded-full animate-bounce">
                +{unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] sm:w-[390px] h-[520px] max-h-[85vh] bg-cinema-900/95 backdrop-blur-xl border border-cinema-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-cinema-950 via-cinema-900 to-cinema-950 border-b border-cinema-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Kênh Chat Khán Giả
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping" />
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span>Bạn: </span>
                  <button
                    onClick={() => setShowNameEdit(true)}
                    className="text-amber-400 hover:underline font-medium truncate max-w-[120px]"
                    title="Bấm để đổi tên hiển thị"
                  >
                    {nickname}
                  </button>
                  {isAdmin && (
                    <span className="px-1 py-0.2 bg-red-600/30 text-red-400 text-[9px] rounded font-bold border border-red-500/40">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFeedbackOpen(true)}
                className="p-1.5 text-gray-400 hover:text-amber-400 rounded-lg transition"
                title="Góp ý & Báo lỗi phim"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-cinema-800 transition"
                title="Thu nhỏ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal đổi tên hiển thị */}
          {showNameEdit && (
            <div className="p-3 bg-cinema-950/90 border-b border-cinema-800 animate-fadeIn">
              <form onSubmit={handleSaveNickname} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nhập tên hiển thị..."
                  maxLength={25}
                  className="flex-grow px-3 py-1.5 bg-cinema-900 border border-cinema-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowNameEdit(false)}
                  className="px-2 py-1.5 text-gray-400 text-xs hover:text-white"
                >
                  Hủy
                </button>
              </form>
            </div>
          )}

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-cinema-700">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10 space-y-2">
                <MessageCircle className="w-10 h-10 text-cinema-700" />
                <p className="text-xs">Chưa có tin nhắn nào.</p>
                <p className="text-[11px] text-gray-500">Hãy là người đầu tiên gửi lời chào tới mọi người!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === nickname;
                const isMsgAdmin = msg.senderBadge === 'Admin';

                return (
                  <div key={msg.id} className="group flex items-start gap-2.5 text-xs animate-fadeIn">
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow"
                      style={{
                        backgroundColor:
                          msg.avatarColor || (isMsgAdmin ? '#dc2626' : '#2563eb'),
                      }}
                    >
                      {msg.senderName.substring(0, 1).toUpperCase()}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex-grow max-w-[82%]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`font-semibold ${
                            isMsgAdmin ? 'text-red-400 font-bold' : isMe ? 'text-amber-400' : 'text-gray-200'
                          }`}
                        >
                          {msg.senderName}
                        </span>

                        {isMsgAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-600/30 text-red-400 border border-red-500/40">
                            BQT
                          </span>
                        )}

                        <span className="text-[10px] text-gray-500 ml-auto">
                          {formatTime(msg.createdAt)}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-0.5 transition"
                            title="Xóa tin nhắn (Admin)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div
                        className={`p-2.5 rounded-2xl break-words leading-relaxed ${
                          isMsgAdmin
                            ? 'bg-red-950/40 text-red-100 border border-red-800/40'
                            : isMe
                            ? 'bg-cinema-800 text-gray-100 border border-cinema-700/60'
                            : 'bg-cinema-950/80 text-gray-200 border border-cinema-800'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Bar */}
          <div className="px-3 py-1.5 bg-cinema-950/60 border-t border-cinema-800 flex items-center justify-between text-base">
            {['🔥', '❤️', '👏', '😂', '🍿', '🎬', '👍'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="hover:scale-125 transition transform p-1"
                title={`Thêm ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-cinema-950 border-t border-cinema-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập tin nhắn với cộng đồng..."
              maxLength={200}
              className="flex-grow px-3 py-2 bg-cinema-900 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="p-2 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl hover:from-red-500 hover:to-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              title="Gửi (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Modal Báo lỗi & Góp ý nếu mở từ chatbox */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
};
