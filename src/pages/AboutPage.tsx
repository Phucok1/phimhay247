import React from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Film, BookOpen, Users, Shield, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Giới Thiệu Về PHIMCONGDONG.COM - Cổng Thông Tin Phim & Tủ Sách Điện Ảnh"
        description="Tìm hiểu về sứ mệnh, tầm nhìn và giá trị cộng đồng của PHIMCONGDONG.COM - Nơi kết nối những người đam mê điện ảnh và tiểu thuyết kiếm hiệp, tiên hiệp."
      />

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VỀ CHÚNG TÔI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Chào Mừng Đến Với <span className="text-gradient from-amber-400 via-orange-400 to-red-500">PHIMCONGDONG.COM</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Không gian phi lợi nhuận dành cho cộng đồng người yêu thích nghệ thuật thứ bảy, phim hoạt hình 3D và nguyên tác tiểu thuyết tiên hiệp, kiếm hiệp đặc sắc.
          </p>
        </div>

        {/* Nội dung bài viết chuẩn AdSense */}
        <div className="space-y-8 text-gray-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cinema-900/90 border border-cinema-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-white font-bold text-lg sm:text-xl">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <Film className="w-5 h-5" />
              </div>
              <h2>1. Sứ Mệnh & Tầm Nhìn</h2>
            </div>
            <p>
              Được thành lập với mục tiêu tạo nên một sân chơi giải trí lành mạnh, <strong>PHIMCONGDONG.COM</strong> hướng tới việc mang lại những giây phút thư giãn tuyệt vời nhất cho khán giả. Chúng tôi không chỉ tổng hợp, giới thiệu các tác phẩm điện ảnh xuất sắc từ kênh YouTube chính thức <em>@phimhay.momtiti</em> và các nền tảng mở, mà còn tạo điều kiện cho các hội viên tự do đóng góp những bộ phim hay mà mình sưu tầm được.
            </p>
            <p>
              Tất cả các nguồn phát video đều tuân thủ nghiêm ngặt chuẩn nhúng iframe công khai từ các nền tảng lưu trữ hợp pháp, không lưu trữ tệp tin vi phạm và tôn trọng tuyệt đối quyền tác giả.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cinema-900/90 border border-cinema-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-white font-bold text-lg sm:text-xl">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2>2. Tủ Sách Truyện Chữ Điện Ảnh</h2>
            </div>
            <p>
              Nhận thấy nhu cầu to lớn của khán giả muốn tìm hiểu sâu hơn về bối cảnh, tâm lý nhân vật và các tình tiết nguyên tác mà phim ảnh chưa thể truyền tải hết, chúng tôi đã phát triển chuyên mục <strong>Tủ Sách Truyện Chữ</strong>.
            </p>
            <p>
              Tại đây, độc giả có thể dễ dàng theo dõi các bộ tiểu thuyết kinh điển như <em>Lưu Ly Kiếm Tông, Phàm Nhân Tu Tiên, Đấu Phá Thương Khung...</em> với giao diện đọc sách hiện đại, tùy biến cỡ chữ, màu nền đọc đêm chống mỏi mắt.
            </p>
          </div>

          {/* Section 3: Giá trị cốt lõi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-cinema-900/60 border border-cinema-800 text-center space-y-2">
              <Users className="w-8 h-8 text-blue-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Cộng Đồng Gắn Kết</h3>
              <p className="text-xs text-gray-400">
                Lắng nghe ý kiến của từng khán giả, hỗ trợ hội viên chia sẻ những bộ phim yêu thích của mình.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cinema-900/60 border border-cinema-800 text-center space-y-2">
              <Shield className="w-8 h-8 text-green-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Minh Bạch & Tôn Trọng</h3>
              <p className="text-xs text-gray-400">
                Tuân thủ quy định pháp luật về bản quyền số DMCA, bảo vệ quyền riêng tư người dùng tối đa.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cinema-900/60 border border-cinema-800 text-center space-y-2">
              <Heart className="w-8 h-8 text-red-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Trải Nghiệm Miễn Phí</h3>
              <p className="text-xs text-gray-400">
                Cung cấp nội dung hoàn toàn miễn phí, mang niềm vui giải trí tới mọi người mọi nhà.
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-6 text-center flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition shadow-lg shadow-red-950/40"
            >
              Xem Phim Ngay
            </Link>
            <Link
              to="/truyen"
              className="px-6 py-3 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-amber-300 font-bold text-sm transition border border-amber-500/30"
            >
              Khám Phá Tủ Sách Truyện Chữ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
