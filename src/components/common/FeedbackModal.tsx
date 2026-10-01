import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle, Send, CheckCircle2, Film } from 'lucide-react';
import { sendFeedback } from '../../services/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMovieTitle?: string;
  defaultEpisodeNumber?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultMovieTitle = '',
  defaultEpisodeNumber,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [type, setType] = useState('Báo lỗi tập phim');
  const [movieTitle, setMovieTitle] = useState(defaultMovieTitle);
  const [episodeNumber, setEpisodeNumber] = useState<string>(
    defaultEpisodeNumber ? String(defaultEpisodeNumber) : ''
  );
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Vui lòng nhập nội dung góp ý hoặc mô tả lỗi.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const res = await sendFeedback({
        name: name.trim() || 'Khán giả ẩn danh',
        contact: contact.trim(),
        type,
        movieTitle: movieTitle.trim(),
        episodeNumber: episodeNumber ? Number(episodeNumber) : undefined,
        content: content.trim(),
      });

      setSuccessMessage(res.message || 'Cảm ơn bạn! Phản hồi đã được gửi đến ban quản trị.');
      setTimeout(() => {
        setSuccessMessage(null);
        setContent('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cinema-900 border border-cinema-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cinema-800 flex items-center justify-between bg-cinema-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Góp ý & Báo lỗi</h3>
              <p className="text-xs text-gray-400">Giúp Phim Hay 247 hoàn thiện và phục vụ bạn tốt hơn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-cinema-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successMessage ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Gửi phản hồi thành công!</h4>
              <p className="text-sm text-gray-300 max-w-sm mx-auto">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Loại phản hồi */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Loại phản hồi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    'Báo lỗi tập phim',
                    'Yêu cầu phim',
                    'Góp ý tính năng',
                    'Khác',
                  ].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition ${
                        type === t
                          ? 'bg-red-600 border-red-500 text-white font-bold shadow-md'
                          : 'bg-cinema-800/60 border-cinema-700/60 text-gray-400 hover:text-white hover:bg-cinema-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tên phim & tập nếu liên quan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tên phim (nếu có)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="VD: Lưu Ly Kiếm Tông"
                      className="w-full pl-9 pr-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <Film className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tập số (nếu có)
                  </label>
                  <input
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                    placeholder="VD: 5"
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Thông tin người gửi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tên của bạn
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A (hoặc để trống)"
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Liên hệ (Zalo/SĐT/FB)
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Để BQT phản hồi khi cần"
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể lỗi gặp phải (vd: tập 3 bị mất tiếng, link dự phòng không chạy...) hoặc góp ý của bạn..."
                  className="w-full px-3 py-2.5 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Nút gửi */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-cinema-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium text-sm hover:from-red-500 hover:to-red-400 transition shadow-lg shadow-red-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi phản hồi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
