import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Eye, Calendar, Film, Search, ArrowRight, Share2, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { fetchMovieBySlug, fetchPublicSettings } from '../services/api';
import { Movie, Episode } from '../types';
import { SEOHead } from '../components/common/SEOHead';
import { MovieCard } from '../components/common/MovieCard';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<(Movie & { episodes: Episode[]; related: Movie[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safeMode, setSafeMode] = useState(false);

  // Search & Pagination cho danh sách tập
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const EPISODES_PER_GROUP = 50;

  useEffect(() => {
    fetchPublicSettings()
      .then((s) => setSafeMode(Boolean(s.adSenseSafeMode)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetchMovieBySlug(slug)
      .then((data) => {
        setMovie(data);
      })
      .catch((err) => {
        console.error('Lỗi tải chi tiết phim:', err);
        setError('Không tìm thấy bộ phim này hoặc phim đã bị gỡ bỏ.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || 'Không tìm thấy bộ phim'}</h2>
        <p className="text-gray-400 text-sm mb-6">Bộ phim bạn tìm kiếm không tồn tại hoặc đã bị ẩn.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium text-sm transition"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  // Sắp xếp danh sách tập theo thứ tự tăng dần
  const sortedEpisodes = [...(movie.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);
  const episodes = sortedEpisodes;
  const totalEpisodesCount = sortedEpisodes.length;

  // Lọc tập theo ô tìm kiếm nếu có
  const filteredEpisodes = episodeSearch.trim()
    ? sortedEpisodes.filter((ep) =>
        ep.episodeNumber.toString().includes(episodeSearch.trim()) ||
        ep.title.toLowerCase().includes(episodeSearch.toLowerCase())
      )
    : sortedEpisodes;

  // Phân nhóm tập an toàn dựa trên số lượng tập thực tế
  const groupCount = Math.max(1, Math.ceil(totalEpisodesCount / EPISODES_PER_GROUP));
  const groups = Array.from({ length: groupCount }, (_, idx) => {
    const chunk = sortedEpisodes.slice(idx * EPISODES_PER_GROUP, (idx + 1) * EPISODES_PER_GROUP);
    const startEp = chunk[0]?.episodeNumber ?? (idx * EPISODES_PER_GROUP + 1);
    const endEp = chunk[chunk.length - 1]?.episodeNumber ?? ((idx + 1) * EPISODES_PER_GROUP);
    return { label: `${startEp} - ${endEp}`, index: idx };
  });

  // Episodes trong nhóm hiện tại (khi không search)
  const displayedEpisodes = episodeSearch.trim()
    ? filteredEpisodes
    : sortedEpisodes.slice(
        selectedGroupIndex * EPISODES_PER_GROUP,
        (selectedGroupIndex + 1) * EPISODES_PER_GROUP
      );

  const latestEpisodeNum = movie.latestEpisode || (sortedEpisodes.length > 0 ? sortedEpisodes[sortedEpisodes.length - 1].episodeNumber : 1);
  const firstEpisodeNum = sortedEpisodes.length > 0 ? sortedEpisodes[0].episodeNumber : 1;

  // Schema.org Movie Structured Data
  const movieSchema = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.description,
    image: movie.posterUrl,
    dateCreated: movie.year?.toString(),
    genre: movie.category,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      ratingCount: Math.max(movie.viewCount || 10, 10),
    },
  };

  return (
    <>
      <SEOHead
        title={movie.seoTitle || `${movie.title} - Xem Phim Trọn Bộ HD`}
        description={movie.seoDescription || movie.description}
        keywords={movie.keywords}
        poster={movie.posterUrl}
        slug={movie.slug}
        type="video.movie"
        schema={movieSchema}
      />

      {/* Backdrop Header */}
      <div className="relative pt-20 md:pt-24 pb-12 overflow-hidden">
        {/* Backdrop background mờ ảo */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter blur-3xl opacity-20 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cinema-950/80 via-cinema-950 to-cinema-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster Card (Cột trái) */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
              <div className="relative w-56 sm:w-64 md:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-cinema-700/80 group">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-xs font-bold text-white rounded-md bg-red-600 shadow-md">
                    {movie.status === 'Hoàn thành' ? 'Trọn bộ' : `Tập ${movie.latestEpisode || 0}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons dưới poster */}
              <div className="w-full mt-5 space-y-2.5">
                {/* Nút Đọc Truyện Chữ Nguyên Tác */}
                <Link
                  to={`/truyen/${movie.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700/80 to-amber-700/80 hover:from-red-600 hover:to-amber-600 text-gold hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md border border-gold/30 hover:scale-[1.02]"
                >
                  <BookOpen className="w-4 h-4 text-gold" />
                  Đọc Truyện Chữ Nguyên Tác
                </Link>

                {sortedEpisodes.length > 0 ? (
                  <Link
                    to={`/phim/${movie.slug}/tap-${latestEpisodeNum}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-950 hover:scale-[1.02]"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    {safeMode ? `Xem Phân Tích (Tập ${latestEpisodeNum})` : `XEM TẬP MỚI NHẤT (${latestEpisodeNum})`}
                  </Link>
                ) : (
                  <div className="w-full py-3 text-center rounded-xl bg-cinema-800 text-gray-400 text-xs">
                    Phim đang cập nhật danh sách tập
                  </div>
                )}

                {sortedEpisodes.length > 0 && (
                  <Link
                    to={`/phim/${movie.slug}/tap-${firstEpisodeNum}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cinema-800/80 hover:bg-cinema-700 text-gray-200 font-semibold text-xs transition border border-cinema-700/60"
                  >
                    {safeMode ? `Xem từ phân đoạn ${firstEpisodeNum}` : `Xem từ tập ${firstEpisodeNum}`}
                  </Link>
                )}
              </div>
            </div>

            {/* Thông tin chi tiết (Cột phải) */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {movie.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-md bg-cinema-800 text-xs font-medium text-gray-300 border border-cinema-700/40"
                    >
                      {cat}
                    </span>
                  ))}
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      movie.status === 'Hoàn thành'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                    }`}
                  >
                    {movie.status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {movie.title}
                </h1>
              </div>

              {/* Thông số metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-cinema-800 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 block text-[11px]">Trạng thái</span>
                  <span className="font-semibold text-gray-200">{movie.status}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Năm phát hành</span>
                  <span className="font-semibold text-gray-200">{movie.year || 'Đang cập nhật'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Tổng số tập</span>
                  <span className="font-semibold text-gray-200">{movie.episodeCount || episodes.length} tập</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Lượt xem</span>
                  <span className="font-semibold text-gold inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {(movie.viewCount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Nội dung tóm tắt */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Nội dung phim</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-cinema-900/50 p-4 rounded-xl border border-cinema-800/60">
                  {movie.description || 'Nội dung bộ phim đang được cập nhật thêm...'}
                </p>
              </div>

              {/* Danh sách tập phim */}
              <div className="pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {safeMode ? `DANH MỤC HỒI / PHÂN ĐOẠN (${episodes.length})` : `DANH SÁCH TẬP (${episodes.length})`}
                    </h3>
                  </div>

                  {/* Ô tìm kiếm tập */}
                  <div className="relative w-44 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={episodeSearch}
                      onChange={(e) => setEpisodeSearch(e.target.value)}
                      placeholder="Tìm số tập..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-cinema-900 border border-cinema-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Nhóm phân trang tập (Ví dụ: 1-50, 51-100) */}
                {!episodeSearch.trim() && groups.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
                    {groups.map((grp) => (
                      <button
                        key={grp.label}
                        onClick={() => setSelectedGroupIndex(grp.index)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          selectedGroupIndex === grp.index
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-cinema-900 hover:bg-cinema-800 text-gray-400 hover:text-white border border-cinema-800'
                        }`}
                      >
                        Tập {grp.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid các tập */}
                {displayedEpisodes.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {displayedEpisodes.map((ep) => (
                      <Link
                        key={ep.id}
                        to={`/phim/${movie.slug}/tap-${ep.episodeNumber}`}
                        className="group flex flex-col items-center justify-center p-2 rounded-lg bg-cinema-900 hover:bg-red-600 border border-cinema-800 hover:border-red-500 text-gray-300 hover:text-white transition shadow-sm text-center"
                        title={ep.title}
                      >
                        <span className="text-xs font-bold">{ep.episodeNumber}</span>
                        <span className="text-[10px] opacity-70 group-hover:opacity-100 line-clamp-1">
                          Tập {ep.episodeNumber}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs bg-cinema-900/40 rounded-xl border border-cinema-800">
                    {episodeSearch.trim()
                      ? `Không tìm thấy tập phim nào khớp với "${episodeSearch}"`
                      : 'Chưa có tập nào được thêm cho bộ phim này.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phim có thể bạn thích (Phim liên quan) */}
      {movie.related && movie.related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-cinema-800">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              PHIM CÓ THỂ BẠN THÍCH
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.related.map((relMovie) => (
              <MovieCard key={relMovie.id} movie={relMovie} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
