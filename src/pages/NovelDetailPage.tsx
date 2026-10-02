import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, User, Eye, Layers, Film, ArrowRight, ArrowLeft, Search, Clock, Sparkles, Loader2 } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { fetchNovelBySlug } from '../services/api';
import { Novel } from '../types';

export const NovelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (slug) {
      loadNovel(slug);
    }
  }, [slug]);

  const loadNovel = async (novelSlug: string) => {
    try {
      setLoading(true);
      const data = await fetchNovelBySlug(novelSlug);
      setNovel(data);
    } catch (err) {
      console.error('Lỗi tải chi tiết truyện:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs">Đang tải thông tin bộ truyện...</p>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center px-4">
        <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy bộ truyện này</h2>
        <p className="text-xs text-gray-400 mb-6">Truyện có thể đã được gỡ bỏ hoặc đường dẫn không chính xác.</p>
        <Link
          to="/truyen"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold text-xs"
        >
          Quay lại Tủ Sách Truyện
        </Link>
      </div>
    );
  }

  const allChapters = novel.chapters || [];
  const filteredChapters = allChapters.filter(
    (c) =>
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      c.chapterNumber.toString().includes(chapterSearch)
  );

  const sortedChapters = [...filteredChapters].sort((a, b) =>
    sortOrder === 'asc' ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber
  );

  const firstChapterNum = allChapters.length > 0 ? allChapters[0].chapterNumber : 1;
  const latestChapterNum = allChapters.length > 0 ? allChapters[allChapters.length - 1].chapterNumber : 1;

  return (
    <>
      <SEOHead
        title={`Truyện ${novel.title} - Tác Giả ${novel.author} | Đọc Online Trọn Bộ | PHIMCONGDONG.COM`}
        description={novel.description ? novel.description.slice(0, 160) : `Đọc truyện chữ ${novel.title} của tác giả ${novel.author} trọn bộ các chương mới nhất.`}
      />

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-white transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/truyen" className="hover:text-white transition">Truyện Chữ</Link>
          <span>/</span>
          <span className="text-amber-400 truncate max-w-xs">{novel.title}</span>
        </div>

        {/* Khối Header Chi Tiết Bộ Truyện */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900 border border-cinema-800 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Ảnh bìa */}
            <div className="relative w-40 sm:w-48 aspect-[3/4] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-cinema-700/80 mx-auto md:mx-0">
              <img
                src={novel.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'}
                alt={novel.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[11px] font-bold text-amber-300 border border-amber-500/30">
                {novel.status}
              </span>
            </div>

            {/* Thông tin truyện */}
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2">
                  {novel.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                    <User className="w-4 h-4 text-amber-400" />
                    Tác giả: <strong className="text-white">{novel.author}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-4 h-4 text-primary" />
                    <strong>{allChapters.length}</strong> chương
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <strong>{novel.viewCount || 0}</strong> lượt đọc
                  </span>
                </div>
              </div>

              {/* Danh sách thẻ thể loại */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                {(novel.category || []).map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-lg bg-cinema-850 text-amber-300 text-xs font-semibold border border-cinema-700/80"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Nút đọc truyện & Xem phim chuyển thể */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                {allChapters.length > 0 && (
                  <>
                    <Link
                      to={`/truyen/${novel.slug}/chuong-${firstChapterNum}`}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-cinema-950 font-extrabold text-xs sm:text-sm transition shadow-lg shadow-amber-950/40 flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Đọc Từ Đầu (Chương {firstChapterNum})</span>
                    </Link>

                    <Link
                      to={`/truyen/${novel.slug}/chuong-${latestChapterNum}`}
                      className="px-5 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 font-bold text-xs sm:text-sm transition border border-cinema-700 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Chương Mới Nhất ({latestChapterNum})</span>
                    </Link>
                  </>
                )}

                {/* Nếu truyện này có phim chuyển thể trên web */}
                {novel.linkedMovieSlug && (
                  <Link
                    to={`/phim/${novel.linkedMovieSlug}`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs sm:text-sm transition shadow-lg shadow-red-950/40 flex items-center gap-2"
                  >
                    <Film className="w-4 h-4" />
                    <span>Xem Phim Chuyển Thể</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Tóm tắt nội dung */}
          <div className="mt-6 pt-6 border-t border-cinema-800 space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tóm Tắt Cốt Truyện
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {novel.description || 'Nội dung tóm tắt đang được cập nhật...'}
            </p>
          </div>
        </div>

        {/* Mục Lục Các Chương */}
        <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-cinema-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Mục Lục Các Chương</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {allChapters.length} chương
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Lọc chương */}
              <div className="relative flex-grow sm:w-48">
                <input
                  type="text"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Tìm số chương..."
                  className="w-full pl-8 pr-3 py-1.5 bg-cinema-950 border border-cinema-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
              </div>

              {/* Đảo chiều sắp xếp */}
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 bg-cinema-850 hover:bg-cinema-800 border border-cinema-700 rounded-lg text-xs text-gray-300 hover:text-white transition whitespace-nowrap"
              >
                {sortOrder === 'asc' ? 'Cũ nhất trước' : 'Mới nhất trước'}
              </button>
            </div>
          </div>

          {/* Grid danh sách chương */}
          {sortedChapters.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-500">
              {chapterSearch ? 'Không tìm thấy chương nào phù hợp.' : 'Chưa có chương nào được tải lên.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cinema-700">
              {sortedChapters.map((ch) => (
                <Link
                  key={ch.chapterNumber}
                  to={`/truyen/${novel.slug}/chuong-${ch.chapterNumber}`}
                  className="p-3 rounded-xl bg-cinema-950/60 hover:bg-cinema-850 border border-cinema-800/80 hover:border-amber-500/50 transition flex items-center justify-between group"
                >
                  <span className="text-xs text-gray-300 group-hover:text-amber-300 font-medium truncate pr-2">
                    {ch.title || `Chương ${ch.chapterNumber}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
