import React from 'react';
import { ArrowUpDown, Filter, Sparkles, Flame, SortAsc, Clock, Layers } from 'lucide-react';
import { Category } from '../../types';

interface FilterBarProps {
  currentSort: 'updated' | 'views' | 'az' | 'newest' | 'episodes';
  onSortChange: (sort: 'updated' | 'views' | 'az' | 'newest' | 'episodes') => void;
  currentStatus: string;
  onStatusChange: (status: string) => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentSort,
  onSortChange,
  currentStatus,
  onStatusChange,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const sortOptions = [
    { value: 'updated', label: 'Mới cập nhật', icon: Clock },
    { value: 'views', label: 'Nhiều lượt xem', icon: Flame },
    { value: 'newest', label: 'Mới nhất', icon: Sparkles },
    { value: 'episodes', label: 'Nhiều tập nhất', icon: Layers },
    { value: 'az', label: 'A - Z', icon: SortAsc },
  ] as const;

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Đang cập nhật', label: 'Đang cập nhật' },
    { value: 'Hoàn thành', label: 'Phim trọn bộ' },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Hàng 1: Tabs Trạng thái & Dropdown Sắp xếp */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cinema-800">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 p-1 bg-cinema-900 rounded-xl border border-cinema-800">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentStatus === opt.value
                  ? 'bg-primary text-white shadow-md shadow-red-950'
                  : 'text-gray-400 hover:text-white hover:bg-cinema-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {sortOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentSort === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-cinema-800 text-gold border border-gold/40'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-cinema-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hàng 2: Categories Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => onCategoryChange('')}
          className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
            selectedCategory === ''
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-cinema-900 hover:bg-cinema-800 text-gray-400 hover:text-white border border-cinema-800'
          }`}
        >
          Tất cả thể loại
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === cat.slug
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-cinema-900 hover:bg-cinema-800 text-gray-400 hover:text-white border border-cinema-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};
