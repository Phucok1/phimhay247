import React, { useState } from 'react';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Link as LinkIcon,
  Film,
  Plus,
  Trash2,
  ListPlus,
  FileText,
  Layers,
} from 'lucide-react';
import { submitMemberMovie } from '../../services/api';

interface SubmitMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface EpisodeInputItem {
  episodeNumber: number;
  title: string;
  videoUrl: string;
}

export const SubmitMovieModal: React.FC<SubmitMovieModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorContact, setContributorContact] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Phim Hội Viên', 'Hành Động']);

  // Quản lý danh sách tập phim (giống công cụ Admin)
  const [inputMode, setInputMode] = useState<'list' | 'bulk'>('list');
  const [episodes, setEpisodes] = useState<EpisodeInputItem[]>([
    { episodeNumber: 1, title: 'Tập 1', videoUrl: '' },
  ]);
  const [bulkText, setBulkText] = useState('');

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
    if (cat === 'Phim Hội Viên') return;
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Nhận diện nền tảng video
  const detectPlatform = (url: string) => {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.includes('terabox') || u.includes('1024tera') || u.includes('freeterabox') || u.includes('terasharelink')) return 'TeraBox (1TB)';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
    if (u.includes('facebook.com') || u.includes('fb.watch')) return 'Facebook Reels';
    if (u.includes('ok.ru')) return 'Ok.ru (32GB)';
    if (u.includes('drive.google.com')) return 'Google Drive';
    if (u.includes('t.me') || u.includes('telegram.me')) return 'Telegram';
    if (u.includes('dood') || u.includes('ds2play')) return 'DoodStream';
    if (u.includes('streamwish')) return 'StreamWish';
    if (u.includes('.mp4') || u.includes('.m3u8')) return 'Direct MP4/HLS';
    return 'Video Link';
  };

  // Thêm 1 tập mới
  const handleAddEpisode = () => {
    const nextNum = episodes.length + 1;
    setEpisodes((prev) => [
      ...prev,
      { episodeNumber: nextNum, title: `Tập ${nextNum}`, videoUrl: '' },
    ]);
  };

  // Xóa 1 tập
  const handleRemoveEpisode = (index: number) => {
    if (episodes.length <= 1) return;
    setEpisodes((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Tự động đánh số lại
      return filtered.map((ep, idx) => ({
        ...ep,
        episodeNumber: idx + 1,
        title: ep.title.startsWith('Tập ') ? `Tập ${idx + 1}` : ep.title,
      }));
    });
  };

  // Cập nhật giá trị 1 tập
  const handleUpdateEpisode = (index: number, field: keyof EpisodeInputItem, value: any) => {
    setEpisodes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Phân tích danh sách link hàng loạt
  const handleParseBulk = () => {
    setErrorMessage(null);
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setErrorMessage('Vui lòng dán ít nhất 1 đường link video.');
      return;
    }

    const parsed: EpisodeInputItem[] = lines.map((url, idx) => ({
      episodeNumber: idx + 1,
      title: `Tập ${idx + 1}`,
      videoUrl: url,
    }));

    setEpisodes(parsed);
    setInputMode('list');
    setBulkText('');
  };

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

    // Lọc các tập có link
    const validEpisodes = episodes
      .map((ep, idx) => ({
        episodeNumber: idx + 1,
        title: ep.title?.trim() || `Tập ${idx + 1}`,
        videoUrl: ep.videoUrl?.trim() || '',
      }))
      .filter((ep) => Boolean(ep.videoUrl));

    if (validEpisodes.length === 0) {
      setErrorMessage('Vui lòng dán link video cho ít nhất 1 tập phim (YouTube, Ok.ru, Facebook Reels, Drive...).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await submitMemberMovie({
        title: title.trim(),
        contributorName: contributorName.trim(),
        contributorContact: contributorContact.trim(),
        videoUrl: validEpisodes[0].videoUrl,
        episodes: validEpisodes,
        posterUrl: posterUrl.trim(),
        description: description.trim(),
        category: selectedCategories,
      });

      setSuccess(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setEpisodes([{ episodeNumber: 1, title: 'Tập 1', videoUrl: '' }]);
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
      <div className="bg-cinema-900 border border-cinema-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cinema-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-cinema-950/60 to-cinema-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Chia Sẻ Phim Hội Viên (Nhiều Tập)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cộng đồng
                </span>
              </h3>
              <p className="text-xs text-gray-400">Đóng góp bộ phim với danh sách Tập 1, Tập 2... cho cộng đồng</p>
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
                Cảm ơn <strong>{contributorName}</strong>! Bộ phim gồm{' '}
                <strong className="text-amber-400">{episodes.filter((e) => e.videoUrl.trim()).length} tập</strong> đã
                được gửi tới Admin để kiểm duyệt xuất bản lên mục{' '}
                <span className="text-amber-400 font-semibold">Phim Hội Viên</span> sớm nhất.
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

              {/* KHỐI QUẢN LÝ DANH SÁCH TẬP PHIM (GIỐNG BÊN ADMIN) */}
              <div className="p-4 rounded-xl bg-cinema-950 border border-cinema-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cinema-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Danh Sách Các Tập Phim
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {episodes.length} tập
                    </span>
                  </div>

                  {/* Chuyển đổi giữa 2 chế độ: Nhập từng tập hoặc Dán hàng loạt */}
                  <div className="flex items-center gap-1 bg-cinema-900 p-0.5 rounded-lg border border-cinema-700">
                    <button
                      type="button"
                      onClick={() => setInputMode('list')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                        inputMode === 'list'
                          ? 'bg-amber-500 text-white font-semibold shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Nhập từng tập</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('bulk')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                        inputMode === 'bulk'
                          ? 'bg-amber-500 text-white font-semibold shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dán hàng loạt</span>
                    </button>
                  </div>
                </div>

                {/* Chế độ 1: Nhập từng tập */}
                {inputMode === 'list' && (
                  <div className="space-y-2.5">
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-cinema-700">
                      {episodes.map((ep, idx) => {
                        const plat = detectPlatform(ep.videoUrl);
                        return (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-cinema-900 border border-cinema-800"
                          >
                            {/* Số tập / Tiêu đề */}
                            <div className="w-full sm:w-28 flex-shrink-0">
                              <input
                                type="text"
                                value={ep.title}
                                onChange={(e) => handleUpdateEpisode(idx, 'title', e.target.value)}
                                placeholder={`Tập ${idx + 1}`}
                                className="w-full px-2.5 py-1.5 bg-cinema-850 border border-cinema-700 rounded-lg text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 text-center"
                              />
                            </div>

                            {/* Link Video */}
                            <div className="flex-grow relative">
                              <input
                                type="url"
                                required
                                value={ep.videoUrl}
                                onChange={(e) => handleUpdateEpisode(idx, 'videoUrl', e.target.value)}
                                placeholder="Dán link TeraBox, YouTube, Ok.ru, FB Reels, Drive..."
                                className="w-full pl-7 pr-24 py-1.5 bg-cinema-850 border border-cinema-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
                              />
                              <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-2" />
                              {plat && (
                                <span className="absolute right-2 top-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cinema-800 text-amber-300 border border-cinema-700">
                                  {plat}
                                </span>
                              )}
                            </div>

                            {/* Nút xóa tập */}
                            {episodes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEpisode(idx)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition self-end sm:self-center"
                                title="Xóa tập này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEpisode}
                      className="w-full py-2 border-2 border-dashed border-cinema-700 hover:border-amber-500/60 rounded-xl text-xs font-semibold text-gray-300 hover:text-amber-300 flex items-center justify-center gap-1.5 transition bg-cinema-900/50"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Thêm Tập Tiếp Theo (Tập {episodes.length + 1})</span>
                    </button>
                  </div>
                )}

                {/* Chế độ 2: Dán danh sách hàng loạt (giống Bulk Import bên Admin) */}
                {inputMode === 'bulk' && (
                  <div className="space-y-2.5 animate-fadeIn">
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Dán danh sách link video vào ô dưới đây (<strong>mỗi dòng là 1 tập</strong>). Hệ thống sẽ tự động tạo danh sách <em>Tập 1, Tập 2, Tập 3...</em> hệt như công cụ quản trị của Admin!
                    </p>
                    <textarea
                      rows={5}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`https://terabox.com/s/xxx (Tập 1)\nhttps://www.youtube.com/watch?v=yyy (Tập 2)\nhttps://ok.ru/video/zzz (Tập 3)`}
                      className="w-full p-3 bg-cinema-850 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleParseBulk}
                        disabled={!bulkText.trim()}
                        className="flex-grow py-2 bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold text-xs rounded-xl transition shadow disabled:opacity-40"
                      >
                        ⚡ Phân Tích &amp; Tự Động Tạo Danh Sách Tập
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('list')}
                        className="px-4 py-2 bg-cinema-800 text-gray-300 hover:text-white text-xs rounded-xl"
                      >
                        Quay lại
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Hỗ trợ: TeraBox (1000GB), YouTube, FB Reels, Ok.ru, Telegram, Drive...</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Không giới hạn số tập
                  </span>
                </div>
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
                  placeholder="https://... (nếu để trống hệ thống sẽ tự lấy ảnh từ video tập 1)"
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
                            ? 'bg-amber-500 text-cinema-950 font-bold border-amber-400 shadow-sm'
                            : 'bg-cinema-950 text-gray-300 border-cinema-700 hover:border-gray-500'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mô tả phim */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Mô tả / Tóm tắt nội dung (Không bắt buộc)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu sơ lược về bộ phim để người xem dễ theo dõi..."
                  className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-cinema-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-cinema-800 text-gray-300 hover:text-white rounded-xl text-sm transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-cinema-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-950/40 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span>Đang gửi...</span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 fill-cinema-950" />
                      <span>
                        Gửi Phim ({episodes.filter((e) => e.videoUrl.trim()).length || 1} tập)
                      </span>
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
