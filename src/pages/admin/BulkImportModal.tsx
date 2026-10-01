import React, { useState } from 'react';
import { X, Check, AlertCircle, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { createBulkEpisodes } from '../../services/api';

interface BulkImportModalProps {
  movieId: string;
  movieTitle: string;
  nextEpisodeNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedBulkItem {
  episodeNumber: number;
  title: string;
  youtubeUrl: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  movieId,
  movieTitle,
  nextEpisodeNumber,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rawText, setRawText] = useState('');
  const [items, setItems] = useState<ParsedBulkItem[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Phân tích danh sách link
  const handleParseLinks = () => {
    setError(null);
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError('Vui lòng dán ít nhất 1 link YouTube.');
      return;
    }

    let startNum = nextEpisodeNumber > 0 ? nextEpisodeNumber : 1;
    const parsed: ParsedBulkItem[] = lines.map((url, idx) => {
      const epNum = startNum + idx;
      return {
        episodeNumber: epNum,
        title: `Tập ${epNum}`,
        youtubeUrl: url,
      };
    });

    setItems(parsed);
    setStep('preview');
  };

  const handleUpdateItem = (index: number, field: keyof ParsedBulkItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBulk = async () => {
    if (items.length === 0) {
      setError('Không có tập nào để lưu.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await createBulkEpisodes(movieId, items);
      if (res.importedCount > 0) {
        onSuccess();
        onClose();
      } else {
        setError('Không có tập nào được thêm. Vui lòng kiểm tra lại link.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi lưu nhiều tập.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-cinema-900 border border-cinema-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-cinema-800 bg-cinema-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Nhập Nhiều Tập Hàng Loạt
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
          <div className="m-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 flex-grow overflow-y-auto space-y-4 text-xs">
          {step === 'input' ? (
            <div className="space-y-3">
              <p className="text-gray-300">
                Dán danh sách các đường link video vào ô dưới đây (mỗi link nằm trên một dòng riêng biệt). Hệ thống sẽ tự động phân loại nguồn phát và đánh số tập tiếp theo:
              </p>

              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://www.facebook.com/reel/123456789\nhttps://doodstream.com/d/abc123xyz\nhttps://streamwish.to/def456uvw\nhttps://example.com/video.mp4\n...`}
                className="w-full p-3.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:border-primary"
              />

              <div className="p-3 bg-cinema-950/80 rounded-xl border border-cinema-800/80 text-gray-400 space-y-1">
                <p className="font-semibold text-gray-300">Hỗ trợ các nền tảng video:</p>
                <p>• <strong>TeraBox Cloud:</strong> terabox.com, 1024tera.com (1024GB đám mây miễn phí)</p>
                <p>• <strong>Ok.ru:</strong> Mạng xã hội Nga (Dung lượng không giới hạn, 32GB/file, không bản quyền)</p>
                <p>• <strong>Google Drive:</strong> drive.google.com (15GB/acc, tốc độ cực nhanh)</p>
                <p>• <strong>Telegram:</strong> t.me/kênh/id (Video từ kênh công khai)</p>
                <p>• <strong>YouTube:</strong> watch, youtu.be, shorts, live</p>
                <p>• <strong>Facebook:</strong> Reels, Watch video, fb.watch</p>
                <p>• <strong>Khác:</strong> DoodStream, StreamWish, Dailymotion, link trực tiếp .MP4 / .M3U8</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-medium">
                  Đã nhận diện <span className="text-primary font-bold">{items.length}</span> tập. Bạn có thể chỉnh sửa lại số tập và tiêu đề trước khi lưu:
                </p>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  ← Dán lại danh sách khác
                </button>
              </div>

              <div className="border border-cinema-800 rounded-xl overflow-hidden divide-y divide-cinema-800 max-h-96 overflow-y-auto">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-cinema-850 flex items-center gap-3 hover:bg-cinema-800/50 transition"
                  >
                    <div className="w-20">
                      <label className="text-[10px] text-gray-400 block">Số tập</label>
                      <input
                        type="number"
                        value={item.episodeNumber}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'episodeNumber', Number(e.target.value))
                        }
                        className="w-full px-2 py-1 rounded bg-cinema-900 border border-cinema-700 text-white text-xs text-center font-bold"
                      />
                    </div>

                    <div className="w-36 sm:w-48">
                      <label className="text-[10px] text-gray-400 block">Tiêu đề</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-cinema-900 border border-cinema-700 text-white text-xs"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <label className="text-[10px] text-gray-400 block">YouTube URL</label>
                      <input
                        type="text"
                        value={item.youtubeUrl}
                        onChange={(e) => handleUpdateItem(idx, 'youtubeUrl', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-cinema-900 border border-cinema-700 text-gray-300 font-mono text-[11px] truncate"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 transition"
                      title="Xóa tập này khỏi danh sách import"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
              onClick={handleParseLinks}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-red-950"
            >
              Tiếp tục kiểm tra ({rawText.split('\n').filter((l) => l.trim()).length} link)
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || items.length === 0}
              onClick={handleSaveBulk}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg shadow-red-950 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu {items.length} tập...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Lưu toàn bộ {items.length} tập
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
