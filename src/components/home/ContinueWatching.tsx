import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, History, X } from 'lucide-react';
import { getWatchHistory, removeWatchHistoryItem } from '../../services/history';
import { WatchHistoryItem } from '../../types';

export const ContinueWatching: React.FC = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  const handleRemove = (e: React.MouseEvent, movieId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = removeWatchHistoryItem(movieId);
    setHistory(updated);
  };

  if (history.length === 0) return null;

  return (
    <section className="mb-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-red-500" />
          <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
            XEM TIẾP
          </h2>
        </div>
        <span className="text-xs text-gray-400">Lịch sử xem gần đây của bạn</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {history.slice(0, 6).map((item) => (
          <div
            key={item.movieId}
            className="group relative rounded-xl overflow-hidden bg-cinema-900 border border-cinema-800 hover:border-primary/50 transition-all shadow-md flex flex-col"
          >
            <Link
              to={`/phim/${item.movieSlug}/tap-${item.episodeNumber}`}
              className="relative w-full aspect-[16/10] overflow-hidden bg-cinema-850"
            >
              <img
                src={item.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                alt={item.movieTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>

              {/* Progress bar hint */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-cinema-800">
                <div className="h-full bg-primary w-3/4" />
              </div>
            </Link>

            {/* Xóa khỏi lịch sử */}
            <button
              onClick={(e) => handleRemove(e, item.movieId)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white transition z-10"
              title="Xóa khỏi lịch sử"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="p-2.5 flex flex-col flex-grow justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-200 group-hover:text-primary transition line-clamp-1">
                  {item.movieTitle}
                </h4>
                <p className="text-[11px] text-red-400 font-medium mt-0.5">
                  Đang xem tập {item.episodeNumber}
                </p>
              </div>

              <Link
                to={`/phim/${item.movieSlug}/tap-${item.episodeNumber}`}
                className="mt-2 w-full py-1 text-center rounded bg-cinema-800 hover:bg-cinema-700 text-gray-200 text-[11px] font-medium transition"
              >
                Xem tiếp →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
