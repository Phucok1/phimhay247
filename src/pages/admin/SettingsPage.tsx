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
  Heart,
  CreditCard,
  Smartphone,
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
  const [donateBankName, setDonateBankName] = useState('Vietcombank');
  const [donateAccountNumber, setDonateAccountNumber] = useState('');
  const [donateAccountName, setDonateAccountName] = useState('NGUYỄN THIỆN PHÚC');
  const [donateMomo, setDonateMomo] = useState('');
  const [donateQrUrl, setDonateQrUrl] = useState('/images/donate-qr.png');
  const [adSenseSafeMode, setAdSenseSafeMode] = useState(false);

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
        setDonateBankName(data.donateBankName || 'Vietcombank');
        setDonateAccountNumber(data.donateAccountNumber || '');
        setDonateAccountName(data.donateAccountName || 'NGUYỄN THIỆN PHÚC');
        setDonateMomo(data.donateMomo || '');
        setDonateQrUrl(data.donateQrUrl || '/images/donate-qr.png');
        setAdSenseSafeMode(Boolean(data.adSenseSafeMode));
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
        donateBankName: donateBankName.trim(),
        donateAccountNumber: donateAccountNumber.trim(),
        donateAccountName: donateAccountName.trim(),
        donateMomo: donateMomo.trim(),
        donateQrUrl: donateQrUrl.trim() || '/images/donate-qr.png',
        adSenseSafeMode,
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
        {/* KHỐI ĐẶC BIỆT: CHẾ ĐỘ DUYỆT GOOGLE ADSENSE (SAFE MODE) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-cinema-900 to-emerald-950/60 border border-emerald-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                  CHIẾN THUẬT ADSENSE
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  🛡️ Chế Độ Duyệt An Toàn Google AdSense (Safe Mode)
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed max-w-2xl">
                <strong>BẬT</strong> khi bạn chuẩn bị gửi trang web cho Google AdSense xét duyệt. Hệ thống sẽ tạm thời ẩn các đường link xem video lậu, biến website thành <em>Cổng Thông Tin Đánh Giá Điện Ảnh &amp; Đọc Truyện Chữ Sạch Sẽ 100%</em> (tuân thủ bản quyền DMCA tuyệt đối). Sau khi Google duyệt cấp mã thành công, bạn chỉ cần <strong>TẮT</strong> công tắc này để phim hiện lại bình thường cho khán giả!
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs font-bold ${adSenseSafeMode ? 'text-emerald-400' : 'text-gray-400'}`}>
                {adSenseSafeMode ? 'ĐANG BẬT (Đã Ẩn Phim Lậu)' : 'ĐANG TẮT (Hiện Phim Bình Thường)'}
              </span>
              <button
                type="button"
                onClick={() => setAdSenseSafeMode(!adSenseSafeMode)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  adSenseSafeMode ? 'bg-emerald-500' : 'bg-cinema-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    adSenseSafeMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

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

        {/* Khối 5: Cấu Hình Tài Khoản Nhận Ủng Hộ & Donate */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            5. Tài Khoản Nhận Ủng Hộ &amp; Donate Kênh
          </h3>
          <p className="text-xs text-gray-400">
            Thông tin sẽ hiển thị khi khán giả bấm nút "Ủng hộ kênh" trên thanh Menu.
          </p>

          {/* Hiển thị Mã QR hiện tại */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-cinema-850 border border-cinema-700">
            <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
              <img
                src={donateQrUrl || '/images/donate-qr.png'}
                alt="Mã QR Hiện Tại"
                className="w-24 h-24 object-contain rounded"
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Mã QR VietQR Napas 247 Chính Thức</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Mã QR đã được gán trực tiếp vào website. Khán giả bấm "Ủng hộ kênh" sẽ thấy mã QR này và có thể mở bất kỳ ứng dụng ngân hàng nào (VCB, MB, BIDV, Techcombank, MoMo...) để quét chuyển tiền nhanh 24/7!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Ngân Hàng</label>
              <input
                type="text"
                value={donateBankName}
                onChange={(e) => setDonateBankName(e.target.value)}
                placeholder="VD: Vietcombank, MB Bank, Techcombank..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Số Tài Khoản Ngân Hàng (Tùy chọn)</label>
              <input
                type="text"
                value={donateAccountNumber}
                onChange={(e) => setDonateAccountNumber(e.target.value)}
                placeholder="Nhập nếu muốn hiện số tài khoản dạng văn bản để chép"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-rose-500 font-mono font-bold text-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tên Chủ Tài Khoản</label>
              <input
                type="text"
                value={donateAccountName}
                onChange={(e) => setDonateAccountName(e.target.value)}
                placeholder="VD: NGUYEN VAN A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-rose-500 uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Số Ví MoMo (Không bắt buộc)</label>
              <input
                type="text"
                value={donateMomo}
                onChange={(e) => setDonateMomo(e.target.value)}
                placeholder="VD: 0987654321"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Đường Dẫn Ảnh QR Code (Mặc định: /images/donate-qr.png)</label>
              <input
                type="text"
                value={donateQrUrl}
                onChange={(e) => setDonateQrUrl(e.target.value)}
                placeholder="/images/donate-qr.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cinema-850 border border-cinema-700 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Khối 6: Sao Lưu & Khôi Phục Dữ Liệu (Backup & Restore) */}
        <div className="p-6 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-cinema-800 pb-3 flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-400" />
            6. Sao Lưu &amp; Khôi Phục Dữ Liệu (Chống Mất Phim Trên Cloud)
          </h3>

          <div className="space-y-4 text-xs">
            <p className="text-gray-300 leading-relaxed">
              Trên các nền tảng Cloud miễn phí như Render, bộ nhớ đĩa là tạm thời (sẽ khôi phục về trạng thái GitHub khi server khởi động lại). Hãy sử dụng công cụ dưới đây để lưu trữ vĩnh viễn toàn bộ phim, tập phim và truyện chữ:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Nút tải backup */}
              <a
                href="/api/settings/export-db"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-lg shadow-emerald-950"
              >
                <Save className="w-4 h-4" />
                Tải Về Bản Sao Lưu Toàn Bộ Database (.json)
              </a>

              {/* Nút khôi phục backup */}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 font-semibold cursor-pointer transition border border-cinema-700">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Khôi Phục Toàn Bộ (Phim & Truyện) Từ File Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      const res = await fetch('/api/settings/import-db', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(json),
                      });
                      const result = await res.json();
                      if (result.success) {
                        alert('Khôi phục database (phim, tập và truyện) thành công! Trang web sẽ được tải lại.');
                        window.location.reload();
                      } else {
                        alert(result.error || 'Lỗi khi khôi phục.');
                      }
                    } catch (err: any) {
                      alert('File JSON không hợp lệ: ' + err.message);
                    }
                  }}
                />
              </label>
            </div>

            <div className="p-3 bg-cinema-950/80 rounded-xl border border-cinema-800 text-gray-400 space-y-1">
              <p className="font-semibold text-gray-200">Mẹo lưu dữ liệu vĩnh viễn không bao giờ mất:</p>
              <p>• <strong>Cách 1:</strong> Sau khi thêm phim hoặc cào truyện trên web, bấm nút <strong className="text-emerald-400">"Tải Về Bản Sao Lưu Toàn Bộ Database"</strong> cất vào máy tính.</p>
              <p>• <strong>Cách 2 (Khuyên dùng):</strong> Bấm đúp vào file <strong className="text-amber-400">"DAY_CODE_LEN_GITHUB.bat"</strong> trên màn hình Desktop máy tính để đẩy toàn bộ phim và truyện lên GitHub vĩnh viễn!</p>
            </div>
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
