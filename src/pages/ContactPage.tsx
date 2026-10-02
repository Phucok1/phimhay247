import React, { useState } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Mail, MessageSquare, Send, CheckCircle2, Phone, MapPin, Sparkles } from 'lucide-react';
import { sendFeedback } from '../services/api';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Góp ý tính năng');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await sendFeedback({
        name: name.trim() || 'Khán giả ẩn danh',
        contact: contact.trim() || 'Không để lại thông tin',
        type,
        content: content.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi tin nhắn, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Liên Hệ Ban Quản Trị | PHIMCONGDONG.COM"
        description="Thông tin liên hệ, phản hồi đóng góp ý kiến hoặc yêu cầu hợp tác nội dung với ban quản trị website PHIMCONGDONG.COM."
      />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KẾT NỐI VỚI CHÚNG TÔI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Liên Hệ & Đóng Góp Ý Kiến
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Chúng tôi luôn trân trọng mọi ý kiến đóng góp, phản hồi về chất lượng nội dung hoặc các đề xuất hợp tác từ quý khán giả.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thông tin liên hệ */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 space-y-3">
              <div className="flex items-center gap-3 text-white font-bold text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>Hòm Thư Điện Tử</span>
              </div>
              <p className="text-xs text-gray-300">
                Email hỗ trợ bản quyền & đối tác:
                <br />
                <a href="mailto:contact@phimcongdong.com" className="text-primary hover:underline font-mono">
                  contact@phimcongdong.com
                </a>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 space-y-3">
              <div className="flex items-center gap-3 text-white font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Kênh Trao Đổi Trực Tuyến</span>
              </div>
              <p className="text-xs text-gray-300">
                Tham gia chat trực tiếp tại ô tin nhắn cộng đồng ở góc dưới bên phải màn hình hoặc kênh YouTube:
                <br />
                <strong className="text-red-400">@phimhay.momtiti</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cinema-900 border border-cinema-800 space-y-3">
              <div className="flex items-center gap-3 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Thời Gian Phản Hồi</span>
              </div>
              <p className="text-xs text-gray-300">
                Đội ngũ kỹ thuật hỗ trợ trực tuyến 24/7. Các yêu cầu xử lý bản quyền DMCA sẽ được xử lý trong vòng <strong>24 - 48 giờ</strong> làm việc.
              </p>
            </div>
          </div>

          {/* Form gửi liên hệ */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">Gửi Tin Nhắn Thành Công!</h3>
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                  Cảm ơn bạn đã gửi phản hồi. Ban quản trị PHIMCONGDONG.COM sẽ xem xét và phản hồi sớm nhất có thể.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setContent('');
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-cinema-800 text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Gửi thêm tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-white">Gửi Thông Điệp Tới Ban Biên Tập</h3>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Họ và tên của bạn
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Email / Số điện thoại / Zalo
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="email@example.com hoặc số điện thoại"
                      className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Chủ đề phản hồi
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Góp ý tính năng">Góp ý phát triển tính năng mới</option>
                    <option value="Báo lỗi tập phim">Báo lỗi đường truyền / Tập phim hỏng</option>
                    <option value="Yêu cầu phim mới">Yêu cầu đăng thêm phim hoặc truyện chữ</option>
                    <option value="Hợp tác nội dung">Đề xuất hợp tác / Quảng cáo</option>
                    <option value="Vấn đề bản quyền">Vấn đề bản quyền / Quyền tác giả</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Nội dung chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Mô tả chi tiết câu hỏi hoặc góp ý của bạn để chúng tôi hỗ trợ tốt nhất..."
                    className="w-full px-3 py-2 bg-cinema-950 border border-cinema-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Đang gửi phản hồi...' : 'Gửi Phản Hồi Ngay'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
