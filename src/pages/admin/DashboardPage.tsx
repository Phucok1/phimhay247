import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, PlaySquare, Eye, PlusCircle, Sparkles, TrendingUp, ExternalLink, Loader2, Users, Smartphone, Monitor } from 'lucide-react';
import { fetchDashboardStats } from '../../services/api';
import { DashboardStats } from '../../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => console.error('Lỗi tải thống kê dashboard:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
    // Tự động làm mới thống kê khách online mỗi 10 giây
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
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
      title: 'Khách thật online (Real-time)',
      value: `${stats?.realStats?.realCount || 0} người`,
      subText: `${stats?.realStats?.mobileCount || 0} mobile • ${stats?.realStats?.desktopCount || 0} PC`,
      icon: Users,
      color: 'from-emerald-600 to-green-600',
      textColor: 'text-emerald-400',
      isLive: true,
    },
    {
      title: 'Tổng lượt xem toàn trang',
      value: (stats?.totalViews || 0).toLocaleString(),
      subText: 'Lượt xem video thực tế',
      icon: Eye,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-400',
    },
    {
      title: 'Tổng số bộ phim',
      value: stats?.totalMovies || 0,
      subText: 'Phim admin + hội viên',
      icon: Film,
      color: 'from-blue-600 to-cyan-600',
      textColor: 'text-blue-400',
      link: '/admin/movies',
    },
    {
      title: 'Tổng số tập phim',
      value: stats?.totalEpisodes || 0,
      subText: 'Tập phát YouTube/Embed',
      icon: PlaySquare,
      color: 'from-red-600 to-amber-600',
      textColor: 'text-red-400',
      link: '/admin/movies',
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

      {/* 4 Thẻ Thống Kê Số Liệu Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl flex items-center justify-between group hover:border-cinema-700 transition"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  {c.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  <p className="text-xs text-gray-400 font-medium">{c.title}</p>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">{c.value}</h3>
                {c.subText && <p className="text-[11px] text-gray-500 mt-0.5">{c.subText}</p>}
                {c.link && (
                  <Link to={c.link} className={`mt-2 inline-block text-[11px] font-semibold ${c.textColor} hover:underline`}>
                    Xem chi tiết →
                  </Link>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg flex-shrink-0 ml-2`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Người Thật Đang Online */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cinema-900 to-cinema-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Khách Thật Đang Truy Cập Website (Thời Gian Thực):</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-black">
                {stats?.realStats?.realCount || 0} người thật
              </span>
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Thiết bị: <span className="text-emerald-300 font-semibold">{stats?.realStats?.mobileCount || 0} Điện thoại</span> • <span className="text-emerald-300 font-semibold">{stats?.realStats?.desktopCount || 0} Máy tính</span> (Tự động cập nhật trực tiếp)
            </p>
          </div>
        </div>
        <div className="text-[11px] text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/60 self-start sm:self-auto font-medium">
          ✓ 100% người thật không có số ảo
        </div>
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
