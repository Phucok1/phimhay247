import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { ShieldAlert, AlertTriangle, Mail, CheckCircle } from 'lucide-react';

export const DMCAPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Chính Sách Bản Quyền & Tuyên Bố DMCA | PHIMCONGDONG.COM"
        description="Quy trình thông báo và xử lý vi phạm bản quyền số (Digital Millennium Copyright Act - DMCA) tại website PHIMCONGDONG.COM."
      />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>QUYỀN TÁC GIẢ & DMCA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Tuyên Bố Bản Quyền & Khiếu Nại DMCA
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Cam kết tuân thủ Đạo luật Bản quyền Thiên niên kỷ Kỹ thuật số (DMCA) và tôn trọng quyền sở hữu trí tuệ
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-2xl bg-cinema-900 border border-cinema-800 shadow-xl space-y-6 text-gray-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              1. Tuyên Bố Miễn Trừ Trách Nhiệm Lưu Trữ
            </h2>
            <p>
              Website <strong>PHIMCONGDONG.COM</strong> hoạt động như một công cụ tìm kiếm, tổng hợp và cung cấp cổng thông tin đánh giá điện ảnh, tiểu thuyết.
            </p>
            <p>
              Chúng tôi <strong>KHÔNG</strong> tải lên, lưu trữ trực tiếp bất kỳ tệp tin video hoặc phương tiện có bản quyền nào trên máy chủ riêng của mình. Tất cả các nội dung video được dẫn link hoặc nhúng mã phát công khai từ các máy chủ bên thứ ba (như YouTube, Google Drive, Dailymotion...) thông qua giao diện lập trình mở (API).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              2. Cam Kết Xử Lý Khiếu Nại Bản Quyền
            </h2>
            <p>
              Chúng tôi luôn tôn trọng quyền sở hữu trí tuệ của các tác giả, đạo diễn và đơn vị sản xuất phim. Nếu bạn là chủ sở hữu hợp pháp của bất kỳ tác phẩm nào và cho rằng nội dung trên website vi phạm quyền tác giả của bạn, chúng tôi sẽ phối hợp gỡ bỏ ngay lập tức theo đúng quy trình DMCA.
            </p>
          </section>

          <section className="space-y-3 p-5 rounded-xl bg-cinema-950/80 border border-cinema-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              3. Quy Trình Gửi Yêu Cầu Gỡ Bỏ (Take-down Notice)
            </h3>
            <p className="text-xs text-gray-300">
              Vui lòng gửi email khiếu nại tới địa chỉ: <strong className="text-primary font-mono">contact@phimcongdong.com</strong> kèm theo các thông tin sau:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
              <li>Họ tên, tổ chức và thông tin liên hệ của chủ sở hữu bản quyền hoặc người đại diện hợp pháp.</li>
              <li>Đường dẫn (URL) cụ thể của tác phẩm có bản quyền bị vi phạm trên website của chúng tôi.</li>
              <li>Bằng chứng chứng minh quyền sở hữu hoặc giấy ủy quyền hợp pháp.</li>
              <li>Lời tuyên thệ rằng thông tin trong thông báo là hoàn toàn xác thực dưới hình phạt khai man.</li>
            </ul>
            <p className="text-xs text-amber-300 font-semibold pt-1">
              👉 Sau khi nhận được thông báo hợp lệ, ban quản trị cam kết sẽ rà soát và gỡ bỏ toàn bộ đường liên kết liên quan trong vòng 24 - 48 giờ làm việc!
            </p>
          </section>
        </div>
      </div>
    </>
  );
};
