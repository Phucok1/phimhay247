import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Settings, Type, Sun, Moon, Coffee, ArrowLeft, Loader2, List } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { fetchChapter } from '../services/api';
import { Chapter, Novel } from '../types';

export const ChapterReadingPage: React.FC = () => {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<Partial<Novel> | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [prevChapter, setPrevChapter] = useState<number | null>(null);
  const [nextChapter, setNextChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Tùy chỉnh trình đọc (Reader settings)
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('reader_font_size') || '18', 10);
  });
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>(() => {
    return (localStorage.getItem('reader_theme') as any) || 'dark';
  });
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>(() => {
    return (localStorage.getItem('reader_font_family') as any) || 'sans';
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (slug && chapterNumber) {
      loadChapter(slug, chapterNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug, chapterNumber]);

  // Hỗ trợ phím mũi tên trái/phải để chuyển chương
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && prevChapter !== null && slug) {
        navigate(`/truyen/${slug}/chuong-${prevChapter}`);
      } else if (e.key === 'ArrowRight' && nextChapter !== null && slug) {
        navigate(`/truyen/${slug}/chuong-${nextChapter}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevChapter, nextChapter, slug, navigate]);

  const loadChapter = async (novelSlug: string, cNum: string) => {
    try {
      setLoading(true);
      const data = await fetchChapter(novelSlug, cNum);
      setNovel(data.novel);
      setChapter(data.chapter);
      setPrevChapter(data.prevChapter);
      setNextChapter(data.nextChapter);
    } catch (err) {
      console.error('Lỗi tải chương:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(14, Math.min(28, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('reader_font_size', newSize.toString());
  };

  const handleThemeChange = (newTheme: 'dark' | 'sepia' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('reader_theme', newTheme);
  };

  const handleFontFamilyChange = (ff: 'sans' | 'serif') => {
    setFontFamily(ff);
    localStorage.setItem('reader_font_family', ff);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs">Đang tải nội dung chương truyện...</p>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center px-4">
        <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy chương truyện này</h2>
        <p className="text-xs text-gray-400 mb-6">Chương có thể chưa được cập nhật hoặc không tồn tại.</p>
        <Link
          to={`/truyen/${slug}`}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-cinema-950 font-bold text-xs"
        >
          Quay lại Mục Lục Truyện
        </Link>
      </div>
    );
  }

  // Định nghĩa màu nền theo theme
  const themeClasses = {
    dark: 'bg-cinema-950 text-gray-200',
    sepia: 'bg-[#fbf0d9] text-[#4a3928]',
    light: 'bg-[#ffffff] text-[#1a1a1a]',
  }[theme];

  const cardClasses = {
    dark: 'bg-cinema-900/90 border-cinema-800 text-gray-200',
    sepia: 'bg-[#f4e4c1] border-[#dfcd9f] text-[#3d2e1f]',
    light: 'bg-[#f9f9f9] border-[#e0e0e0] text-[#1a1a1a]',
  }[theme];

  return (
    <>
      <SEOHead
        title={`${chapter.title} - Truyện ${novel.title} | Đọc Online | PHIMCONGDONG.COM`}
        description={`Đọc ${chapter.title} bộ truyện chữ ${novel.title} của tác giả ${novel.author}. Trải nghiệm đọc truyện mượt mà không quảng cáo rác tại PHIMCONGDONG.COM.`}
      />

      <div className={`min-h-screen pt-20 pb-20 transition-colors duration-300 ${themeClasses}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Thanh điều hướng & Cài đặt Reader (Sticky Top) */}
          <div
            className={`sticky top-16 z-30 mb-6 p-3 rounded-2xl border backdrop-blur-md shadow-lg flex items-center justify-between gap-3 transition-colors ${
              theme === 'dark' ? 'bg-cinema-900/90 border-cinema-800' : 'bg-black/10 border-black/10'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={`/truyen/${novel.slug}`}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 transition flex-shrink-0"
                title="Quay lại mục lục truyện"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/truyen/${novel.slug}`}
                  className="font-bold text-xs sm:text-sm hover:underline truncate block"
                >
                  {novel.title}
                </Link>
                <span className="text-[11px] opacity-75 truncate block">
                  {chapter.title}
                </span>
              </div>
            </div>

            {/* Bộ điều khiển */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Tùy chỉnh giao diện đọc"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cỡ chữ & Nền</span>
              </button>

              <Link
                to={`/truyen/${novel.slug}`}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-xs font-semibold flex items-center gap-1"
                title="Mục lục"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Mục lục</span>
              </Link>
            </div>
          </div>

          {/* Hộp thoại Cài Đặt Reader */}
          {showSettings && (
            <div className="mb-6 p-4 rounded-2xl bg-cinema-900 border border-cinema-700 text-white shadow-2xl animate-fadeIn space-y-4">
              <div className="flex items-center justify-between text-xs font-bold border-b border-cinema-800 pb-2">
                <span>TÙY CHỈNH TRÌNH ĐỌC TRUYỆN</span>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* 1. Cỡ chữ */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 font-medium">Cỡ chữ: {fontSize}px</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFontSizeChange(-2)}
                      className="px-3 py-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 font-bold"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => handleFontSizeChange(2)}
                      className="px-3 py-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* 2. Màu nền */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 font-medium">Màu nền đọc:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`px-3 py-1 rounded-lg border flex items-center gap-1 ${
                        theme === 'dark' ? 'bg-black text-amber-300 border-amber-400' : 'bg-black/40 border-cinema-700 text-gray-400'
                      }`}
                    >
                      <Moon className="w-3 h-3" /> Đêm
                    </button>
                    <button
                      onClick={() => handleThemeChange('sepia')}
                      className={`px-3 py-1 rounded-lg border flex items-center gap-1 ${
                        theme === 'sepia' ? 'bg-[#fbf0d9] text-[#4a3928] border-amber-600 font-bold' : 'bg-[#fbf0d9]/40 border-cinema-700 text-gray-400'
                      }`}
                    >
                      <Coffee className="w-3 h-3" /> Vàng giấy
                    </button>
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`px-3 py-1 rounded-lg border flex items-center gap-1 ${
                        theme === 'light' ? 'bg-white text-black border-white font-bold' : 'bg-white/40 border-cinema-700 text-gray-400'
                      }`}
                    >
                      <Sun className="w-3 h-3" /> Sáng
                    </button>
                  </div>
                </div>

                {/* 3. Phông chữ */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 font-medium">Kiểu chữ:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFontFamilyChange('sans')}
                      className={`px-3 py-1 rounded-lg border ${
                        fontFamily === 'sans' ? 'bg-amber-500 text-cinema-950 font-bold border-amber-400' : 'bg-cinema-800 border-cinema-700 text-gray-400'
                      }`}
                    >
                      Sans (Hiện đại)
                    </button>
                    <button
                      onClick={() => handleFontFamilyChange('serif')}
                      className={`px-3 py-1 rounded-lg border font-serif ${
                        fontFamily === 'serif' ? 'bg-amber-500 text-cinema-950 font-bold border-amber-400' : 'bg-cinema-800 border-cinema-700 text-gray-400'
                      }`}
                    >
                      Serif (Sách)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tiêu đề chương */}
          <div className="text-center my-8 space-y-2">
            <h2 className="text-xs uppercase tracking-widest opacity-60 font-semibold">
              {novel.title}
            </h2>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {chapter.title}
            </h1>
            <p className="text-xs opacity-60">Tác giả: {novel.author}</p>
          </div>

          {/* Nút chuyển chương trên */}
          <div className="flex items-center justify-between gap-3 mb-8 border-y py-3 border-current/10">
            {prevChapter !== null ? (
              <Link
                to={`/truyen/${slug}/chuong-${prevChapter}`}
                className="px-4 py-2 rounded-xl bg-black/10 hover:bg-black/20 font-bold text-xs flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chương trước</span>
              </Link>
            ) : (
              <span className="opacity-30 text-xs px-4 py-2">Đầu bộ truyện</span>
            )}

            <Link
              to={`/truyen/${slug}`}
              className="px-3 py-1.5 rounded-lg border border-current/20 text-xs font-semibold hover:bg-black/10 transition"
            >
              Mục lục
            </Link>

            {nextChapter !== null ? (
              <Link
                to={`/truyen/${slug}/chuong-${nextChapter}`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-cinema-950 font-extrabold text-xs flex items-center gap-1 shadow transition hover:scale-105"
              >
                <span>Chương sau</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="opacity-30 text-xs px-4 py-2">Hết truyện</span>
            )}
          </div>

          {/* Vị trí đặt quảng cáo AdSense trên (Ad Unit Top) */}
          <div className="my-6 p-4 rounded-xl bg-black/5 border border-dashed border-current/10 text-center text-xs opacity-50">
            <span>Quảng cáo tài trợ hiển thị tại đây</span>
          </div>

          {/* KHUNG NỘI DUNG VĂN BẢN TRUYỆN CHỮ CHUẨN */}
          <div
            className={`p-6 sm:p-10 rounded-3xl border shadow-xl leading-relaxed whitespace-pre-line ${cardClasses} ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
          >
            {chapter.content}
          </div>

          {/* Vị trí đặt quảng cáo AdSense dưới (Ad Unit Bottom) */}
          <div className="my-6 p-4 rounded-xl bg-black/5 border border-dashed border-current/10 text-center text-xs opacity-50">
            <span>Quảng cáo tài trợ hiển thị tại đây</span>
          </div>

          {/* Nút chuyển chương dưới */}
          <div className="flex items-center justify-between gap-3 mt-8 border-y py-4 border-current/10">
            {prevChapter !== null ? (
              <Link
                to={`/truyen/${slug}/chuong-${prevChapter}`}
                className="px-5 py-2.5 rounded-xl bg-black/10 hover:bg-black/20 font-bold text-xs flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chương trước (Phím ←)</span>
              </Link>
            ) : (
              <span className="opacity-30 text-xs px-4 py-2">Đầu bộ truyện</span>
            )}

            <Link
              to={`/truyen/${slug}`}
              className="px-3 py-1.5 rounded-lg border border-current/20 text-xs font-semibold hover:bg-black/10 transition"
            >
              Mục lục
            </Link>

            {nextChapter !== null ? (
              <Link
                to={`/truyen/${slug}/chuong-${nextChapter}`}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-cinema-950 font-extrabold text-xs flex items-center gap-1 shadow-lg transition hover:scale-105"
              >
                <span>Chương sau (Phím →)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="opacity-30 text-xs px-4 py-2">Hết truyện</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
