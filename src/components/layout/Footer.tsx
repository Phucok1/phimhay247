import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Youtube, Heart, Shield, Info, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 bg-cinema-900/90 border-t border-cinema-800/80 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Brand & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                PHIMCONGDONG<span className="text-gradient from-amber-400 via-orange-400 to-red-500">.COM</span>
              </span>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Website xem phim trực tuyến tổng hợp và chia sẻ các tác phẩm phim kiếm hiệp, cổ trang, hành động
              được phát chính thức trên kênh YouTube <strong className="text-red-400">@phimhay.momtiti</strong>.
            </p>
            <div className="pt-1">
              <a
                href="https://www.youtube.com/@phimhay.momtiti"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition shadow-md shadow-red-900/30"
              >
                <Youtube className="w-4 h-4 fill-current" />
                Đăng ký kênh @phimhay.momtiti
                <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
              </a>
            </div>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">Trang chủ</Link>
              </li>
              <li>
                <Link to="/?sort=newest" className="hover:text-white transition">Phim mới cập nhật</Link>
              </li>
              <li>
                <Link to="/?status=Hoàn thành" className="hover:text-white transition">Phim trọn bộ</Link>
              </li>
              <li>
                <Link to="/the-loai/kiem-hiep" className="hover:text-white transition">Phim Kiếm Hiệp</Link>
              </li>
              <li>
                <Link to="/the-loai/co-trang" className="hover:text-white transition">Phim Cổ Trang</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Tuyên bố bản quyền & YouTube Player */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Chính Sách & Bản Quyền</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tất cả video trên website được phát thông qua trình phát nhúng <strong>YouTube IFrame Embed API</strong> hợp pháp.
              Website KHÔNG lưu trữ, không tải về và không can thiệp vào mã nguồn video của YouTube.
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
              >
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span>Trang Quản Trị Admin</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-cinema-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PHIM HAY 247. Đồng hành cùng YouTube Channel @phimhay.momtiti.</p>
          <p className="flex items-center gap-1">
            Thiết kế với <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> cho cộng đồng yêu phim.
          </p>
        </div>
      </div>
    </footer>
  );
};
