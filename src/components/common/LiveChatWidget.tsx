import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Palette,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { fetchChatMessages, sendChatMessage, deleteChatMessage } from '../../services/api';
import { ChatMessage } from '../../types';
import { FeedbackModal } from './FeedbackModal';

const AVATAR_PRESETS = [
  { icon: '🦁', label: 'Sư Tử' },
  { icon: '🥷', label: 'Ninja' },
  { icon: '👑', label: 'Vương Giả' },
  { icon: '🐉', label: 'Thần Long' },
  { icon: '🦊', label: 'Hồ Ly' },
  { icon: '🐱', label: 'Mèo Ngầu' },
  { icon: '🐼', label: 'Gấu Trúc' },
  { icon: '🧙', label: 'Pháp Sư' },
  { icon: '🍿', label: 'Mọt Phim' },
  { icon: '🎬', label: 'Đạo Diễn' },
  { icon: '🦸', label: 'Anh Hùng' },
  { icon: '🤖', label: 'Robot' },
  { icon: '⚔️', label: 'Kiếm Sĩ' },
  { icon: '🐺', label: 'Sói Tuyết' },
  { icon: '🐯', label: 'Bạch Hổ' },
  { icon: '💎', label: 'Kim Cương' },
];

const COLOR_PRESETS = [
  '#dc2626', // Đỏ
  '#f59e0b', // Vàng hổ phách
  '#2563eb', // Xanh dương
  '#10b981', // Xanh ngọc
  '#8b5cf6', // Tím
  '#ec4899', // Hồng
  '#06b6d4', // Cyan
  '#475569', // Xám Slate
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(18);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [avatarColor, setAvatarColor] = useState('#2563eb');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('🦁');
  const [tempColor, setTempColor] = useState('#2563eb');
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');

  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgCountRef = useRef(0);

  // Kiểm tra token admin
  const isAdmin = Boolean(localStorage.getItem('phimhay247_admin_token'));

  // Khởi tạo nickname & avatar từ localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('phimhay247_chat_name');
    const savedAvatar = localStorage.getItem('phimhay247_chat_avatar') || '🦁';
    const savedColor = localStorage.getItem('phimhay247_chat_color') || '#2563eb';
    const savedCustomUrl = localStorage.getItem('phimhay247_chat_custom_avatar') || '';

    setAvatar(savedAvatar);
    setAvatarColor(savedColor);
    setCustomAvatarUrl(savedCustomUrl);

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

  // Tải tin nhắn từ server và đồng bộ với bộ nhớ đệm 7 ngày của trình duyệt
  const loadMessages = async () => {
    try {
      const now = Date.now();

      // Đọc tin nhắn đã lưu trong trình duyệt
      let localCache: ChatMessage[] = [];
      try {
        const cachedRaw = localStorage.getItem('phimhay247_chat_cached_messages');
        if (cachedRaw) {
          localCache = JSON.parse(cachedRaw);
        }
      } catch {}

      // Lọc bỏ tin nhắn quá 7 ngày
      localCache = localCache.filter((m) => {
        const t = new Date(m.createdAt).getTime();
        return !isNaN(t) && now - t < SEVEN_DAYS_MS;
      });

      // Lấy tin nhắn từ server
      const res = await fetchChatMessages(80);
      const serverMsgs = res.messages || [];

      if (res.onlineCount) {
        setOnlineCount(res.onlineCount);
      }

      // Hợp nhất tin nhắn server và cache cục bộ (chống mất tin khi server Render khởi động lại)
      const msgMap = new Map<string, ChatMessage>();
      localCache.forEach((m) => msgMap.set(m.id, m));
      serverMsgs.forEach((m) => msgMap.set(m.id, m));

      const merged = Array.from(msgMap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(merged);
      localStorage.setItem('phimhay247_chat_cached_messages', JSON.stringify(merged.slice(-150)));

      if (!isOpen && merged.length > lastMsgCountRef.current && lastMsgCountRef.current > 0) {
        setUnreadCount((prev) => prev + (merged.length - lastMsgCountRef.current));
      }
      lastMsgCountRef.current = merged.length;
    } catch (err) {
      console.debug('Lỗi tải tin nhắn chat:', err);
    }
  };

  // Polling tin nhắn: 3.5s/lần khi mở, 15s/lần khi đóng
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

  // Mở modal sửa hồ sơ
  const handleOpenProfileModal = () => {
    setTempName(nickname);
    setTempAvatar(avatar);
    setTempColor(avatarColor);
    setTempAvatarUrl(customAvatarUrl);
    setShowProfileModal(true);
  };

  // Lưu hồ sơ biệt danh & avatar
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      const trimmedName = tempName.trim().slice(0, 25);
      setNickname(trimmedName);
      setAvatar(tempAvatar);
      setAvatarColor(tempColor);
      setCustomAvatarUrl(tempAvatarUrl.trim());

      localStorage.setItem('phimhay247_chat_name', trimmedName);
      localStorage.setItem('phimhay247_chat_avatar', tempAvatar);
      localStorage.setItem('phimhay247_chat_color', tempColor);
      localStorage.setItem('phimhay247_chat_custom_avatar', tempAvatarUrl.trim());

      setShowProfileModal(false);
    }
  };

  // Gửi tin nhắn mới
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const activeAvatar = customAvatarUrl.trim() || avatar;
      const newMsg = await sendChatMessage({
        senderName: nickname,
        content: content.trim(),
        senderBadge: isAdmin ? 'Admin' : 'Hội viên',
        avatar: activeAvatar,
        avatarColor: avatarColor,
      });

      setMessages((prev) => {
        const next = [...prev, newMsg];
        try {
          localStorage.setItem('phimhay247_chat_cached_messages', JSON.stringify(next.slice(-150)));
        } catch {}
        return next;
      });

      setContent('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    } finally {
      setSending(false);
    }
  };

  // Xóa tin nhắn (Admin)
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này không?')) return;
    try {
      await deleteChatMessage(id);
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        try {
          localStorage.setItem('phimhay247_chat_cached_messages', JSON.stringify(updated));
        } catch {}
        return updated;
      });
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
      {/* Nút bấm nổi mở Kênh Chat */}
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-black/40 text-green-300 border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              {onlineCount} trực tuyến
            </span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-red-600 rounded-full animate-bounce">
                +{unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] sm:w-[410px] h-[550px] max-h-[88vh] bg-cinema-900/95 backdrop-blur-xl border border-cinema-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-cinema-950 via-cinema-900 to-cinema-950 border-b border-cinema-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Kênh Chat Khán Giả</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-green-950/80 text-green-400 border border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {onlineCount} trực tuyến
                  </span>
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span>Bạn: </span>
                  <button
                    onClick={handleOpenProfileModal}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold group transition"
                    title="Bấm để đổi Biệt danh & Avatar"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white shadow"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {customAvatarUrl ? '🖼️' : avatar}
                    </span>
                    <span className="truncate max-w-[110px]">{nickname}</span>
                    <span className="text-[10px] text-gray-400 group-hover:text-amber-300">✏️</span>
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

          {/* Thanh thông báo tin nhắn lưu 7 ngày */}
          <div className="px-3.5 py-1.5 bg-cinema-950/90 border-b border-cinema-800 text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span>Tin nhắn tự động lưu và biến mất sau 7 ngày</span>
            </span>
            <button
              onClick={handleOpenProfileModal}
              className="text-[10px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Đổi Avatar</span>
            </button>
          </div>

          {/* Cửa sổ Popup Cài Đặt Biệt Danh & Avatar */}
          {showProfileModal && (
            <div className="absolute inset-0 z-20 bg-cinema-950/95 backdrop-blur-md p-4 flex flex-col justify-between animate-fadeIn overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-cinema-800 pb-2.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cài Đặt Biệt Danh &amp; Avatar</span>
                  </h4>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-cinema-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Khung xem trước hình ảnh */}
                <div className="p-3 rounded-xl bg-cinema-900 border border-cinema-800 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white/20 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: tempColor }}
                  >
                    {tempAvatarUrl.trim() ? (
                      <img
                        src={tempAvatarUrl.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      tempAvatar
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block text-[11px]">Xem trước hiển thị:</span>
                    <span className="font-bold text-white text-sm">
                      {tempName.trim() || 'Hội viên ẩn danh'}
                    </span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      {isAdmin ? 'Admin' : 'Hội viên'}
                    </span>
                  </div>
                </div>

                {/* Nhập Biệt danh */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Biệt Danh Của Bạn
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="VD: Tiểu Long Nữ, Mọt Phim 247, Vô Kỵ..."
                    maxLength={25}
                    className="w-full px-3 py-2 bg-cinema-850 border border-cinema-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>

                {/* Chọn Avatar phong cách phim */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                    <span>Chọn Avatar Nhân Vật</span>
                    <span className="text-[10px] text-gray-500">1-chạm chọn nhanh</span>
                  </label>
                  <div className="grid grid-cols-8 gap-1.5 bg-cinema-850 p-2 rounded-xl border border-cinema-700">
                    {AVATAR_PRESETS.map((p) => {
                      const isSelected = tempAvatar === p.icon && !tempAvatarUrl.trim();
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setTempAvatar(p.icon);
                            setTempAvatarUrl('');
                          }}
                          title={p.label}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition ${
                            isSelected
                              ? 'bg-amber-500 text-white ring-2 ring-amber-400 scale-110'
                              : 'hover:bg-cinema-700 text-gray-300 hover:scale-105'
                          }`}
                        >
                          {p.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hoặc nhập link ảnh riêng */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-gray-400" />
                    <span>Hoặc dán Link Ảnh Đại Diện Của Bạn (Tùy chọn):</span>
                  </label>
                  <input
                    type="url"
                    value={tempAvatarUrl}
                    onChange={(e) => setTempAvatarUrl(e.target.value)}
                    placeholder="https://... link ảnh jpg/png"
                    className="w-full px-3 py-1.5 bg-cinema-850 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                {/* Chọn Màu Nền Avatar */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-400" />
                    <span>Màu Nền Đại Diện</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTempColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition transform flex items-center justify-center ${
                          tempColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-110'
                        }`}
                      >
                        {tempColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nút bấm lưu */}
              <div className="pt-4 border-t border-cinema-800 flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-grow py-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-bold rounded-xl hover:from-red-500 hover:to-amber-400 transition shadow-lg shadow-red-950/50"
                >
                  Lưu Biệt Danh &amp; Avatar
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 bg-cinema-800 text-gray-300 text-xs font-semibold rounded-xl hover:bg-cinema-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Danh Sách Tin Nhắn */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cinema-700">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10 space-y-2">
                <MessageCircle className="w-10 h-10 text-cinema-700" />
                <p className="text-xs">Chưa có tin nhắn nào trong 7 ngày gần đây.</p>
                <p className="text-[11px] text-gray-500">Hãy là người đầu tiên gửi lời chào tới mọi người!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === nickname;
                const isMsgAdmin = msg.senderBadge === 'Admin';
                const hasImgUrl = msg.avatar && (msg.avatar.startsWith('http://') || msg.avatar.startsWith('https://'));

                return (
                  <div key={msg.id} className="group flex items-start gap-2.5 text-xs animate-fadeIn">
                    {/* Avatar người gửi */}
                    {hasImgUrl ? (
                      <img
                        src={msg.avatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 shadow border border-cinema-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow text-white select-none"
                        style={{
                          backgroundColor:
                            msg.avatarColor || (isMsgAdmin ? '#dc2626' : '#2563eb'),
                        }}
                      >
                        {msg.avatar || msg.senderName.substring(0, 1).toUpperCase()}
                      </div>
                    )}

                    {/* Khung nội dung tin nhắn */}
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
