/**
 * Bộ bóc tách YouTube Video ID chuẩn xác hỗ trợ:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/live/VIDEO_ID
 * Bỏ qua query params dư thừa (?t=, &si=, &feature=, ...)
 */

export interface ParsedYouTubeInfo {
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  watchUrl: string;
  originalUrl: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Kiểm tra nếu người dùng chỉ nhập trực tiếp 11 ký tự Video ID (ví dụ dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex toàn diện cho tất cả các định dạng YouTube
  const patterns = [
    // Standard watch URL: youtube.com/watch?v=ID hoặc youtube.com/watch?feature=...&v=ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    // Short URL: youtu.be/ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    // Shorts: youtube.com/shorts/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    // Embed: youtube.com/embed/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube|youtube-nocookie)\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    // Live: youtube.com/live/ID
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    // Generic v/ path: youtube.com/v/ID
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

export function parseYouTubeUrl(url: string): { success: true; data: ParsedYouTubeInfo } | { success: false; error: string } {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return {
      success: false,
      error: 'Link YouTube không hợp lệ. Vui lòng kiểm tra lại định dạng link (watch, youtu.be, shorts, live hoặc embed).',
    };
  }

  return {
    success: true,
    data: {
      videoId,
      // Sử dụng miền youtube-nocookie để tăng cường quyền riêng tư theo yêu cầu
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      originalUrl: url.trim(),
    },
  };
}

/**
 * Trích xuất Playlist ID từ URL
 * Ví dụ: https://www.youtube.com/playlist?list=PL1234567890
 */
export function extractYouTubePlaylistId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}
