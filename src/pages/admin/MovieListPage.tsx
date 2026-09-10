import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Film,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { fetchMovies, deleteMovie, toggleMovieHidden } from '../../services/api';
import { Movie } from '../../types';

export const MovieListPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadMovies = () => {
    setLoading(true);
    fetchMovies({ includeHidden: true, sort: 'updated' })
      .then(setMovies)
      .catch((err) => console.error('Lỗi tải danh sách phim admin:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleToggleHidden = async (id: string) => {
    try {
      const updated = await toggleMovieHidden(id);
      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, hidden: updated.hidden } : m)));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái ẩn/hiện của phim.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Lỗi khi xóa phim.');
    }
  };

  const filtered = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cinema-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Quản Lý Phim ({movies.length})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Thêm, sửa, xóa, ẩn/hiện phim và chuyển tới quản lý từng tập
          </p>
        </div>

        <Link
          to="/admin/movies/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-950"
        >
          <PlusCircle className="w-4 h-4" />
          Thêm Phim Mới
        </Link>
      </div>

      {/* Search Input Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên phim hoặc slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-cinema-900 border border-cinema-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs text-gray-400">Đang tải danh sách phim...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-cinema-900/40 rounded-2xl border border-cinema-800 p-8">
          <Film className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Không có bộ phim nào</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">Hãy nhấn "Thêm Phim Mới" để bắt đầu cập nhật.</p>
          <Link
            to="/admin/movies/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            Thêm phim ngay
          </Link>
        </div>
      ) : (
        <div className="bg-cinema-900 rounded-2xl border border-cinema-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cinema-800 bg-cinema-950/60 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Poster / Tên phim</th>
                  <th className="py-3.5 px-4">Thể loại & Năm</th>
                  <th className="py-3.5 px-4">Số tập</th>
                  <th className="py-3.5 px-4">Lượt xem</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-800/60 text-gray-200">
                {filtered.map((movie) => (
                  <tr
                    key={movie.id}
                    className={`hover:bg-cinema-850/60 transition ${movie.hidden ? 'opacity-50' : ''}`}
                  >
                    {/* Poster + Tên */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg bg-cinema-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm line-clamp-1 hover:text-primary">
                            {movie.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono block">
                            /{movie.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Thể loại & Năm */}
                    <td className="py-3 px-4">
                      <span className="line-clamp-1">{movie.category.join(', ')}</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">Năm {movie.year}</span>
                    </td>

                    {/* Số tập */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>{movie.episodeCount || 0} tập</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        Tập mới: {movie.latestEpisode || 0}
                      </span>
                    </td>

                    {/* Lượt xem */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gold inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {(movie.viewCount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          movie.status === 'Hoàn thành'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                            : 'bg-blue-950/70 text-blue-400 border border-blue-800/50'
                        }`}
                      >
                        {movie.status}
                      </span>
                      {movie.hidden && (
                        <span className="inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                          Đã ẩn
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nút Quản lý tập phim */}
                        <Link
                          to={`/admin/movies/${movie.id}/episodes`}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition font-medium text-[11px] border border-red-500/30"
                          title="Quản lý danh sách tập phim"
                        >
                          Quản lý tập
                        </Link>

                        {/* Nút Xem ngoài web */}
                        <Link
                          to={`/phim/${movie.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 hover:text-white transition"
                          title="Xem trên website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Nút Ẩn/Hiện */}
                        <button
                          onClick={() => handleToggleHidden(movie.id)}
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 hover:text-white transition"
                          title={movie.hidden ? 'Hiện phim' : 'Ẩn phim khỏi website'}
                        >
                          {movie.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Nút Sửa */}
                        <Link
                          to={`/admin/movies/${movie.id}/edit`}
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-300 hover:text-white transition"
                          title="Chỉnh sửa thông tin phim"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Nút Xóa */}
                        <button
                          onClick={() => setDeleteConfirmId(movie.id)}
                          className="p-1.5 rounded-lg bg-cinema-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition"
                          title="Xóa bộ phim này"
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
        </div>
      )}

      {/* Modal xác nhận xóa phim */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-cinema-900 border border-cinema-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Xác nhận xóa phim?</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Thao tác này sẽ xóa vĩnh viễn bộ phim và <strong>toàn bộ các tập</strong> liên quan. Bạn có chắc chắn muốn xóa?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-cinema-800 text-gray-300 text-xs font-semibold hover:bg-cinema-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-950"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
