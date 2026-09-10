import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Play, Youtube, Film, Shield, ChevronDown } from 'lucide-react';
import { SearchModal } from '../common/SearchModal';
import { fetchCategories } from '../../services/api';
import { Category } from '../../types';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  PHIM HAY <span className="text-gradient">247</span>
                </span>
                <span className="text-[10px] text-gray-400 -mt-1 hidden sm:block">YouTube Movies Cinema</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname + location.search === link.path;
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

              {/* YouTube Channel link */}
              <a
                href="https://www.youtube.com/@phimhay.momtiti"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/40 hover:bg-red-900/40 hover:text-white transition ml-2"
              >
                <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
                <span>@phimhay.momtiti</span>
              </a>
            </nav>

            {/* Right actions: Search + Admin */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cinema-800/60 hover:bg-cinema-800 text-gray-300 hover:text-white border border-cinema-700/60 transition text-sm shadow-sm"
                title="Tìm kiếm phim (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline text-xs text-gray-400">Tìm kiếm...</span>
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
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-cinema-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
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
              <a
                href="https://www.youtube.com/@phimhay.momtiti"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 bg-red-950/40 border border-red-900/50"
              >
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <span>Kênh YouTube: @phimhay.momtiti</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
