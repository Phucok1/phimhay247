import React, { useState } from 'react';
import { X, Check, AlertCircle, Loader2, Youtube, ExternalLink, HelpCircle } from 'lucide-react';
import { fetchYouTubePlaylist, createBulkEpisodes } from '../../services/api';

interface PlaylistImportModalProps {
  movieId: string;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlaylistEpisodeItem {
  selected: boolean;
  episodeNumber: number;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
  thumbnailUrl: string;
}

export const PlaylistImportModal: React.FC<PlaylistImportModalProps> = ({
  movieId,
  movieTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needApiKey, setNeedApiKey] = useState(false);
  const [episodes, setEpisodes] = useState<PlaylistEpisodeItem[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  const handleFetchPlaylist = async () => {
    if (!playlistUrl.trim()) {
      setError('Vui lòng nhập link YouTube Playlist.');
      return;
    }

    setLoading(true);
    setError(null);
    setNeedApiKey(false);

    try {
      const res = await fetchYouTubePlaylist(playlistUrl.trim());
      if (res.needApiKey) {
        setNeedApiKey(true);
        setError(res.error || 'Chưa có YouTube API Key.');
      } else if (res.success && res.data) {
        setEpisodes(res.data.episodes);
        setStep('preview');
      } else {
        setError(res.error || 'Không thể lấy video từ Playlist.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi kết nối khi lấy Playlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectAll = (select: boolean) => {
    setEpisodes((prev) => prev.map((ep) => ({ ...ep, selected: select })));
  };

  const handleToggleSelect = (idx: number) => {
    setEpisodes((prev) => {
      const updated = [...prev];
      updated[idx].selected = !updated[idx].selected;
      return updated;
    });
  };

  const handleUpdateEpisode = (idx: number, field: keyof PlaylistEpisodeItem, val: any) => {
    setEpisodes((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleImport = async () => {
    const selectedEpisodes = episodes.filter((ep) => ep.selected);
    if (selectedEpisodes.length === 0) {
      setError('Vui lòng chọn ít nhất 1 tập để import.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await createBulkEpisodes(movieId, selectedEpisodes);
      if (res.importedCount > 0) {
        onSuccess();
        onClose();
      } else {
        setError('Không thể import các tập đã chọn.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi lưu các tập từ Playlist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-cinema-900 border border-cinema-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cinema-800 bg-cinema-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
              Nhập Từ YouTube Playlist
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Phim: <span className="text-red-400 font-semibold">{movieTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-cinema-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1 flex-grow">
              <span>{error}</span>
              {needApiKey && (
                <div className="mt-2 pt-2 border-t border-red-800/50 text-[11px] text-gray-300 space-y-1">
                  <p className="font-semibold text-white">Cách lấy YouTube Data API v3 miễn phí:</p>
                  <p>1. Truy cập <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google Cloud Console</a>.</p>
                  <p>2. Bật dịch vụ <strong>YouTube Data API v3</strong> và tạo Credentials API Key.</p>
                  <p>3. Dán API Key vào mục <strong>Admin &gt; Cài đặt &amp; API</strong>.</p>
                  <p className="text-gray-400">Hoặc bạn có thể dùng ngay nút <strong>"Nhập nhiều tập"</strong> dán link trực tiếp mà không cần cấu hình API key.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 flex-grow overflow-y-auto space-y-4 text-xs">
          {step === 'input' ? (
            <div className="space-y-4 max-w-xl mx-auto py-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
                  <Youtube className="w-6 h-6 fill-current" />
                </div>
                <h4 className="text-base font-bold text-white">Nhập Link Danh Sách Phát YouTube</h4>
                <p className="text-gray-400 text-xs">
                  Dán liên kết Playlist trên kênh YouTube của bạn để nạp toàn bộ danh sách tập tự động
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PL..."
                  className="w-full px-4 py-3 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
                />
                <span className="text-[11px] text-gray-500 block">
                  Ví dụ: <code className="text-gray-400">https://www.youtube.com/playlist?list=PL1234567890</code>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-cinema-950 p-3 rounded-xl border border-cinema-800">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 font-semibold">
                    Đã tải <span className="text-red-400 font-bold">{episodes.length}</span> video
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(true)}
                      className="text-xs px-2.5 py-1 rounded bg-cinema-800 text-gray-300 hover:text-white"
                    >
                      Chọn tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(false)}
                      className="text-xs px-2.5 py-1 rounded bg-cinema-800 text-gray-300 hover:text-white"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <span className="text-xs text-emerald-400 font-medium">
                  Đã chọn: {episodes.filter((e) => e.selected).length} tập
                </span>
              </div>

              {/* Danh sách các video trong playlist */}
              <div className="border border-cinema-800 rounded-xl overflow-hidden divide-y divide-cinema-800 max-h-96 overflow-y-auto">
                {episodes.map((ep, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center gap-3 transition ${
                      ep.selected ? 'bg-cinema-850 hover:bg-cinema-800/60' : 'bg-cinema-950/40 opacity-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={ep.selected}
                      onChange={() => handleToggleSelect(idx)}
                      className="w-4 h-4 rounded text-red-600 bg-cinema-800 border-cinema-700"
                    />

                    <img
                      src={ep.thumbnailUrl}
                      alt={ep.title}
                      className="w-16 h-10 object-cover rounded bg-cinema-800 flex-shrink-0"
                    />

                    <div className="w-16 flex-shrink-0">
                      <label className="text-[10px] text-gray-400 block">Số tập</label>
                      <input
                        type="number"
                        value={ep.episodeNumber}
                        onChange={(e) =>
                          handleUpdateEpisode(idx, 'episodeNumber', Number(e.target.value))
                        }
                        className="w-full px-1.5 py-1 rounded bg-cinema-900 border border-cinema-700 text-white text-xs text-center font-bold"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <label className="text-[10px] text-gray-400 block">Tiêu đề tập</label>
                      <input
                        type="text"
                        value={ep.title}
                        onChange={(e) => handleUpdateEpisode(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-cinema-900 border border-cinema-700 text-white text-xs"
                      />
                    </div>

                    <a
                      href={ep.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-red-400 transition flex-shrink-0"
                      title="Xem video trên YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cinema-800 bg-cinema-950/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-300 text-xs font-semibold"
          >
            Hủy bỏ
          </button>

          {step === 'input' ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleFetchPlaylist}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-950 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang quét Playlist...
                </>
              ) : (
                'Quét danh sách video'
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || episodes.filter((e) => e.selected).length === 0}
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg shadow-red-950 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang Import...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  IMPORT ({episodes.filter((e) => e.selected).length} tập)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
