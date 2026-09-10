import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEOHead title="404 - Không tìm thấy nội dung | PHIM HAY 247" />

      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className="relative mb-6">
          <span className="text-8xl md:text-9xl font-black text-cinema-850 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-16 h-16 text-red-500 animate-bounce" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
          Không tìm thấy nội dung
        </h1>
        <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
          Đường link bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc tạm thời không khả dụng.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-950 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-300 text-sm font-semibold transition border border-cinema-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    </>
  );
};
