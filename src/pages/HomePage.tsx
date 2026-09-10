import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeroBanner } from '../components/home/HeroBanner';
import { ContinueWatching } from '../components/home/ContinueWatching';
import { FilterBar } from '../components/home/FilterBar';
import { MovieCard } from '../components/common/MovieCard';
import { SEOHead } from '../components/common/SEOHead';
import { fetchMovies, fetchCategories } from '../services/api';
import { Movie, Category } from '../types';
import { Flame, Film, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [featuredMovie, setFeaturedMovie] = useState<Movie | undefined>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const currentSort = (searchParams.get('sort') as any) || 'updated';
  const currentStatus = searchParams.get('status') || '';
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMovies({
      sort: currentSort,
      status: currentStatus || undefined,
      category: selectedCategory || undefined,
      includeHidden: false,
    })
      .then((data) => {
        setMovies(data);
        // Chọn phim nổi bật cho hero banner: ưu tiên phim featured hoặc phim có nhiều lượt xem/mới nhất
        const featured = data.find((m) => m.featured) || data[0];
        setFeaturedMovie(featured);
      })
      .catch((err) => console.error('Lỗi tải danh sách phim:', err))
      .finally(() => setLoading(false));
  }, [currentSort, currentStatus, selectedCategory]);

  const handleSortChange = (sort: 'updated' | 'views' | 'az' | 'newest' | 'episodes') => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  // Tách phim theo danh mục cho trang chủ nếu đang xem mặc định
  const isDefaultView = !currentStatus && !selectedCategory && currentSort === 'updated';
  const newUpdatedMovies = movies.slice(0, 12);
  const completedMovies = movies.filter((m) => m.status === 'Hoàn thành').slice(0, 6);
  const ongoingMovies = movies.filter((m) => m.status === 'Đang cập nhật').slice(0, 6);

  return (
    <>
      <SEOHead
        title="PHIM HAY 247 - Website Xem Phim Tuyển Chọn Từ YouTube"
        description="PHIM HAY 247 tổng hợp các bộ phim kiếm hiệp, cổ trang, ngôn tình chọn lọc phát trực tiếp từ YouTube channel @phimhay.momtiti. Xem mượt, chất lượng cao, miễn phí."
      />

      <div className="pt-20 md:pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* A. Hero Banner */}
        <HeroBanner movie={featuredMovie} />

        {/* Lịch sử xem tiếp */}
        <ContinueWatching />

        {/* Thanh lọc & sắp xếp */}
        <FilterBar
          currentSort={currentSort}
          onSortChange={handleSortChange}
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Đang tải danh sách phim...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 bg-cinema-900/60 rounded-2xl border border-cinema-800 p-8">
            <Film className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Chưa có bộ phim nào phù hợp</h3>
            <p className="text-gray-400 text-sm mb-4">
              Hãy thử chọn thể loại khác hoặc thêm phim mới trong trang Quản Trị.
            </p>
          </div>
        ) : isDefaultView ? (
          /* Hiển thị phân đoạn trang chủ mặc định */
          <div className="space-y-12">
            {/* B. Phim mới cập nhật */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    PHIM MỚI CẬP NHẬT
                  </h2>
                </div>
                <span className="text-xs text-gray-400">Tập mới phát hành</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {newUpdatedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>

            {/* C. Phim hoàn thành */}
            {completedMovies.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                      PHIM TRỌN BỘ HOÀN THÀNH
                    </h2>
                  </div>
                  <button
                    onClick={() => handleStatusChange('Hoàn thành')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {completedMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </section>
            )}

            {/* D. Phim đang cập nhật */}
            {ongoingMovies.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                      PHIM ĐANG CẬP NHẬT
                    </h2>
                  </div>
                  <button
                    onClick={() => handleStatusChange('Đang cập nhật')}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {ongoingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Grid phim khi người dùng lọc */
          <div>
            <div className="mb-4 text-sm text-gray-400">
              Hiển thị <span className="text-white font-semibold">{movies.length}</span> bộ phim phù hợp
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
