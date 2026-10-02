import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { ShieldCheck, Lock, Eye, Cookie, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Chính Sách Bảo Mật (Privacy Policy) | PHIMCONGDONG.COM"
        description="Chính sách bảo mật thông tin người dùng và quyền riêng tư tại website PHIMCONGDONG.COM theo tiêu chuẩn Google AdSense và pháp luật hiện hành."
      />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QUYỀN RIÊNG TƯ & BẢO MẬT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Cập nhật lần cuối: Tháng 10 năm 2026 • Áp dụng cho toàn bộ người dùng tại <strong>phimcongdong.com</strong>
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-6 text-gray-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              1. Thông Tin Thu Thập
            </h2>
            <p>
              Khi bạn truy cập website <strong>PHIMCONGDONG.COM</strong>, chúng tôi có thể tự động thu thập một số thông tin kỹ thuật phi cá nhân nhằm mục đích tối ưu hóa trải nghiệm xem phim và đọc truyện, bao gồm: địa chỉ IP rút gọn, loại trình duyệt, loại thiết bị (điện thoại hoặc máy tính), hệ điều hành và thời gian truy cập.
            </p>
            <p>
              Chúng tôi <strong>KHÔNG</strong> yêu cầu người xem phải cung cấp số CCCD, tài khoản ngân hàng hay các dữ liệu nhạy cảm để sử dụng dịch vụ thông thường.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-400" />
              2. Sử Dụng Cookie & Web Beacon
            </h2>
            <p>
              Website sử dụng <strong>Cookie</strong> và bộ nhớ cục bộ (Local Storage) để lưu trữ các tùy chọn cá nhân của bạn, chẳng hạn như: lịch sử tập phim đang xem dở, màu nền đọc truyện, cỡ chữ ưa thích, hoặc trạng thái danh sách yêu thích.
            </p>
            <p>
              Bạn hoàn toàn có thể chủ động xóa hoặc chặn Cookie bất cứ lúc nào thông qua cài đặt trên trình duyệt web của mình.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              3. Đối Tác Quảng Cáo Bên Thứ Ba & Google AdSense
            </h2>
            <p>
              Các nhà cung cấp bên thứ ba, bao gồm cả <strong>Google</strong>, có thể sử dụng cookie (như cookie DART) để phân phối quảng cáo dựa trên các lượt truy cập trước đây của người dùng vào trang web này hoặc các trang web khác trên Internet.
            </p>
            <p>
              Người dùng có thể chọn không tham gia việc sử dụng cookie DART cho quảng cáo dựa trên sở thích bằng cách truy cập Chính sách bảo mật của mạng nội dung và quảng cáo của Google tại:{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono"
              >
                https://policies.google.com/technologies/ads
              </a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-400" />
              4. Bảo Mật Thông Tin & Cam Kết Không Chia Sẻ
            </h2>
            <p>
              Chúng tôi cam kết không bán, trao đổi hoặc chuyển giao thông tin nhận dạng cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại phi pháp. Mọi thông tin đóng góp (tên người chia sẻ phim, ý kiến phản hồi) chỉ được hiển thị công khai khi có sự đồng ý của chính người dùng.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              5. Thay Đổi Chính Sách & Liên Hệ
            </h2>
            <p>
              Chính sách bảo mật này có thể được điều chỉnh theo thời gian để phù hợp với quy định mới của pháp luật hoặc chính sách của Google. Nếu bạn có bất kỳ câu hỏi nào liên quan đến quyền riêng tư, vui lòng liên hệ trực tiếp qua email: <strong>contact@phimcongdong.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};
