import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, PlusCircle, Film, Loader2, PlayCircle, Users, HardDrive } from 'lucide-react';
import { fetchMovies } from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/common/MovieCard';
import { SEOHead } from '../components/common/SEOHead';
import { SubmitMovieModal } from '../components/common/SubmitMovieModal';

export const MemberMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const loadMemberMovies = async () => {
    try {
      setLoading(true);
      // Lấy tất cả phim và lọc các phim có category Phim Hội Viên hoặc có contributorName
      const all = await fetchMovies({ includeHidden: false });
      const memberList = all.filter(
        (m) =>
          (m.category && m.category.includes('Phim Hội Viên')) ||
          Boolean(m.contributorName)
      );

      if (memberList.length > 0) {
        setMovies(memberList);
        try {
          localStorage.setItem('phimhay247_member_movies_cache', JSON.stringify(memberList));
        } catch (e) {}
      } else {
        // Nếu server mới redeploy hoặc chưa kịp đồng bộ, lấy từ cache trình duyệt
        const cached = localStorage.getItem('phimhay247_member_movies_cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMovies(parsed);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phim hội viên:', err);
      // Fallback cache nếu lỗi mạng
      const cached = localStorage.getItem('phimhay247_member_movies_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMovies(parsed);
          }
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberMovies();
  }, []);

  const tags = [
    { id: 'all', label: 'Tất cả phim' },
    { id: 'Hoạt Hình 3D', label: 'Hoạt Hình 3D' },
    { id: 'Tiên Hiệp', label: 'Tiên Hiệp' },
    { id: 'Kiếm Hiệp', label: 'Kiếm Hiệp' },
    { id: 'Hành Động', label: 'Hành Động' },
    { id: 'Võ Thuật', label: 'Võ Thuật' },
  ];

  const filteredMovies =
    selectedTag === 'all'
      ? movies
      : movies.filter((m) => m.category && m.category.includes(selectedTag));

  return (
    <>
      <SEOHead
        title="Góc Phim Hội Viên - Cộng Đồng Chia Sẻ | PHIM HAY 247"
        description="Khám phá các bộ phim và video đặc sắc do chính các hội viên của Phim Hay 247 đóng góp và chia sẻ. Hỗ trợ TeraBox, Ok.ru, Facebook Reels, YouTube, Google Drive."
        keywords="phim hoi vien, chia se phim, dong gop phim, phim hay 247 hoi vien"
      />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner Góc Hội Viên */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-cinema-900 to-cinema-950 border border-amber-600/30 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span>KHÔNG GIAN CỘNG ĐỒNG HỘI VIÊN</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Phim Do Hội Viên <span className="text-gradient from-amber-400 to-amber-200">Đóng Góp</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Nơi hội viên Phim Hay 247 cùng nhau chia sẻ những bộ phim yêu thích, phim hiếm từ các nguồn lưu trữ miễn phí như{' '}
                <strong className="text-cyan-300">TeraBox (1000 GB)</strong>, <strong className="text-amber-300">Ok.ru (không giới hạn GB)</strong>, Facebook Reels, YouTube, và Google Drive.
              </p>

              {/* Badges tính năng */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 bg-cinema-950/60 px-2.5 py-1 rounded-lg border border-cinema-800">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  Lưu trữ dung lượng cao
                </span>
                <span className="flex items-center gap-1.5 bg-cinema-950/60 px-2.5 py-1 rounded-lg border border-cinema-800">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Ghi danh người đóng góp
                </span>
                <span className="flex items-center gap-1.5 bg-cinema-950/60 px-2.5 py-1 rounded-lg border border-cinema-800">
                  <Sparkles className="w-3.5 h-3.5 text-green-400" />
                  Duyệt nhanh trong ngày
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => setSubmitModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 text-white font-bold text-sm shadow-xl shadow-amber-600/30 hover:scale-105 transition transform"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Chia Sẻ Phim Của Bạn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedTag === tag.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-cinema-900 border border-cinema-800 text-gray-300 hover:text-white hover:bg-cinema-800'
              }`}
            >
              {tag.label}
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-auto whitespace-nowrap hidden sm:inline">
            Tổng cộng: <strong className="text-white">{filteredMovies.length}</strong> phim
          </span>
        </div>

        {/* Content Movie Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            <p className="text-sm">Đang tải danh sách phim hội viên...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="py-16 px-6 text-center bg-cinema-900/60 border border-cinema-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Chưa có bộ phim nào trong danh mục này</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Bạn có bộ phim yêu thích muốn lưu trữ và chia sẻ cùng cộng đồng? Hãy bấm nút bên dưới để gửi phim đầu tiên nhé!
            </p>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Gửi Đóng Góp Phim Ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showCategory />
            ))}
          </div>
        )}
      </div>

      {/* Modal Chia sẻ phim */}
      <SubmitMovieModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmitted={() => loadMemberMovies()}
      />
    </>
  );
};
