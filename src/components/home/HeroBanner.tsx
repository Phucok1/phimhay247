import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Eye, Sparkles } from 'lucide-react';
import { Movie } from '../../types';

interface HeroBannerProps {
  movie?: Movie;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  if (!movie) {
    return (
      <div className="relative w-full h-[450px] md:h-[550px] bg-gradient-to-br from-cinema-900 via-cinema-950 to-black flex items-center justify-center text-center p-6 rounded-2xl border border-cinema-800">
        <div className="max-w-xl space-y-3">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-red-600/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Chào mừng đến với PHIM HAY 247
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            Thưởng Thức Phim Tuyển Chọn
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Tổng hợp và tuyển chọn những bộ phim kiếm hiệp, tiên hiệp, cổ trang đặc sắc nhất phát trực tiếp từ YouTube.
          </p>
        </div>
      </div>
    );
  }

  const bgImage = movie.bannerUrl || movie.posterUrl;
  const playUrl = movie.latestEpisode > 0 ? `/phim/${movie.slug}/tap-1` : `/phim/${movie.slug}`;

  return (
    <div className="relative w-full h-[480px] md:h-[580px] rounded-2xl md:rounded-3xl overflow-hidden border border-cinema-800 shadow-2xl mb-8 group">
      {/* Background Image with Cinematic Overlay */}
      <img
        src={bgImage}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-1000"
      />

      {/* Dark vignette gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/80 to-transparent w-full md:w-3/4" />

      {/* Hero Content */}
      <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-2xl z-10 flex flex-col items-start space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-red-600 text-white shadow-md">
            Phim Nổi Bật
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cinema-800/80 text-gray-200 border border-cinema-700/60">
            {movie.status === 'Hoàn thành' ? `Trọn bộ ${movie.episodeCount} tập` : `Đang cập nhật tập ${movie.latestEpisode || 0}`}
          </span>
          {movie.year && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-black/40 text-gray-300">
              Năm {movie.year}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
          {movie.title}
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 leading-relaxed max-w-xl">
          {movie.description || 'Theo dõi hành trình đầy kịch tính và cảm xúc trong tác phẩm hấp dẫn này.'}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          {movie.category.map((c) => (
            <span key={c} className="px-2 py-0.5 rounded bg-cinema-800/60 text-gray-300">
              {c}
            </span>
          ))}
          {movie.viewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-gold px-2 py-0.5">
              <Eye className="w-3.5 h-3.5" />
              {movie.viewCount.toLocaleString()} lượt xem
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to={playUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/50 hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            Xem ngay
          </Link>
          <Link
            to={`/phim/${movie.slug}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cinema-800/80 hover:bg-cinema-700/80 text-gray-200 hover:text-white font-semibold text-sm border border-cinema-700/60 transition"
          >
            <Info className="w-4 h-4" />
            Chi tiết phim
          </Link>
        </div>
      </div>
    </div>
  );
};
