import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Play, Youtube, Film, Shield, ChevronDown, Crown, MessageSquare, Heart, BookOpen } from 'lucide-react';
import { SearchModal } from '../common/SearchModal';
import { FeedbackModal } from '../common/FeedbackModal';
import { DonateModal } from '../common/DonateModal';
import { fetchCategories } from '../../services/api';
import { Category } from '../../types';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Tải danh mục cho menu dropdown
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Lỗi tải thể loại menu:', err));
  }, []);

  // Tự động đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setCatDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Phim mới', path: '/?sort=newest' },
    { label: 'Phim hoàn thành', path: '/?status=Hoàn thành' },
    { label: 'Truyện Chữ', path: '/truyen', isNovel: true },
    { label: 'Phim Hội Viên', path: '/phim-hoi-vien', isSpecial: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cinema-950/90 backdrop-blur-md border-b border-cinema-800 shadow-lg'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center">
                  PHIMCONGDONG<span className="text-gradient from-amber-400 via-orange-400 to-red-500">.COM</span>
                </span>
                <span className="text-[10px] text-gray-400 -mt-1 hidden sm:block tracking-wide">
                  Cộng Đồng Chia Sẻ &amp; Xem Phim
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link: any) => {
                const isActive = location.pathname + location.search === link.path;
                if (link.isNovel) {
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${
                        location.pathname.startsWith('/truyen')
                          ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-sm'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>{link.label}</span>
                    </Link>
                  );
                }
                if (link.isSpecial) {
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition ${
                        isActive
                          ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-sm'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                      }`}
                    >
                      <Crown className="w-4 h-4 fill-amber-400" />
                      <span>{link.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'text-white bg-cinema-800/80'
                        : 'text-gray-300 hover:text-white hover:bg-cinema-800/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Dropdown Thể loại */}
              <div className="relative">
                <button
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  onMouseEnter={() => setCatDropdownOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-cinema-800/40 transition"
                >
                  Thể loại
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </button>

                {catDropdownOpen && (
                  <div
                    onMouseLeave={() => setCatDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-64 p-3 bg-cinema-900 border border-cinema-700/80 rounded-xl shadow-2xl grid grid-cols-2 gap-1 z-50 animate-fadeIn"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/the-loai/${cat.slug}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-primary/20 hover:text-red-400 transition"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút Ủng hộ / Donate phát triển kênh */}
              <button
                type="button"
                onClick={() => setDonateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 hover:text-white transition shadow-sm ml-1 group"
                title="Ủng hộ, donate để phát triển kênh Phim Hay 247"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500 group-hover:scale-110 transition-transform" />
                <span>Ủng hộ kênh</span>
              </button>
            </nav>

            {/* Right actions: Search + Feedback + Admin */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cinema-800/60 hover:bg-cinema-800 text-gray-300 hover:text-white border border-cinema-700/60 transition text-sm shadow-sm"
                title="Tìm kiếm phim (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline text-xs text-gray-400">Tìm kiếm...</span>
              </button>

              {/* Nút Góp ý */}
              <button
                onClick={() => setFeedbackOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cinema-800/60 hover:bg-cinema-800 text-gray-300 hover:text-amber-400 border border-cinema-700/60 transition text-xs font-medium shadow-sm"
                title="Góp ý & Báo lỗi phim"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Góp ý</span>
              </button>

              <Link
                to="/admin"
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-cinema-800/60 transition"
                title="Quản trị website"
              >
                <Shield className="w-5 h-5" />
              </Link>

              {/* Hamburger Button on Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-cinema-800/80 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cinema-900/98 border-b border-cinema-800 px-4 pt-2 pb-6 space-y-3 animate-fadeIn backdrop-blur-xl">
            <div className="space-y-1">
              {navLinks.map((link: any) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium transition ${
                    link.isSpecial || link.isNovel
                      ? 'text-amber-400 bg-amber-500/10 font-bold'
                      : 'text-gray-200 hover:bg-cinema-800 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isSpecial && <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />}
                  {link.isNovel && <BookOpen className="w-4 h-4 text-amber-400" />}
                </Link>
              ))}

              {/* Nút Góp ý trên mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-amber-400 hover:bg-cinema-800"
              >
                <span>Góp ý & Báo lỗi phim</span>
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-cinema-800">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Thể loại</p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/the-loai/${cat.slug}`}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-cinema-800 hover:text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-cinema-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDonateOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-rose-300 bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 transition"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
                  <span>Ủng hộ, donate phát triển kênh</span>
                </span>
                <span className="text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                  Donate
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Global Donate Modal */}
      <DonateModal isOpen={donateOpen} onClose={() => setDonateOpen(false)} />

    </>
  );
};
