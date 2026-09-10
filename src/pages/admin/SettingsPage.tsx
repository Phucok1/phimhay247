import React, { useEffect, useState } from 'react';
import {
  Settings,
  Youtube,
  Key,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import { fetchAdminSettings, updateSettings } from '../../services/api';
import { SiteSettings } from '../../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [siteName, setSiteName] = useState('PHIM HAY 247');
  const [channelUrl, setChannelUrl] = useState('https://www.youtube.com/@phimhay.momtiti');
  const [channelName, setChannelName] = useState('@phimhay.momtiti');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setKeywords] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => {
        setSettings(data);
        setSiteName(data.siteName || 'PHIM HAY 247');
        setChannelUrl(data.channelUrl || 'https://www.youtube.com/@phimhay.momtiti');
        setChannelName(data.channelName || '@phimhay.momtiti');
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');
        setKeywords(data.seoKeywords || '');
        setYoutubeApiKey(data.youtubeApiKey || '');
        setAdminKey(data.adminKey || 'admin123');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateSettings({
        siteName,
        channelUrl,
        channelName,
        seoTitle,
        seoDescription,
        seoKeywords,
        youtubeApiKey: youtubeApiKey.trim() || undefined,
        adminKey: adminKey.trim() || 'admin123',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-gray-400">Đang tải cấu hình website...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cinema-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Cài Đặt Hệ Thống &amp; API
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Cấu hình thông tin website, YouTube API, kênh YouTube và bảo mật
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Đã lưu cấu hình thành công!
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Khối 1: Kênh YouTube & Thương hiệu */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
            1. Kênh YouTube &amp; Thương Hiệu
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Website</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Handle Kênh YouTube</label>
              <input
                type="text"
                required
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Đường dẫn liên kết kênh YouTube chính thức
              </label>
              <input
                type="url"
                required
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-primary"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Liên kết này sẽ xuất hiện trên header, footer và các nút mời đăng ký kênh của người xem.
              </span>
            </div>
          </div>
        </div>

        {/* Khối 2: YouTube Data API Key */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cinema-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-gold" />
              2. YouTube Data API v3 Key (Tùy chọn)
            </h3>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold ${
                youtubeApiKey
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {youtubeApiKey ? 'Đã cấu hình' : 'Chưa cấu hình (Vẫn dùng được tính năng dán link)'}
            </span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">Google API Key</label>
            <input
              type="text"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs font-mono focus:outline-none focus:border-primary"
            />

            {/* Hướng dẫn tạo API Key an toàn */}
            <div className="p-3.5 rounded-xl bg-cinema-950 border border-cinema-800 text-xs text-gray-400 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-gray-200 font-semibold">
                <Info className="w-4 h-4 text-primary" />
                <span>Mục đích sử dụng YouTube API Key:</span>
              </div>
              <p>
                Dùng để tự động quét toàn bộ danh sách tập từ một link <strong>YouTube Playlist</strong> mà không cần dán từng link thủ công.
                Nếu chưa cấu hình, bạn vẫn có thể sử dụng chức năng <strong>"Nhập nhiều tập"</strong> dán danh sách link cực nhanh!
              </p>
              <div className="pt-1">
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold hover:underline text-xs"
                >
                  <span>Mở Google Cloud Console để lấy API Key miễn phí</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Khối 3: Trạng thái Database & Firebase */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            3. Trạng Thái Cơ Sở Dữ Liệu &amp; Firebase
          </h3>

          <div className="p-4 rounded-xl bg-cinema-950 border border-cinema-800 text-xs text-gray-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Cơ sở dữ liệu đang hoạt động ở chế độ: Local Persistent Engine</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Toàn bộ dữ liệu phim, các tập, thể loại và lượt xem được tự động lưu trữ an toàn, độc lập trong file <code className="text-gray-200 bg-cinema-850 px-1 py-0.5 rounded">server/data/db.json</code>.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Để chuyển sang đồng bộ Firebase Firestore trên đám mây, chỉ cần điền các khóa trong file <code className="text-gray-200 bg-cinema-850 px-1 py-0.5 rounded">.env</code> theo mẫu <code className="text-gray-200 bg-cinema-850 px-1 py-0.5 rounded">.env.example</code> và áp dụng luật bảo mật <code className="text-gray-200 bg-cinema-850 px-1 py-0.5 rounded">firestore.rules</code>.
            </p>
          </div>
        </div>

        {/* Khối 4: Mật khẩu Quản Trị */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            4. Bảo Mật &amp; Mật Khẩu Quản Trị
          </h3>

          <div className="max-w-md space-y-2">
            <label className="block text-xs font-semibold text-gray-300">
              Mật khẩu Admin đăng nhập Dashboard
            </label>
            <input
              type="text"
              required
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs font-mono focus:outline-none focus:border-primary"
            />
            <span className="text-[11px] text-gray-500 block">
              Mật khẩu dùng để truy cập vào đường dẫn <code className="text-gray-400">/admin</code>.
            </span>
          </div>
        </div>

        {/* Nút Lưu */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg shadow-red-950 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu Toàn Bộ Cấu Hình
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
