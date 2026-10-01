import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Layers,
  Youtube,
  Trash2,
  Edit,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Save,
  X,
} from 'lucide-react';
import {
  fetchMovies,
  fetchEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  parseYouTubeLink,
} from '../../services/api';
import { Movie, Episode } from '../../types';
import { BulkImportModal } from './BulkImportModal';
import { PlaylistImportModal } from './PlaylistImportModal';

export const EpisodeListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bulkOpen, setBulkOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  // Form Thêm nhanh 1 tập
  const [showAddForm, setShowAddForm] = useState(false);
  const [epNum, setEpNum] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epYoutubeUrl, setEpYoutubeUrl] = useState('');
  const [customThumbnail, setCustomThumbnail] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
  } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [savingEp, setSavingEp] = useState(false);

  // State sửa tập
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const allMovies = await fetchMovies({ includeHidden: true });
      const currentMovie = allMovies.find((m) => m.id === id);
      if (currentMovie) {
        setMovie(currentMovie);
      }
      const eps = await fetchEpisodes(id);
      setEpisodes(eps);
      // Gợi ý số tập tiếp theo
      if (eps.length > 0) {
        const maxEp = Math.max(...eps.map((e) => e.episodeNumber));
        setEpNum(maxEp + 1);
        setEpTitle(`Tập ${maxEp + 1}`);
      } else {
        setEpNum(1);
        setEpTitle('Tập 1');
      }
    } catch (err) {
      console.error('Lỗi tải danh sách tập:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Tự động parse Video ID khi paste link YouTube
  const handleYoutubeUrlChange = async (url: string) => {
    setEpYoutubeUrl(url);
    setParseError(null);

    if (!url.trim()) {
      setParsedPreview(null);
      return;
    }

    setParsing(true);
    try {
      const parsed = await parseYouTubeLink(url.trim());
      setParsedPreview(parsed);
      setParseError(null);
    } catch (err: any) {
      setParsedPreview(null);
      setParseError(err.response?.data?.error || 'Link YouTube không hợp lệ.');
    } finally {
      setParsing(false);
    }
  };

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !parsedPreview) return;

    setSavingEp(true);
    try {
      await createEpisode({
        movieId: id,
        episodeNumber: epNum,
        title: epTitle.trim() || `Tập ${epNum}`,
        youtubeUrl: epYoutubeUrl.trim(),
        customThumbnail: customThumbnail.trim() || undefined,
      });

      // Reset form và gợi ý tập tiếp theo để admin thêm liên tiếp chỉ mất vài giây
      setEpYoutubeUrl('');
      setParsedPreview(null);
      setCustomThumbnail('');
      const nextNum = epNum + 1;
      setEpNum(nextNum);
      setEpTitle(`Tập ${nextNum}`);

      // Nạp lại danh sách
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể lưu tập phim.');
    } finally {
      setSavingEp(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tập này?')) return;
    try {
      await deleteEpisode(episodeId);
      await loadData();
    } catch (err) {
      alert('Lỗi khi xóa tập.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode) return;

    try {
      await updateEpisode(editingEpisode.id, {
        episodeNumber: editingEpisode.episodeNumber,
        title: editingEpisode.title,
        youtubeUrl: editingEpisode.youtubeUrl,
      });
      setEditingEpisode(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật tập.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-gray-400">Đang tải thông tin tập phim...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Movie Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/admin/movies"
            className="p-2 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <img
            src={movie?.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
            alt={movie?.title}
            className="w-12 h-16 object-cover rounded-xl bg-cinema-800 shadow-md flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
              {movie?.title}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Tổng số tập: <strong className="text-red-400">{episodes.length}</strong> • Tập mới nhất: <strong className="text-white">{movie?.latestEpisode || 0}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-950"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Đóng Form Thêm Tập' : 'Thêm 1 Tập Nhanh'}
          </button>

          <button
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 hover:text-white text-xs font-semibold transition border border-cinema-700"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Nhập Nhiều Tập
          </button>

          <button
            onClick={() => setPlaylistOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 hover:text-white text-xs font-semibold transition border border-cinema-700"
          >
            <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
            Nhập Từ Playlist
          </button>
        </div>
      </div>

      {/* Form Thêm Nhanh 1 Tập */}
      {showAddForm && (
        <form
          onSubmit={handleCreateEpisode}
          className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-cinema-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-500" />
              Thêm Tập Mới Cho Phim
            </h3>
            <span className="text-[11px] text-gray-400">Chỉ cần dán link YouTube và lưu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Số tập */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Số tập</label>
              <input
                type="number"
                required
                value={epNum}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEpNum(val);
                  setEpTitle(`Tập ${val}`);
                }}
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs text-center font-bold focus:outline-none focus:border-primary"
              />
            </div>

            {/* Tiêu đề */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tiêu đề tập</label>
              <input
                type="text"
                required
                value={epTitle}
                onChange={(e) => setEpTitle(e.target.value)}
                placeholder="Ví dụ: Tập 22"
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Link YouTube / Facebook */}
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Link YouTube hoặc Facebook Reel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={epYoutubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                placeholder="YouTube (watch, youtu.be, shorts) hoặc Facebook (reel, watch)"
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Trạng thái parse link */}
          {parsing && (
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Đang kiểm tra và bóc tách YouTube Video ID...</span>
            </div>
          )}

          {parseError && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview sau khi bóc tách Video ID */}
          {parsedPreview && (
            <div className="p-4 rounded-xl bg-cinema-950 border border-cinema-800 flex flex-col md:flex-row items-start gap-4">
              {/* Preview Iframe hoặc thumbnail */}
              <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-cinema-700 bg-black flex-shrink-0">
                <img
                  src={parsedPreview.thumbnailUrl}
                  alt="YouTube thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white opacity-80" />
                </div>
              </div>

              <div className="text-xs space-y-1.5 flex-grow">
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Bóc tách thành công YouTube Video ID!
                </p>
                <p className="text-gray-300">
                  Video ID: <code className="text-amber-400 font-bold">{parsedPreview.videoId}</code>
                </p>
                <p className="text-gray-400 break-all text-[11px]">
                  Embed URL: <span>{parsedPreview.embedUrl}</span>
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-300 text-xs font-semibold"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={savingEp || !parsedPreview}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-950 disabled:opacity-50"
            >
              {savingEp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Lưu Tập Phim
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Danh sách tập đã đăng */}
      <div className="bg-cinema-900 rounded-2xl border border-cinema-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-cinema-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Danh Sách Tập Đã Đăng ({episodes.length})
          </h3>
          <span className="text-xs text-gray-400">Thứ tự tập 1, 2, 3...</span>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Chưa có tập nào. Bạn có thể bấm <strong>"Thêm 1 tập nhanh"</strong> hoặc <strong>"Nhập nhiều tập"</strong> ở trên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cinema-800 bg-cinema-950/60 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20 text-center">Số tập</th>
                  <th className="py-3 px-4">Thumbnail / Tiêu đề</th>
                  <th className="py-3 px-4">YouTube Video ID</th>
                  <th className="py-3 px-4">Lượt xem</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-800/60 text-gray-200">
                {episodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-cinema-850/60 transition">
                    {/* Số tập */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 font-bold text-xs">
                        Tập {ep.episodeNumber}
                      </span>
                    </td>

                    {/* Thumbnail + Tiêu đề */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ep.thumbnailUrl || `https://i.ytimg.com/vi/${ep.youtubeVideoId}/hqdefault.jpg`}
                          alt={ep.title}
                          className="w-16 h-10 object-cover rounded bg-cinema-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white text-xs line-clamp-1">{ep.title}</h4>
                          <a
                            href={ep.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-gray-400 hover:text-red-400 inline-flex items-center gap-1"
                          >
                            <span>Xem link gốc</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Video ID */}
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                      {ep.youtubeVideoId}
                    </td>

                    {/* Lượt xem */}
                    <td className="py-3 px-4 text-gold font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {(ep.viewCount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/phim/${movie?.slug}/tap-${ep.episodeNumber}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 hover:text-white transition"
                          title="Xem trên trang xem phim"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => setEditingEpisode(ep)}
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 hover:text-white transition"
                          title="Chỉnh sửa tập"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteEpisode(ep.id)}
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition"
                          title="Xóa tập này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Sửa Tập */}
      {editingEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <form
            onSubmit={handleSaveEdit}
            className="bg-cinema-900 border border-cinema-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-cinema-800">
              <h3 className="font-bold text-white text-sm">Chỉnh sửa tập phim</h3>
              <button
                type="button"
                onClick={() => setEditingEpisode(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Số tập</label>
              <input
                type="number"
                value={editingEpisode.episodeNumber}
                onChange={(e) =>
                  setEditingEpisode({ ...editingEpisode, episodeNumber: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={editingEpisode.title}
                onChange={(e) =>
                  setEditingEpisode({ ...editingEpisode, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Link YouTube</label>
              <input
                type="text"
                value={editingEpisode.youtubeUrl}
                onChange={(e) =>
                  setEditingEpisode({ ...editingEpisode, youtubeUrl: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingEpisode(null)}
                className="px-4 py-2 rounded-xl bg-cinema-800 text-gray-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals Nhập Nhiều Tập & Nhập Playlist */}
      <BulkImportModal
        movieId={id || ''}
        movieTitle={movie?.title || ''}
        nextEpisodeNumber={epNum}
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={loadData}
      />

      <PlaylistImportModal
        movieId={id || ''}
        movieTitle={movie?.title || ''}
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
