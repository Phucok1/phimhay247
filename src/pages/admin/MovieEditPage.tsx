import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Film, Image as ImageIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { fetchMovies, createMovie, updateMovie, fetchCategories } from '../../services/api';
import { Movie, Category } from '../../types';

// Chuyển đổi tiếng Việt sang slug
function slugifyVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const MovieEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [status, setStatus] = useState<'Đang cập nhật' | 'Hoàn thành' | 'Tạm dừng'>('Đang cập nhật');
  const [featured, setFeatured] = useState(false);
  const [hidden, setHidden] = useState(false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);

    if (isEdit && id) {
      setLoading(true);
      fetchMovies({ includeHidden: true })
        .then((movies) => {
          const m = movies.find((item) => item.id === id);
          if (m) {
            setTitle(m.title);
            setSlug(m.slug);
            setDescription(m.description || '');
            setPosterUrl(m.posterUrl || '');
            setBannerUrl(m.bannerUrl || '');
            setSelectedCategories(m.category || []);
            setYear(m.year || new Date().getFullYear());
            setStatus(m.status || 'Đang cập nhật');
            setFeatured(!!m.featured);
            setHidden(!!m.hidden);
            setSeoTitle(m.seoTitle || '');
            setSeoDescription(m.seoDescription || '');
            setKeywords(m.keywords || '');
          } else {
            setError('Không tìm thấy thông tin bộ phim.');
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Tự sinh slug và SEO fields khi gõ tên phim (nếu đang ở chế độ thêm mới)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(slugifyVietnamese(val));
      if (!seoTitle) {
        setSeoTitle(`${val} - Xem Phim Trọn Bộ`);
      }
      if (!keywords) {
        setKeywords(`${val}, phim ${val}, xem phim ${val} youtube`);
      }
    }
  };

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tên phim không được để trống.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Partial<Movie> = {
      title: title.trim(),
      slug: slug.trim() || slugifyVietnamese(title),
      description: description.trim(),
      posterUrl: posterUrl.trim(),
      bannerUrl: bannerUrl.trim() || posterUrl.trim(),
      category: selectedCategories.length > 0 ? selectedCategories : ['Kiếm Hiệp'],
      year: Number(year) || new Date().getFullYear(),
      status,
      featured,
      hidden,
      seoTitle: seoTitle.trim() || `${title.trim()} - Xem Phim Trọn Bộ`,
      seoDescription: seoDescription.trim() || description.slice(0, 160),
      keywords: keywords.trim() || `${title.trim()}, phim hay`,
    };

    try {
      if (isEdit && id) {
        await updateMovie(id, payload);
      } else {
        const created = await createMovie(payload);
        // Sau khi thêm phim, chuyển ngay sang trang quản lý tập để admin thêm tập chỉ mất vài giây
        navigate(`/admin/movies/${created.id}/episodes`);
        return;
      }
      navigate('/admin/movies');
    } catch (err: any) {
      console.error('Lỗi lưu phim:', err);
      setError(err.response?.data?.error || err.message || 'Không thể lưu phim.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-gray-400">Đang tải dữ liệu phim...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-cinema-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies"
            className="p-2 rounded-xl bg-cinema-900 border border-cinema-800 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isEdit ? 'Chỉnh Sửa Bộ Phim' : 'Thêm Phim Mới'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? 'Cập nhật thông tin chi tiết và SEO của phim' : 'Khởi tạo bộ phim mới sau đó thêm các tập YouTube'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-800/80 flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phần 1: Thông tin cơ bản */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            1. Thông Tin Cơ Bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên phim */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tên bộ phim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Lưu Ly Kiếm Tông"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Slug URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Đường dẫn SEO (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="luu-ly-kiem-tong"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">URL: /phim/{slug || '...'}</span>
            </div>

            {/* Năm phát hành */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Năm phát hành</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white focus:outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Trạng thái phát sóng</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white focus:outline-none focus:border-primary text-sm"
              >
                <option value="Đang cập nhật">Đang cập nhật</option>
                <option value="Hoàn thành">Hoàn thành (Trọn bộ)</option>
                <option value="Tạm dừng">Tạm dừng</option>
              </select>
            </div>

            {/* Tùy chọn nổi bật / Ẩn */}
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-cinema-800 border-cinema-700"
                />
                <span>Đặt làm Banner nổi bật (Hero)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-cinema-800 border-cinema-700"
                />
                <span>Ẩn phim này</span>
              </label>
            </div>

            {/* Thể loại */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Thể loại (chọn một hoặc nhiều)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-cinema-850 text-gray-400 hover:text-white border border-cinema-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mô tả tóm tắt */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Mô tả nội dung tóm tắt
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập giới thiệu tóm tắt về diễn biến câu chuyện của bộ phim..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Phần 2: Hình ảnh (Poster 2:3 & Banner) */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gold" />
            2. Hình Ảnh Poster & Banner
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Poster URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                URL Poster (Tỷ lệ 2:3 chuẩn)
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://.../poster.jpg hoặc lấy thumbnail YouTube"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Có thể nhập link ảnh bất kỳ hoặc link YouTube Thumbnail: <code className="text-gray-400">https://i.ytimg.com/vi/ID/hqdefault.jpg</code>
              </p>
            </div>

            {/* Banner Backdrop URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                URL Banner / Backdrop ngang (Tùy chọn)
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://.../banner.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
              />
              <p className="text-[11px] text-gray-500 mt-1">Nếu bỏ trống hệ thống sẽ dùng ảnh poster làm banner nền</p>
            </div>

            {/* Poster Preview */}
            {posterUrl && (
              <div className="md:col-span-2 pt-2">
                <p className="text-xs font-semibold text-gray-400 mb-2">Xem trước ảnh bìa:</p>
                <img
                  src={posterUrl}
                  alt="Poster preview"
                  className="w-28 h-40 object-cover rounded-xl border border-cinema-700 shadow-md bg-cinema-850"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Phần 3: Quản lý SEO */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            3. Tối Ưu Hóa SEO (Meta Title, Description, Keywords)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                SEO Title (Tiêu đề tìm kiếm Google)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Tự sinh từ tên phim nếu để trống"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                SEO Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Mô tả hiển thị trên kết quả tìm kiếm Google và thẻ chia sẻ Facebook..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Từ khóa SEO (Keywords, cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ví dụ: lưu ly kiếm tông, phim kiem hiep hay, xem phim youtube"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>
        </div>

        {/* Nút Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/movies"
            className="px-5 py-2.5 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-gray-300 text-xs font-semibold transition"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg shadow-red-950 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Cập Nhật Bộ Phim' : 'Tạo Phim & Chuyển Sang Thêm Tập'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
