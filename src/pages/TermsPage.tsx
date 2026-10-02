import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { FileCheck, BookOpen, AlertCircle, ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Điều Khoản Sử Dụng (Terms of Service) | PHIMCONGDONG.COM"
        description="Các điều khoản và quy định sử dụng dịch vụ tại website PHIMCONGDONG.COM nhằm xây dựng môi trường giải trí văn minh, an toàn."
      />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-4">
            <FileCheck className="w-3.5 h-3.5" />
            <span>ĐIỀU KHOẢN DỊCH VỤ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Điều Khoản Sử Dụng Website
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Quy định chung áp dụng cho mọi cá nhân truy cập và sử dụng dịch vụ trên <strong>phimcongdong.com</strong>
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-6 text-gray-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              1. Chấp Thuận Điều Khoản
            </h2>
            <p>
              Bằng việc truy cập, duyệt xem phim hoặc đọc truyện chữ tại <strong>PHIMCONGDONG.COM</strong>, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản được quy định tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              2. Mục Đích Sử Dụng Dịch Vụ
            </h2>
            <p>
              Tất cả nội dung (thông tin phim, video trailer, bài viết tóm tắt, tiểu thuyết truyện chữ) được cung cấp hoàn toàn cho mục đích <strong>giải trí cá nhân và phi thương mại</strong>.
            </p>
            <p>
              Nghiêm cấm các hành vi: sử dụng công cụ tự động (bot, crawler, spider) để phá hoại máy chủ, khai thác lỗ hổng bảo mật, phát tán phần mềm độc hại hoặc sao chép nội dung nhằm mục đích thương mại phi pháp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              3. Quy Định Đóng Góp Của Hội Viên (User Content)
            </h2>
            <p>
              Người dùng chịu hoàn toàn trách nhiệm về tính chính xác và nguồn gốc của các đường link hoặc nội dung chia sẻ lên website. Nghiêm cấm chia sẻ các nội dung vi phạm thuần phong mỹ tục, đồi trụy 18+, kích động thù địch hoặc vi phạm pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            </p>
            <p>
              Ban quản trị có toàn quyền từ chối, chỉnh sửa hoặc xóa bỏ bất kỳ nội dung nào vi phạm mà không cần thông báo trước.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              4. Giới Hạn Trách Nhiệm
            </h2>
            <p>
              Chúng tôi luôn nỗ lực duy trì hệ thống hoạt động ổn định và an toàn. Tuy nhiên, website không đảm bảo dịch vụ sẽ không bao giờ bị gián đoạn do sự cố máy chủ bên thứ ba, bảo trì đường truyền quốc tế hoặc các yếu tố bất khả kháng.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};
