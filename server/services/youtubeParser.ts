/**
 * Bộ bóc tách Video URL hỗ trợ cả YouTube & Facebook Reels / Facebook Video:
 * 1. YouTube:
 *    - youtube.com/watch?v=VIDEO_ID
 *    - youtu.be/VIDEO_ID
 *    - youtube.com/shorts/VIDEO_ID
 *    - youtube.com/embed/VIDEO_ID
 *    - youtube.com/live/VIDEO_ID
 * 2. Facebook:
 *    - facebook.com/reel/ID
 *    - facebook.com/watch/?v=ID
 *    - fb.watch/ID
 *    - facebook.com/share/r/ID
 *    - facebook.com/share/v/ID
 *    - facebook.com/.../videos/ID
 */

export interface ParsedVideoInfo {
  videoId: string;
  videoType: 'youtube' | 'facebook';
  embedUrl: string;
  thumbnailUrl: string;
  watchUrl: string;
  originalUrl: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube|youtube-nocookie)\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  return null;
}

export function isFacebookVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    /facebook\.com\/(?:reel|watch|share|videos|\w+\/videos)/i.test(trimmed) ||
    /fb\.watch\//i.test(trimmed)
  );
}

export function parseYouTubeUrl(url: string): { success: true; data: ParsedVideoInfo } | { success: false; error: string } {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Đường dẫn video không được để trống.' };
  }

  const trimmed = url.trim();

  // 1. Kiểm tra nếu là Facebook Reel hoặc Facebook Video
  if (isFacebookVideoUrl(trimmed)) {
    // Trích xuất ID nếu có
    const fbReelMatch = trimmed.match(/(?:reel|videos|v=|\/r\/|\/v\/)([0-9]+)/i);
    const fbId = fbReelMatch ? fbReelMatch[1] : `fb-${Date.now()}`;
    const cleanFbUrl = trimmed.split('?')[0];

    return {
      success: true,
      data: {
        videoId: fbId,
        videoType: 'facebook',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&autoplay=1`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 2. Kiểm tra nếu là YouTube Video
  const videoId = extractYouTubeVideoId(trimmed);
  if (!videoId) {
    return {
      success: false,
      error: 'Link video không hợp lệ. Hệ thống hỗ trợ link YouTube (watch, youtu.be, shorts) và link Facebook Reels / Video.',
    };
  }

  return {
    success: true,
    data: {
      videoId,
      videoType: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      originalUrl: trimmed,
    },
  };
}

export function extractYouTubePlaylistId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}
