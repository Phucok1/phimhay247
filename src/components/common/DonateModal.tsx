import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Youtube,
  Sparkles,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { fetchPublicSettings } from '../../services/api';
import { SiteSettings } from '../../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPublicSettings()
        .then(setSettings)
        .catch((err) => console.error('Lỗi tải cấu hình donate:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bankName = settings?.donateBankName || 'MB Bank';
  const accountNumber = settings?.donateAccountNumber || '';
  const accountName = settings?.donateAccountName || 'PHIM HAY 247';
  const momoNumber = settings?.donateMomo || '';
  const donateNote = settings?.donateNote || 'Ủng hộ duy trì server và phát triển kênh Phim Hay 247';

  // Tạo link VietQR tự động nếu có số tài khoản
  const qrImage =
    settings?.donateQrUrl ||
    (accountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${encodeURIComponent(
          accountNumber
        )}-compact2.png?amount=&addInfo=${encodeURIComponent('Ung ho PhimHay247')}&accountName=${encodeURIComponent(
          accountName
        )}`
      : null);

  const handleCopy = (text: string, type: 'account' | 'momo') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedMomo(true);
      setTimeout(() => setCopiedMomo(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cinema-900 border border-cinema-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-cinema-800 flex items-center justify-between bg-gradient-to-r from-rose-950/60 via-cinema-950/80 to-cinema-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-950/40">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Ủng Hộ &amp; Donate Kênh
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Cảm ơn bạn!
                </span>
              </h3>
              <p className="text-xs text-gray-400">Đồng hành tiếp lửa cho đội ngũ Phim Hay 247</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-cinema-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Lời cảm ơn */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 to-cinema-950 border border-rose-900/30 text-xs text-gray-300 leading-relaxed space-y-2">
            <p className="flex items-center gap-1.5 text-rose-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tiếp thêm động lực cho kênh!</span>
            </p>
            <p>
              Mọi sự đóng góp của bạn là nguồn kinh phí quý báu giúp chúng tôi chi trả máy chủ, duy trì website hoạt động ổn định, sưu tầm thêm nhiều phim hiếm và nâng cấp chất lượng phát trực tuyến hoàn toàn miễn phí cho cộng đồng!
            </p>
          </div>

          {/* Phương thức 1: Chuyển khoản ngân hàng & VietQR */}
          <div className="p-4 rounded-2xl bg-cinema-950 border border-cinema-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Chuyển khoản Ngân Hàng (VietQR)</span>
            </div>

            {accountNumber ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {qrImage && (
                  <div className="p-2 bg-white rounded-xl shadow-md flex-shrink-0">
                    <img
                      src={qrImage}
                      alt="VietQR Donate"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                )}
                <div className="space-y-2 text-xs flex-grow w-full">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Ngân hàng:</span>
                    <span className="font-bold text-white text-sm">{bankName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Số tài khoản:</span>
                    <div className="flex items-center justify-between gap-2 bg-cinema-900 p-2 rounded-xl border border-cinema-700">
                      <span className="font-mono font-bold text-amber-300 text-sm tracking-wide">
                        {accountNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(accountNumber, 'account')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-200 text-xs transition"
                      >
                        {copiedAccount ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400 font-semibold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Chủ tài khoản:</span>
                    <span className="font-semibold text-white uppercase">{accountName}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-cinema-900/60 rounded-xl border border-cinema-800 text-xs text-gray-400 space-y-2 text-center py-4">
                <QrCode className="w-8 h-8 text-amber-400/80 mx-auto" />
                <p>
                  Thông tin số tài khoản đang được Admin cập nhật. Bạn có thể ủng hộ kênh bằng cách Đăng ký kênh YouTube bên dưới!
                </p>
                <p className="text-[11px] text-gray-500">
                  (Admin có thể cài đặt số tài khoản của mình trong mục <strong className="text-gray-300">Cài đặt hệ thống</strong>).
                </p>
              </div>
            )}
          </div>

          {/* Phương thức 2: Ví MoMo (nếu có) */}
          {momoNumber && (
            <div className="p-4 rounded-2xl bg-cinema-950 border border-cinema-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Ví điện tử MoMo:</span>
                  <span className="font-bold text-white font-mono text-sm">{momoNumber}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopy(momoNumber, 'momo')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cinema-800 hover:bg-cinema-700 text-gray-200 text-xs transition"
              >
                {copiedMomo ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400 font-semibold">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Phương thức 3: Ủng hộ bằng cách Đăng ký YouTube */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-cinema-950 to-cinema-950 border border-red-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/50 flex-shrink-0">
                <Youtube className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Đăng Ký Kênh YouTube</h4>
                <p className="text-[11px] text-gray-400">Bấm Theo Dõi &amp; Like video là sự ủng hộ vô cùng to lớn!</p>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@phimhay.momtiti?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-950 flex-shrink-0"
            >
              <span>Đăng ký</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cinema-800 bg-cinema-950 text-center">
          <p className="text-xs text-gray-400">
            Trân trọng cảm ơn mọi sự đóng góp và tình cảm của các bạn dành cho{' '}
            <span className="text-red-400 font-semibold">Phim Hay 247</span>! ❤️
          </p>
        </div>
      </div>
    </div>
  );
};
