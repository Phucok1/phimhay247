import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Sparkles, Filter, Eye, Layers, User, Film, ChevronRight, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { fetchNovels } from '../services/api';
import { Novel } from '../types';

export const NovelListPage: React.FC = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Tiên Hiệp', 'Kiếm Hiệp', 'Huyền Huyễn', 'Trọng Sinh', 'Dị Giới', 'Tu Chân'];

  useEffect(() => {
    loadNovels();
  }, [selectedCategory]);

  const loadNovels = async () => {
    try {
      setLoading(true);
      const data = await fetchNovels({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
      });
      setNovels(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách truyện:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNovels();
  };

  return (
    <>
      <SEOHead
        title="Tủ Sách Truyện Chữ Điện Ảnh - Đọc Tiểu Thuyết Tiên Hiệp & Kiếm Hiệp | PHIMCONGDONG.COM"
        description="Khám phá kho truyện chữ nguyên tác của các bộ phim kiếm hiệp, tiên hiệp, hoạt hình 3D đặc sắc. Đọc truyện chữ miễn phí với trải nghiệm mượt mà, đầy đủ các chương mới nhất."
      />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-cinema-900 to-cinema-950 border border-amber-600/30 p-6 sm:p-10 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>TỦ SÁCH ĐIỆN ẢNH NGUYÊN TÁC</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Truyện Chữ <span className="text-gradient from-amber-400 to-amber-200">Đặc Sắc</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Khám phá ngọn nguồn câu chuyện, chi tiết sâu sắc và những tình tiết hấp dẫn không có trên màn ảnh. Tự do đọc trọn bộ các tác phẩm tiểu thuyết tiên hiệp, kiếm hiệp nổi tiếng.
            </p>
          </div>
        </div>

        {/* Thanh tìm kiếm & lọc thể loại */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Tabs thể loại */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-cinema-950 border-amber-400 shadow-md shadow-amber-950/40'
                    : 'bg-cinema-900 text-gray-400 border-cinema-800 hover:text-white hover:border-gray-600'
                }`}
              >
                {cat === 'all' ? 'Tất cả truyện' : cat}
              </button>
            ))}
          </div>

          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên truyện, tác giả..."
              className="w-full pl-9 pr-4 py-2 bg-cinema-900 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Danh sách truyện */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
            <p className="text-xs">Đang tải tủ sách truyện chữ...</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-cinema-900/40 border border-cinema-800 space-y-3">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-300">Không tìm thấy truyện nào</h3>
            <p className="text-xs text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc chọn thể loại khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="group flex flex-col rounded-2xl bg-cinema-900 border border-cinema-800 hover:border-amber-500/50 transition duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-950/20"
              >
                <div className="flex gap-4 p-4">
                  {/* Bìa truyện */}
                  <Link
                    to={`/truyen/${novel.slug}`}
                    className="relative w-28 sm:w-32 aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden bg-cinema-950 border border-cinema-700/80 shadow-md group-hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={novel.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300'}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {novel.status}
                    </span>
                  </Link>

                  {/* Thông tin truyện */}
                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                        <User className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{novel.author}</span>
                      </div>
                      <Link
                        to={`/truyen/${novel.slug}`}
                        className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition line-clamp-2 leading-snug mb-2"
                      >
                        {novel.title}
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
                        {novel.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cinema-800/80 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Layers className="w-3 h-3" />
                        {novel.totalChapters || (novel.chapters ? novel.chapters.length : 0)} chương
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        {novel.viewCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer card: Thể loại & Nút đọc */}
                <div className="px-4 py-3 bg-cinema-950/60 border-t border-cinema-800/60 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {(novel.category || []).slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md bg-cinema-850 text-gray-300 text-[10px] font-medium border border-cinema-700/60"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/truyen/${novel.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Đọc ngay</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
