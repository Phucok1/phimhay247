import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, PlaySquare, Eye, PlusCircle, Sparkles, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { fetchDashboardStats } from '../../services/api';
import { DashboardStats } from '../../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Lỗi tải thống kê dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-gray-400 text-xs">Đang nạp dữ liệu thống kê...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số phim',
      value: stats?.totalMovies || 0,
      icon: Film,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      link: '/admin/movies',
    },
    {
      title: 'Tổng số tập phim',
      value: stats?.totalEpisodes || 0,
      icon: PlaySquare,
      color: 'from-red-600 to-amber-600',
      textColor: 'text-red-400',
      link: '/admin/movies',
    },
    {
      title: 'Tổng lượt xem toàn trang',
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cinema-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Tổng Quan
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Theo dõi tình trạng kho phim, số tập và lượt xem từ YouTube
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-950"
          >
            <PlusCircle className="w-4 h-4" />
            Thêm Phim Mới
          </Link>
        </div>
      </div>

      {/* 3 Thẻ Thống Kê Số Liệu Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-400 font-medium">{c.title}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{c.value}</h3>
                {c.link && (
                  <Link to={c.link} className={`mt-2 inline-block text-[11px] font-semibold ${c.textColor} hover:underline`}>
                    Xem chi tiết →
                  </Link>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid 2 cột: Phim xem nhiều nhất & Phim mới thêm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phim Xem Nhiều Nhất */}
        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Top Phim Xem Nhiều Nhất
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.topMovies && stats.topMovies.length > 0 ? (
              stats.topMovies.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-850 border border-cinema-800/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-bold text-xs text-gray-500">#{idx + 1}</span>
                    <img
                      src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                      alt={m.title}
                      className="w-9 h-12 object-cover rounded-lg bg-cinema-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/movies/${m.id}/episodes`}
                        className="text-xs font-semibold text-gray-200 hover:text-primary transition line-clamp-1"
                      >
                        {m.title}
                      </Link>
                      <span className="text-[11px] text-gray-400 block">{m.episodeCount} tập</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-gold inline-flex items-center gap-1 flex-shrink-0 ml-2">
                    <Eye className="w-3.5 h-3.5" />
                    {m.viewCount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">Chưa có dữ liệu lượt xem</p>
            )}
          </div>
        </div>

        {/* Phim Mới Thêm Gần Đây */}
        <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Phim Mới Thêm Gần Đây
              </h3>
            </div>
            <Link to="/admin/movies" className="text-xs text-red-400 hover:underline">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentMovies && stats.recentMovies.length > 0 ? (
              stats.recentMovies.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-850 border border-cinema-800/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                      alt={m.title}
                      className="w-9 h-12 object-cover rounded-lg bg-cinema-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/movies/${m.id}/episodes`}
                        className="text-xs font-semibold text-gray-200 hover:text-primary transition line-clamp-1"
                      >
                        {m.title}
                      </Link>
                      <span className="text-[11px] text-gray-400 block">
                        {m.category.slice(0, 2).join(', ')} • {m.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/movies/${m.id}/episodes`}
                    className="px-2.5 py-1 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-[11px] text-gray-300 font-medium transition flex-shrink-0 ml-2"
                  >
                    Quản lý tập
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">Chưa có phim nào trong hệ thống</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
