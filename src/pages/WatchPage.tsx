import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Eye,
  Calendar,
  AlertCircle,
  ExternalLink,
  Film,
  Sparkles,
  Share2,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { fetchMovieBySlug, recordView, fetchPublicSettings } from '../services/api';
import { saveWatchHistory } from '../services/history';
import { Movie, Episode } from '../types';
import { YouTubePlayer } from '../components/common/YouTubePlayer';
import { SEOHead } from '../components/common/SEOHead';
import { MovieCard } from '../components/common/MovieCard';
import { FeedbackModal } from '../components/common/FeedbackModal';

export const WatchPage: React.FC = () => {
  const { slug, episodeNumber } = useParams<{ slug: string; episodeNumber: string }>();
  const navigate = useNavigate();

  // Parse episode number từ param /tap-22 hoặc /tap-1
  const currentEpNum = parseInt((episodeNumber || '1').replace('tap-', ''), 10) || 1;

  const [movie, setMovie] = useState<(Movie & { episodes: Episode[]; related: Movie[] }) | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedServerIdx, setSelectedServerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    fetchPublicSettings()
      .then((s) => setSafeMode(Boolean(s.adSenseSafeMode)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedServerIdx(0);
  }, [slug, currentEpNum]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetchMovieBySlug(slug)
      .then((data) => {
        setMovie(data);
        const epList = [...(data.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);
        let ep = epList.find((e) => e.episodeNumber === currentEpNum);

        // Nếu không tìm thấy tập theo số truyền vào (ví dụ tap-1 mà phim bắt đầu từ tập 24)
        // tự động chọn tập đầu tiên khả dụng để người xem không bị báo lỗi mất tập
        if (!ep && epList.length > 0) {
          ep = epList[0];
        }

        if (ep) {
          setCurrentEpisode(ep);

          // Ghi nhận lượt xem (có chống spam IP/Session)
          recordView(data.id, ep.id);

          // Lưu lịch sử xem vào localStorage
          saveWatchHistory({
            movieId: data.id,
            movieTitle: data.title,
            movieSlug: data.slug,
            posterUrl: data.posterUrl,
            episodeNumber: ep.episodeNumber,
            episodeTitle: ep.title,
          });
        } else {
          setError(`Bộ phim này chưa có tập phim nào khả dụng.`);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải tập phim:', err);
        setError('Không tìm thấy tập phim hoặc đường link không hợp lệ.');
      })
      .finally(() => setLoading(false));
  }, [slug, currentEpNum]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Đang tải video tập {currentEpNum}...</p>
      </div>
    );
  }

  if (error || !movie || !currentEpisode) {
    return (
      <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 text-center">
        <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || 'Không tìm thấy tập phim'}</h2>
        <p className="text-gray-400 text-sm mb-6">Tập phim có thể chưa được cập nhật hoặc link đã thay đổi.</p>
        <div className="flex justify-center gap-3">
          <Link
            to={`/phim/${slug}`}
            className="px-4 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 text-sm"
          >
            Về trang thông tin phim
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const allEpisodes = [...(movie.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);
  const currentIdx = allEpisodes.findIndex((e) => e.episodeNumber === currentEpisode.episodeNumber);
  const prevEpisode = currentIdx > 0 ? allEpisodes[currentIdx - 1] : null;
  const nextEpisode = currentIdx < allEpisodes.length - 1 ? allEpisodes[currentIdx + 1] : null;

  // Schema.org VideoObject Structured Data
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${movie.title} - ${currentEpisode.title}`,
    description: movie.description,
    thumbnailUrl: [currentEpisode.thumbnailUrl || movie.posterUrl],
    uploadDate: currentEpisode.createdAt,
    embedUrl: currentEpisode.youtubeEmbedUrl,
  };

  return (
    <>
      <SEOHead
        title={`${movie.title} - Tập ${currentEpNum} | PHIM HAY 247`}
        description={`Xem phim ${movie.title} tập ${currentEpNum} trực tiếp full HD từ YouTube. ${movie.description?.slice(0, 120)}...`}
        keywords={`${movie.title}, tap ${currentEpNum}, xem phim online, ${movie.keywords}`}
        poster={currentEpisode.thumbnailUrl || movie.posterUrl}
        slug={movie.slug}
        episodeNumber={currentEpNum}
        type="video.episode"
        schema={videoSchema}
      />

      <div className="pt-20 md:pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 overflow-x-auto no-scrollbar py-1">
          <Link to="/" className="hover:text-white transition">Trang chủ</Link>
          <span>/</span>
          <Link to={`/the-loai/${movie.category[0] || 'kiem-hiep'}`} className="hover:text-white transition">
            {movie.category[0] || 'Phim Bộ'}
          </Link>
          <span>/</span>
          <Link to={`/phim/${movie.slug}`} className="hover:text-white transition line-clamp-1 max-w-[200px]">
            {movie.title}
          </Link>
          <span>/</span>
          <span className="text-red-400 font-semibold whitespace-nowrap">Tập {currentEpNum}</span>
        </div>

        {/* Nguồn Phát / Server (Nếu có link phụ từ nguồn khác) hoặc Safe Mode Review */}
        {safeMode ? (
          <div className="mb-6 p-6 sm:p-8 rounded-2xl bg-cinema-900 border border-cinema-800 text-left shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Chuyên Mục Tóm Tắt & Phân Tích Diễn Biến
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-cinema-800 text-gray-400 text-xs font-medium">
                Hồi / Tập {currentEpNum}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              {movie.title} - Phân tích diễn biến {currentEpisode.title || `Tập ${currentEpNum}`}
            </h2>

            <div className="text-gray-300 text-sm sm:text-base leading-relaxed space-y-4 mb-6">
              <p>
                {movie.description || 'Bộ phim chuyển thể từ danh tác văn học nổi tiếng, khắc họa những ân oán giang hồ và hành trình tu luyện đầy gian nan.'}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm italic border-l-2 border-primary/60 pl-3">
                "Phân đoạn này tập trung vào các tình tiết mấu chốt, bước ngoặt tư tưởng của nhân vật và những biến cố lớn tác động đến cục diện toàn bộ câu chuyện. Mời bạn đọc khám phá đầy đủ bản dịch nguyên tác chữ để nắm bắt trọn vẹn từng chi tiết tâm lý nhân vật."
              </p>
            </div>

            {/* Banner kêu gọi đọc tiểu thuyết nguyên tác */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-cinema-850 to-cinema-900 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Đọc Tiểu Thuyết Nguyên Tác Chữ</h4>
                  <p className="text-xs text-gray-400">Xem đầy đủ từng chương, chi tiết không bị cắt gọt</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to={`/truyen/${movie.slug}`}
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md shadow-red-950"
                >
                  Đọc truyện tác phẩm này →
                </Link>
                <Link
                  to="/truyen"
                  className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-300 text-xs font-semibold transition border border-cinema-700"
                >
                  Tủ Sách Truyện Chữ
                </Link>
              </div>
            </div>
          </div>
        ) : (
          (() => {
            const episodeServers = (currentEpisode.servers && currentEpisode.servers.length > 0)
              ? currentEpisode.servers
              : [
                  {
                    id: 'srv-main',
                    name: 'Server 1 (Chính)',
                    url: currentEpisode.youtubeUrl,
                    videoId: currentEpisode.youtubeVideoId,
                    embedUrl: currentEpisode.youtubeEmbedUrl,
                  }
                ];
            const activeServer = episodeServers[selectedServerIdx] || episodeServers[0];

            return (
              <>
                {episodeServers.length > 1 && (
                  <div className="mb-3.5 p-3 rounded-xl bg-cinema-900 border border-cinema-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Đổi Nguồn Phát (Server Dự Phòng):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {episodeServers.map((srv, idx) => {
                        const isActive = idx === selectedServerIdx;
                        return (
                          <button
                            key={srv.id || idx}
                            onClick={() => setSelectedServerIdx(idx)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-red-600 text-white shadow-md shadow-red-950 scale-105'
                                : 'bg-cinema-850 hover:bg-cinema-800 text-gray-300 hover:text-white border border-cinema-700/60'
                            }`}
                          >
                            <span>{srv.name || `Server ${idx + 1}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1. Video Player 16:9 (Đa Server: YouTube, Facebook, Ok.ru, Drive...) */}
                <div className="mb-6">
                  <YouTubePlayer
                    key={`${currentEpisode.id}-${selectedServerIdx}-${activeServer.url}`}
                    videoId={activeServer.videoId || currentEpisode.youtubeVideoId}
                    embedUrl={activeServer.embedUrl || currentEpisode.youtubeEmbedUrl}
                    watchUrl={activeServer.url || currentEpisode.youtubeUrl}
                    title={`${movie.title} - ${currentEpisode.title} (${activeServer.name || 'Server ' + (selectedServerIdx + 1)})`}
                  />
                </div>
              </>
            );
          })()
        )}

        {/* 2. Controls & Episode Navigation Bar */}
        <div className="p-4 rounded-2xl bg-cinema-900 border border-cinema-800 flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Tên phim & Tên tập */}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {movie.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="text-red-400 font-semibold text-sm">
                {currentEpisode.title || `Tập ${currentEpNum}`}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-gold">
                <Eye className="w-3.5 h-3.5" />
                {(currentEpisode.viewCount || 0).toLocaleString()} lượt xem
              </span>
              <Link
                to={`/truyen/${movie.slug}`}
                className="hidden sm:inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium ml-2"
                title="Đọc truyện chữ nguyên tác"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Đọc Truyện Chữ
              </Link>
            </div>
          </div>

          {/* Nút điều hướng [ ← Tập trước ] [ Tập tiếp → ] & Báo lỗi tập này */}
          <div className="flex items-center gap-2">
            <Link
              to={`/truyen/${movie.slug}`}
              className="inline-flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold transition border border-red-800/40"
              title="Đọc bản truyện chữ nguyên tác"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đọc truyện</span>
            </Link>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cinema-800/80 hover:bg-cinema-700 text-gray-300 hover:text-amber-400 text-xs font-semibold transition border border-cinema-700/60"
              title="Báo lỗi nếu video không xem được hoặc mất tiếng"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Báo lỗi</span>
            </button>

            {prevEpisode ? (
              <Link
                to={`/phim/${movie.slug}/tap-${prevEpisode.episodeNumber}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 text-xs font-semibold transition border border-cinema-700/60"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tập trước</span>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-900 text-gray-600 text-xs font-semibold cursor-not-allowed border border-cinema-800/40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Tập trước</span>
              </button>
            )}

            {nextEpisode ? (
              <Link
                to={`/phim/${movie.slug}/tap-${nextEpisode.episodeNumber}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-950"
              >
                <span>Tập tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-900 text-gray-600 text-xs font-semibold cursor-not-allowed border border-cinema-800/40"
              >
                <span>Tập tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Danh sách tập phim đầy đủ */}
        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-bold text-white tracking-wide">
                DANH SÁCH TẬP ({allEpisodes.length})
              </h3>
            </div>
            <Link
              to={`/phim/${movie.slug}`}
              className="text-xs text-gray-400 hover:text-white transition"
            >
              Thông tin chi tiết phim →
            </Link>
          </div>

          {/* Grid danh sách tập */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-72 overflow-y-auto pr-1">
            {allEpisodes.map((ep) => {
              const isCurrent = ep.episodeNumber === currentEpNum;
              return (
                <Link
                  key={ep.id}
                  to={`/phim/${movie.slug}/tap-${ep.episodeNumber}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition ${
                    isCurrent
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-900/50 scale-105'
                      : 'bg-cinema-850 hover:bg-cinema-800 text-gray-300 hover:text-white border border-cinema-800'
                  }`}
                  title={ep.title}
                >
                  <span className="text-xs">{ep.episodeNumber}</span>
                  <span className="text-[9px] opacity-75 line-clamp-1">Tập {ep.episodeNumber}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4. Tóm tắt nội dung */}
        <div className="p-5 rounded-2xl bg-cinema-900/50 border border-cinema-800/80 mb-10">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
            Về bộ phim {movie.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {movie.description}
          </p>
        </div>

        {/* 5. Phim có thể bạn thích (Phim liên quan) */}
        {movie.related && movie.related.length > 0 && (
          <section className="pt-6 border-t border-cinema-800">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                PHIM CÓ THỂ BẠN THÍCH
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {movie.related.map((relMovie) => (
                <MovieCard key={relMovie.id} movie={relMovie} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal báo lỗi tập phim */}
      {movie && currentEpisode && (
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          defaultMovieTitle={movie.title}
          defaultEpisodeNumber={currentEpNum}
        />
      )}
    </>
  );
};
