import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { fetchMovies } from '../../services/api';
import { Movie } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchMovies({ search: query.trim(), limit: 8 });
        setResults(data);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectMovie = (slug: string) => {
    onClose();
    navigate(`/phim/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-cinema-900 border border-cinema-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-cinema-800 px-4 py-3.5">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên phim, thể loại, từ khóa..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-cinema-800 text-gray-400 hover:text-white"
          >
            ESC
          </button>
        </form>

        {/* Results List */}
        <div className="flex-grow overflow-y-auto p-3 divide-y divide-cinema-800/50">
          {results.length > 0 ? (
            results.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie.slug)}
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-cinema-800/60 cursor-pointer transition"
              >
                <img
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=150'}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-cinema-850"
                />
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm font-semibold text-gray-100 hover:text-primary transition line-clamp-1">
                    {movie.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="text-red-400 font-medium">
                      {movie.status === 'Hoàn thành' ? 'Full' : `Tập ${movie.latestEpisode || 0}`}
                    </span>
                    <span>•</span>
                    <span className="line-clamp-1">{movie.category.slice(0, 2).join(', ')}</span>
                    {movie.year && (
                      <>
                        <span>•</span>
                        <span>{movie.year}</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            ))
          ) : query.trim() && !loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Không tìm thấy bộ phim nào phù hợp với từ khóa "{query}"
            </div>
          ) : !query.trim() ? (
            <div className="p-4 text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-2">Gợi ý tìm kiếm:</p>
              <div className="flex flex-wrap gap-2">
                {['Kiếm Hiệp', 'Cổ Trang', 'Tiên Hiệp', 'Hành Động', 'Hoạt Hình 3D', 'Ngôn Tình'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-full bg-cinema-800 hover:bg-cinema-700 text-gray-300 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        {results.length > 0 && (
          <div className="p-3 bg-cinema-950/60 border-t border-cinema-800 flex justify-between items-center text-xs text-gray-400">
            <span>Tìm thấy {results.length} kết quả</span>
            <button
              onClick={handleSubmit}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Xem tất cả kết quả
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
