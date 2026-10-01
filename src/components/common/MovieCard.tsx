import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Film, Crown } from 'lucide-react';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  showCategory?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showCategory = false }) => {
  const [imageError, setImageError] = useState(false);

  // Ảnh poster mặc định nếu lỗi hoặc chưa có
  const defaultPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80';
  const posterSrc = imageError || !movie.posterUrl ? defaultPoster : movie.posterUrl;

  const episodeBadgeText =
    movie.status === 'Hoàn thành'
      ? `Full (${movie.episodeCount || 0} tập)`
      : movie.latestEpisode > 0
      ? `Tập ${movie.latestEpisode}`
      : 'Sắp chiếu';

  return (
    <Link
      to={`/phim/${movie.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-cinema-900 border border-cinema-800/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 hover:-translate-y-1"
    >
      {/* Poster 2:3 container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-cinema-850">
        <img
          src={posterSrc}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Lớp phủ gradient nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Badge tập phim nổi bật góc trên trái */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="px-2 py-0.5 text-xs font-bold text-white rounded bg-red-600/90 backdrop-blur-md shadow-md">
            {episodeBadgeText}
          </span>
          {movie.contributorName && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 rounded bg-black/80 border border-amber-500/40 backdrop-blur-md shadow">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[85px]">{movie.contributorName}</span>
            </span>
          )}
          {movie.year && !movie.contributorName && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 rounded bg-black/60 backdrop-blur-sm self-start">
              {movie.year}
            </span>
          )}
        </div>

        {/* Badge trạng thái hoặc lượt xem góc trên phải */}
        <div className="absolute top-2.5 right-2.5">
          {movie.viewCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-200 bg-black/60 backdrop-blur-sm rounded">
              <Eye className="w-3 h-3 text-gold" />
              {movie.viewCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Hover Action Overlay: Nút Play nổi bật */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Thông tin bên dưới */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-100 group-hover:text-primary transition-colors line-clamp-1 leading-snug">
          {movie.title}
        </h3>

        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
          <span className="line-clamp-1">
            {movie.category && movie.category.length > 0 ? movie.category.slice(0, 2).join(', ') : 'Phim Bộ'}
          </span>
          <span
            className={`text-[11px] font-medium ${
              movie.status === 'Hoàn thành'
                ? 'text-emerald-400'
                : movie.status === 'Tạm dừng'
                ? 'text-amber-400'
                : 'text-blue-400'
            }`}
          >
            {movie.status}
          </span>
        </div>
      </div>
    </Link>
  );
};
