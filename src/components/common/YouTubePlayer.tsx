import React, { useState } from 'react';
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title = 'YouTube Video Player',
  autoplay = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${
    autoplay ? 1 : 0
  }&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

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
              Video này có thể bị YouTube giới hạn độ tuổi, hạn chế nhúng hoặc chủ kênh chưa bật quyền phát ngoài YouTube.
              Bạn có thể xem video gốc mượt mà trực tiếp trên YouTube!
            </p>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg shadow-red-900/40"
              >
                <ExternalLink className="w-4 h-4" />
                Xem trên YouTube
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

      {/* Thanh điều khiển phụ & nút mở YouTube */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span>YouTube Privacy-Enhanced Player (IFrame)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasError(!hasError)}
            className="text-xs text-gray-400 hover:text-amber-400 transition underline underline-offset-4"
          >
            {hasError ? 'Thử mở lại player' : 'Báo video bị chặn nhúng?'}
          </button>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 transition text-xs font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem trên YouTube
          </a>
        </div>
      </div>
    </div>
  );
};
