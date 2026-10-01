import React, { useState } from 'react';
import { PlusCircle, Crown } from 'lucide-react';
import { SubmitMovieModal } from './SubmitMovieModal';

export const QuickSubmitMovieWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút bấm nổi Thêm Phim Hội Viên (ở góc dưới bên trái màn hình, đối xứng Kênh Chat bên phải) */}
      <div className="fixed bottom-5 left-3 sm:left-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white rounded-full shadow-2xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all group font-semibold text-xs sm:text-sm border border-amber-400/40"
          title="Hội viên bấm để chia sẻ, đóng góp link phim mới"
        >
          <div className="relative">
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-90 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-300 rounded-full ring-2 ring-cinema-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-400 rounded-full ring-2 ring-cinema-900" />
          </div>
          <span className="font-bold tracking-tight">Thêm Phim</span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-black/40 text-amber-300 border border-amber-500/30">
            <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="hidden xs:inline sm:inline">Hội viên</span>
          </span>
        </button>
      </div>

      {/* Modal Chia Sẻ Phim Hội Viên */}
      <SubmitMovieModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
