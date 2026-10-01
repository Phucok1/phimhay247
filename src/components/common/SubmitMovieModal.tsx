import React, { useState } from 'react';
import { X, Crown, Video, Sparkles, CheckCircle2, AlertTriangle, Link as LinkIcon, Film } from 'lucide-react';
import { submitMemberMovie } from '../../services/api';

interface SubmitMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SubmitMovieModal: React.FC<SubmitMovieModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorContact, setContributorContact] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Phim Hội Viên', 'Hành Động']);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categoryOptions = [
    'Phim Hội Viên',
    'Hành Động',
    'Võ Thuật',
    'Tiên Hiệp',
    'Kiếm Hiệp',
    'Hoạt Hình 3D',
    'Tình Cảm',
    'Kinh Dị',
    'Hài Hước',
  ];

  const toggleCategory = (cat: string) => {
    if (cat === 'Phim Hội Viên') return; // Luôn giữ thể loại Phim Hội Viên
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Phát hiện nhanh nền tảng link video để người dùng an tâm
  const detectPlatform = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube Video';
    if (u.includes('facebook.com') || u.includes('fb.watch')) return 'Facebook Reel / Video';
    if (u.includes('ok.ru')) return 'Ok.ru (32GB Không giới hạn)';
    if (u.includes('drive.google.com')) return 'Google Drive';
    if (u.includes('dood') || u.includes('ds2play')) return 'DoodStream';
    if (u.includes('streamwish')) return 'StreamWish';
    if (u.includes('.mp4') || u.includes('.m3u8')) return 'Direct Video (MP4/HLS)';
    return null;
  };

  const platformInfo = videoUrl ? detectPlatform(videoUrl) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên phim.');
      return;
    }
    if (!contributorName.trim()) {
      setErrorMessage('Vui lòng nhập tên người chia sẻ / hội viên.');
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMessage('Vui lòng dán link video (YouTube, Ok.ru, Facebook Reel, Drive...).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      await submitMemberMovie({
        title: title.trim(),
        contributorName: contributorName.trim(),
        contributorContact: contributorContact.trim(),
        videoUrl: videoUrl.trim(),
        posterUrl: posterUrl.trim(),
        description: description.trim(),
        category: selectedCategories,
      });

      setSuccess(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setVideoUrl('');
        setPosterUrl('');
        setDescription('');
        onClose();
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Có lỗi xảy ra khi gửi phim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cinema-900 border border-cinema-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cinema-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-cinema-950/60 to-cinema-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Chia Sẻ Phim Hội Viên
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cộng đồng
                </span>
              </h3>
              <p className="text-xs text-gray-400">Đóng góp bộ phim yêu thích của bạn cho cộng đồng Phim Hay 247</p>
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
          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Gửi đóng góp thành công!</h4>
              <p className="text-sm text-gray-300 max-w-md mx-auto">
                Cảm ơn <strong>{contributorName}</strong>! Phim sẽ được Admin kiểm duyệt và đưa lên mục{' '}
                <span className="text-amber-400 font-semibold">Phim Hội Viên</span> trong thời gian sớm nhất.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tên phim */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Tên bộ phim <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Phàm Nhân Tu Tiên, Đấu La Đại Lục..."
                    className="w-full pl-9 pr-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  <Film className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Thông tin người chia sẻ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tên người chia sẻ / Nickname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="VD: Hội viên Minh Tuấn"
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Liên hệ (Zalo / Facebook)
                  </label>
                  <input
                    type="text"
                    value={contributorContact}
                    onChange={(e) => setContributorContact(e.target.value)}
                    placeholder="Để BQT trao đổi khi cần"
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Link Video */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Đường dẫn video tập 1 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Dán link YouTube, Facebook Reels, Ok.ru, Drive, MP4..."
                    className="w-full pl-9 pr-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {platformInfo && (
                  <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hệ thống nhận diện nguồn: <strong>{platformInfo}</strong></span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">
                  Hỗ trợ: YouTube, Facebook Reels, Ok.ru (không giới hạn dung lượng), Google Drive, DoodStream, StreamWish, Direct MP4.
                </p>
              </div>

              {/* Poster URL */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Link ảnh bìa / Poster (Không bắt buộc)
                </label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://... (nếu để trống hệ thống sẽ lấy ảnh từ video)"
                  className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Thể loại */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Thể loại liên quan
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-semibold'
                            : 'bg-cinema-800/40 border-cinema-700/60 text-gray-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Giới thiệu tóm tắt */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Giới thiệu tóm tắt nội dung
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Vài dòng cảm nhận hoặc tóm tắt sơ lược về phim..."
                  className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Actions */}
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold text-sm hover:from-amber-500 hover:to-amber-400 transition shadow-lg shadow-amber-600/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Gửi Phim Duyệt Ngay</span>
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
