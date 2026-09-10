import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovies, fetchCategories } from '../services/api';
import { Movie, Category } from '../types';
import { MovieCard } from '../components/common/MovieCard';
import { SEOHead } from '../components/common/SEOHead';
import { FolderTree, Loader2, Film } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const found = categories.find((c) => c.slug === slug);
    if (found) {
      setCategoryName(found.name);
    } else {
      setCategoryName(slug.replace(/-/g, ' '));
    }

    fetchMovies({ category: slug, includeHidden: false })
      .then((data) => setMovies(data))
      .catch((err) => console.error('Lỗi tải phim theo thể loại:', err))
      .finally(() => setLoading(false));
  }, [slug, categories]);

  return (
    <>
      <SEOHead
        title={`Phim ${categoryName} Hay Nhất Tuyển Chọn | PHIM HAY 247`}
        description={`Tổng hợp danh sách các bộ phim thuộc thể loại ${categoryName} hấp dẫn, cập nhật tập mới nhanh nhất từ YouTube.`}
        keywords={`phim ${categoryName}, the loai ${categoryName}, xem phim online`}
      />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header danh mục */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cinema-900 to-cinema-950 border border-cinema-800">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <span>/</span>
            <span>Thể loại</span>
            <span>/</span>
            <span className="text-red-400 font-medium capitalize">{categoryName}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize">
                  Thể loại: {categoryName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Tuyển tập các bộ phim đặc sắc nhất
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1.5 rounded-full bg-cinema-800 text-gray-300">
              {movies.length} bộ phim
            </span>
          </div>
        </div>

        {/* Danh sách phim */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Đang tải danh sách phim...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 bg-cinema-900/60 rounded-2xl border border-cinema-800 p-8">
            <Film className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Chưa có phim thuộc thể loại này</h3>
            <p className="text-gray-400 text-sm mb-4">
              Hãy quay lại sau hoặc khám phá các thể loại phim khác.
            </p>
            <Link
              to="/"
              className="inline-flex px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
            >
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
