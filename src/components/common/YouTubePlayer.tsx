import React, { useState } from 'react';
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  embedUrl?: string;
  watchUrl?: string;
  title?: string;
  autoplay?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  embedUrl: customEmbedUrl,
  watchUrl: customWatchUrl,
  title = 'Video Player',
  autoplay = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const isFacebook =
    (customWatchUrl && customWatchUrl.includes('facebook.com')) ||
    (customWatchUrl && customWatchUrl.includes('fb.watch')) ||
    (customEmbedUrl && customEmbedUrl.includes('facebook.com')) ||
    videoId.startsWith('fb-');

  // URL phát video
  let embedUrl = customEmbedUrl;
  if (!embedUrl) {
    if (isFacebook) {
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        customWatchUrl || ''
      )}&show_text=0&autoplay=1`;
    } else {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${
        autoplay ? 1 : 0
      }&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
    }
  }

  // URL xem gốc
  const directWatchUrl =
    customWatchUrl ||
    (isFacebook ? `https://www.facebook.com/watch` : `https://www.youtube.com/watch?v=${videoId}`);

  const platformName = isFacebook ? 'Facebook Reel / Video' : 'YouTube IFrame Player';

  const handleReload = () => {
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      {/* Khung 16:9 responsive chuẩn */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-cinema-800">
        {!hasError ? (
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-cinema-900/95">
            <AlertCircle className="w-14 h-14 text-amber-400 mb-3 animate-pulse" />
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
              Không thể phát trực tiếp video này trên website
            </h3>
            <p className="text-gray-300 text-sm max-w-md mb-5 leading-relaxed">
              Video này có thể bị giới hạn quyền nhúng hoặc cần đăng nhập để xem. Bạn có thể mở video gốc để xem trực tiếp!
            </p>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition shadow-lg ${
                  isFacebook ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40' : 'bg-red-600 hover:bg-red-700 shadow-red-900/40'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                Xem trên {isFacebook ? 'Facebook' : 'YouTube'}
              </a>
              <button
                onClick={handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cinema-800 hover:bg-cinema-700 text-gray-200 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Thử tải lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thanh điều khiển phụ & nút mở video gốc */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full animate-ping ${isFacebook ? 'bg-blue-500' : 'bg-green-500'}`} />
          <span>{platformName}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasError(!hasError)}
            className="text-xs text-gray-400 hover:text-amber-400 transition underline underline-offset-4"
          >
            {hasError ? 'Thử mở lại player' : 'Báo video bị chặn?'}
          </button>

          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-xs font-medium border ${
              isFacebook
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border-blue-500/30'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border-red-500/30'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem trên {isFacebook ? 'Facebook' : 'YouTube'}
          </a>
        </div>
      </div>
    </div>
  );
};
