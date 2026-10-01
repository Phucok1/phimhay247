import React, { useState } from 'react';
import { ExternalLink, AlertCircle, RefreshCw, Play } from 'lucide-react';

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
  const [reloadKey, setReloadKey] = useState(0);

  const checkUrl = (customWatchUrl || customEmbedUrl || '').toLowerCase();

  const isDirect =
    /\.(mp4|m3u8|webm|ogg)(?:\?.*)?$/i.test(checkUrl) ||
    videoId.startsWith('direct-');

  const isFacebook =
    checkUrl.includes('facebook.com') ||
    checkUrl.includes('fb.watch') ||
    videoId.startsWith('fb-');

  const isOkRu =
    checkUrl.includes('ok.ru') ||
    videoId.startsWith('ok-');

  const isGDrive =
    checkUrl.includes('drive.google.com') ||
    videoId.startsWith('gdrive-');

  const isArchive =
    checkUrl.includes('archive.org') ||
    videoId.startsWith('archive-');

  const isDoodStream =
    checkUrl.includes('doodstream') ||
    checkUrl.includes('dood.') ||
    checkUrl.includes('doods.');

  const isStreamWish =
    checkUrl.includes('streamwish') ||
    checkUrl.includes('wishembed');

  const isDailymotion =
    checkUrl.includes('dailymotion') ||
    checkUrl.includes('dai.ly');

  const isStreamTape = checkUrl.includes('streamtape');

  const [useNoCookie, setUseNoCookie] = useState(false);

  const isYouTube =
    !isDirect &&
    !isFacebook &&
    !isOkRu &&
    !isGDrive &&
    !isArchive &&
    !isDoodStream &&
    !isStreamWish &&
    !isDailymotion &&
    !isStreamTape;

  // URL phát video
  let embedUrl = customEmbedUrl;
  if (!embedUrl) {
    if (isFacebook) {
      embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        customWatchUrl || ''
      )}&show_text=0&autoplay=1`;
    } else if (isOkRu) {
      embedUrl = `https://ok.ru/videoembed/${videoId}`;
    } else if (isGDrive) {
      embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
    } else if (isArchive) {
      embedUrl = `https://archive.org/embed/${videoId}`;
    } else if (isDoodStream) {
      embedUrl = `https://doodstream.com/e/${videoId}`;
    } else if (isStreamWish) {
      embedUrl = `https://streamwish.to/e/${videoId}`;
    } else if (isDailymotion) {
      embedUrl = `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`;
    } else if (isDirect) {
      embedUrl = customWatchUrl || '';
    } else {
      const ytDomain = useNoCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
      embedUrl = `https://${ytDomain}/embed/${videoId}?autoplay=${
        autoplay ? 1 : 0
      }&rel=0&playsinline=1&modestbranding=1`;
    }
  }

  // URL xem gốc
  const directWatchUrl =
    customWatchUrl ||
    (isFacebook
      ? 'https://www.facebook.com/watch'
      : isOkRu
      ? `https://ok.ru/video/${videoId}`
      : isGDrive
      ? `https://drive.google.com/file/d/${videoId}/view`
      : isArchive
      ? `https://archive.org/details/${videoId}`
      : isDoodStream
      ? `https://doodstream.com/d/${videoId}`
      : isStreamWish
      ? `https://streamwish.to/${videoId}`
      : isDailymotion
      ? `https://www.dailymotion.com/video/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`);

  let platformName = 'YouTube HD Player';
  let badgeColor = 'bg-red-500';
  let btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-900/40 text-red-400 border-red-500/30';
  let platformLabel = 'YouTube';

  if (isDirect) {
    platformName = 'Direct HTML5 Video';
    badgeColor = 'bg-amber-500';
    btnColor = 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/40 text-amber-400 border-amber-500/30';
    platformLabel = 'Video Gốc';
  } else if (isOkRu) {
    platformName = 'Ok.ru (Không Giới Hạn, Tối Đa 32GB)';
    badgeColor = 'bg-orange-500';
    btnColor = 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/40 text-orange-400 border-orange-500/30';
    platformLabel = 'Ok.ru';
  } else if (isGDrive) {
    platformName = 'Google Drive HD (15GB/acc)';
    badgeColor = 'bg-blue-500';
    btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40 text-blue-400 border-blue-500/30';
    platformLabel = 'Google Drive';
  } else if (isArchive) {
    platformName = 'Internet Archive (Vĩnh Viễn)';
    badgeColor = 'bg-teal-500';
    btnColor = 'bg-teal-600 hover:bg-teal-700 shadow-teal-900/40 text-teal-400 border-teal-500/30';
    platformLabel = 'Archive.org';
  } else if (isDoodStream) {
    platformName = 'DoodStream (Không Giới Hạn)';
    badgeColor = 'bg-purple-500';
    btnColor = 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/40 text-purple-400 border-purple-500/30';
    platformLabel = 'DoodStream';
  } else if (isStreamWish) {
    platformName = 'StreamWish (Không Giới Hạn)';
    badgeColor = 'bg-emerald-500';
    btnColor = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/40 text-emerald-400 border-emerald-500/30';
    platformLabel = 'StreamWish';
  } else if (isFacebook) {
    platformName = 'Facebook Reel / Video';
    badgeColor = 'bg-blue-500';
    btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40 text-blue-400 border-blue-500/30';
    platformLabel = 'Facebook';
  } else if (isDailymotion) {
    platformName = 'Dailymotion Player';
    badgeColor = 'bg-sky-500';
    btnColor = 'bg-sky-600 hover:bg-sky-700 shadow-sky-900/40 text-sky-400 border-sky-500/30';
    platformLabel = 'Dailymotion';
  } else if (isStreamTape) {
    platformName = 'StreamTape Player';
    badgeColor = 'bg-indigo-500';
    btnColor = 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40 text-indigo-400 border-indigo-500/30';
    platformLabel = 'StreamTape';
  }

  const handleReload = () => {
    setHasError(false);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="w-full">
      {/* Khung 16:9 responsive chuẩn */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-cinema-800">
        {!hasError ? (
          isDirect ? (
            <video
              key={reloadKey}
              src={embedUrl}
              controls
              autoPlay={autoplay}
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-black"
              onError={() => setHasError(true)}
            />
          ) : (
            <iframe
              key={`${reloadKey}-${useNoCookie ? 'nocookie' : 'standard'}`}
              src={embedUrl}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setHasError(true)}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-cinema-900/95">
            <AlertCircle className="w-14 h-14 text-amber-400 mb-3 animate-pulse" />
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
              Không thể phát trực tiếp video này trên website
            </h3>
            <p className="text-gray-300 text-sm max-w-md mb-5 leading-relaxed">
              Video này có thể bị giới hạn quyền nhúng trình phát hoặc máy chủ video cần mở trực tiếp. Bạn có thể mở nguồn video gốc để xem ngay!
            </p>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition shadow-lg ${
                  btnColor.split(' ')[0]
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                Mở xem trên {platformLabel}
              </a>
              {isYouTube && (
                <button
                  onClick={() => {
                    setUseNoCookie(!useNoCookie);
                    setHasError(false);
                    setReloadKey((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition text-sm shadow-lg shadow-amber-950/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đổi sang {useNoCookie ? 'Server YouTube Chuẩn' : 'Server YouTube Dự Phòng'}</span>
                </button>
              )}
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
          <span className={`inline-block w-2.5 h-2.5 rounded-full animate-ping ${badgeColor}`} />
          <span className="font-medium text-gray-300">{platformName}</span>
          {isYouTube && (
            <button
              onClick={() => {
                setUseNoCookie(!useNoCookie);
                setReloadKey((prev) => prev + 1);
              }}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-cinema-850 hover:bg-cinema-800 text-amber-300 border border-cinema-700 transition"
              title="Nhấn để đổi máy chủ phát nếu gặp lỗi"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{useNoCookie ? 'Đang dùng No-Cookie' : 'Đang dùng YouTube HD'}</span>
            </button>
          )}
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition text-xs font-medium border bg-cinema-850 hover:bg-cinema-800 ${
              btnColor.includes('text-') ? btnColor.match(/text-\w+-\d+/)?.[0] : 'text-gray-300'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem nguồn gốc ({platformLabel})
          </a>
        </div>
      </div>
    </div>
  );
};
