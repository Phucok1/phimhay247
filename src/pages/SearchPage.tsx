import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Loader2 } from 'lucide-react';
import { fetchMovies } from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/common/MovieCard';
import { SEOHead } from '../components/common/SEOHead';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputVal(query);
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    fetchMovies({ search: query.trim(), includeHidden: false })
      .then((data) => setMovies(data))
      .catch((err) => console.error('Lỗi tìm kiếm phim:', err))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <>
      <SEOHead
        title={`Kết quả tìm kiếm: "${query}" | PHIM HAY 247`}
        description={`Tìm kiếm phim "${query}" trên PHIM HAY 247. Xem phim nhanh chóng, tuyển chọn từ YouTube.`}
      />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header Form */}
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Tìm Kiếm Phim
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-gray-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập tên phim, thể loại hoặc từ khóa..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-cinema-900 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary shadow-xl text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-md"
            >
              Tìm kiếm
            </button>
          </form>

          {query && (
            <p className="mt-3 text-xs text-gray-400">
              Kết quả tìm kiếm cho: <span className="text-red-400 font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Đang tìm kiếm...</p>
          </div>
        ) : movies.length > 0 ? (
          <div>
            <div className="mb-4 text-xs text-gray-400">
              Tìm thấy <span className="text-white font-semibold">{movies.length}</span> kết quả
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-16 bg-cinema-900/40 rounded-2xl border border-cinema-800 p-8 max-w-md mx-auto">
            <Film className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Không tìm thấy phim phù hợp</h3>
            <p className="text-gray-400 text-xs mb-4">
              Vui lòng thử lại với từ khóa ngắn hơn hoặc kiểm tra chính tả tên phim.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
};
