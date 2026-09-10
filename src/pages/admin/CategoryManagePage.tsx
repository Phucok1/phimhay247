import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { fetchCategories, createCategory, deleteCategory } from '../../services/api';
import { Category } from '../../types';

export const CategoryManagePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = () => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createCategory(newCatName.trim());
      setNewCatName('');
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi thêm thể loại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert('Lỗi khi xóa thể loại.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cinema-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Quản Lý Thể Loại ({categories.length})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Phân loại phim theo các danh mục kiếm hiệp, cổ trang, ngôn tình...
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form thêm thể loại */}
      <form
        onSubmit={handleAddCategory}
        className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl flex items-center gap-3"
      >
        <div className="relative flex-grow">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nhập tên thể loại mới (ví dụ: Trùng Sinh, Đô Thị, Võ Thuật...)"
            className="w-full px-4 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-950 disabled:opacity-50 flex-shrink-0"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Thêm Thể Loại
        </button>
      </form>

      {/* Danh sách thể loại */}
      <div className="bg-cinema-900 rounded-2xl border border-cinema-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-xs text-gray-400">Đang tải thể loại...</p>
          </div>
        ) : (
          <div className="divide-y divide-cinema-800/70">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 px-5 flex items-center justify-between hover:bg-cinema-850/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                    <span className="text-[11px] text-gray-400 font-mono">
                      /the-loai/{cat.slug}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg bg-cinema-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition"
                  title="Xóa thể loại này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
