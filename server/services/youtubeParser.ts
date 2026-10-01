/**
 * Bộ bóc tách đa nền tảng Video (Universal Video Parser):
 * Hỗ trợ tất cả các nền tảng video lớn không giới hạn:
 * 1. YouTube (watch, youtu.be, shorts, embed, live)
 * 2. Facebook (Reels, Watch, Videos, fb.watch)
 * 3. DoodStream (doodstream.com, dood.to, doods.pro...) - Lưu trữ không giới hạn miễn phí
 * 4. StreamWish (streamwish.to, streamwish.com, wishembed...) - Lưu trữ không giới hạn miễn phí
 * 5. Dailymotion (dailymotion.com, dai.ly)
 * 6. StreamTape (streamtape.com)
 * 7. Direct MP4 / M3U8 / WebM
 * 8. Bất kỳ link Embed iframe hợp lệ nào
 */

export type VideoPlatform =
  | 'youtube'
  | 'facebook'
  | 'gdrive'
  | 'okru'
  | 'archive'
  | 'doodstream'
  | 'streamwish'
  | 'dailymotion'
  | 'streamtape'
  | 'direct'
  | 'embed';

export interface ParsedVideoInfo {
  videoId: string;
  videoType: VideoPlatform;
  platformName: string;
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

export function parseYouTubeUrl(url: string): { success: true; data: ParsedVideoInfo } | { success: false; error: string } {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Đường dẫn video không được để trống.' };
  }

  const trimmed = url.trim();

  // 1. YouTube
  const ytId = extractYouTubeVideoId(trimmed);
  if (ytId) {
    return {
      success: true,
      data: {
        videoId: ytId,
        videoType: 'youtube',
        platformName: 'YouTube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        watchUrl: `https://www.youtube.com/watch?v=${ytId}`,
        originalUrl: trimmed,
      },
    };
  }

  // 2. Facebook Reels & Videos
  if (
    /facebook\.com\/(?:reel|watch|share|videos|\w+\/videos)/i.test(trimmed) ||
    /fb\.watch\//i.test(trimmed)
  ) {
    const fbReelMatch = trimmed.match(/(?:reel|videos|v=|\/r\/|\/v\/)([0-9]+)/i);
    const fbId = fbReelMatch ? fbReelMatch[1] : `fb-${Date.now()}`;
    return {
      success: true,
      data: {
        videoId: fbId,
        videoType: 'facebook',
        platformName: 'Facebook Reel',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&autoplay=1`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 3. Ok.ru (Odnoklassniki) - KHÔNG GIỚI HẠN DUNG LƯỢNG (Lên tới 32GB/file, vĩnh viễn, không bản quyền)
  const okMatch = trimmed.match(/(?:ok\.ru\/(?:video|videoembed)\/)([0-9]+)/i);
  if (okMatch) {
    const okId = okMatch[1];
    return {
      success: true,
      data: {
        videoId: okId,
        videoType: 'okru',
        platformName: 'Ok.ru (Không Giới Hạn)',
        embedUrl: `https://ok.ru/videoembed/${okId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: `https://ok.ru/video/${okId}`,
        originalUrl: trimmed,
      },
    };
  }

  // 4. Google Drive (drive.google.com) - 15GB Miễn phí / Tài khoản Gmail, tốc độ cực nhanh
  const gdriveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch) {
    const gdriveId = gdriveMatch[1];
    return {
      success: true,
      data: {
        videoId: gdriveId,
        videoType: 'gdrive',
        platformName: 'Google Drive HD (15GB Free)',
        embedUrl: `https://drive.google.com/file/d/${gdriveId}/preview`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
        watchUrl: `https://drive.google.com/file/d/${gdriveId}/view`,
        originalUrl: trimmed,
      },
    };
  }

  // 5. Internet Archive (archive.org) - KHÔNG GIỚI HẠN DUNG LƯỢNG & Vĩnh Viễn
  const archiveMatch = trimmed.match(/(?:archive\.org\/(?:details|embed)\/)([a-zA-Z0-9_.-]+)/i);
  if (archiveMatch) {
    const archiveId = archiveMatch[1];
    return {
      success: true,
      data: {
        videoId: archiveId,
        videoType: 'archive',
        platformName: 'Archive.org (Vĩnh Viễn)',
        embedUrl: `https://archive.org/embed/${archiveId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: `https://archive.org/details/${archiveId}`,
        originalUrl: trimmed,
      },
    };
  }

  // 6. DoodStream (doodstream.com, dood.to, dood.so, doods.pro...)
  const doodMatch = trimmed.match(/(?:dood(?:stream)?\.(?:to|com|so|la|ws|pro|watch)\/(?:d|e)\/)([a-zA-Z0-9]+)/i);
  if (doodMatch) {
    const doodId = doodMatch[1];
    return {
      success: true,
      data: {
        videoId: doodId,
        videoType: 'doodstream',
        platformName: 'DoodStream (Unlimited)',
        embedUrl: `https://doodstream.com/e/${doodId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 4. StreamWish (streamwish.to, streamwish.com, wishembed.pro...)
  const wishMatch = trimmed.match(/(?:streamwish\.(?:to|com|site|top)|wishembed\.(?:pro|to))\/(?:e\/)?([a-zA-Z0-9]+)/i);
  if (wishMatch) {
    const wishId = wishMatch[1];
    return {
      success: true,
      data: {
        videoId: wishId,
        videoType: 'streamwish',
        platformName: 'StreamWish (Unlimited)',
        embedUrl: `https://streamwish.to/e/${wishId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 5. Dailymotion (dailymotion.com/video/..., dai.ly/...)
  const dmMatch = trimmed.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dmMatch) {
    const dmId = dmMatch[1];
    return {
      success: true,
      data: {
        videoId: dmId,
        videoType: 'dailymotion',
        platformName: 'Dailymotion',
        embedUrl: `https://www.dailymotion.com/embed/video/${dmId}?autoplay=1`,
        thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${dmId}`,
        watchUrl: `https://www.dailymotion.com/video/${dmId}`,
        originalUrl: trimmed,
      },
    };
  }

  // 6. StreamTape (streamtape.com)
  const tapeMatch = trimmed.match(/(?:streamtape\.com\/(?:v|e)\/)([a-zA-Z0-9]+)/i);
  if (tapeMatch) {
    const tapeId = tapeMatch[1];
    return {
      success: true,
      data: {
        videoId: tapeId,
        videoType: 'streamtape',
        platformName: 'StreamTape',
        embedUrl: `https://streamtape.com/e/${tapeId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 7. Direct MP4 / M3U8 / WebM Link
  if (/\.(mp4|m3u8|webm|ogg)(?:\?.*)?$/i.test(trimmed)) {
    return {
      success: true,
      data: {
        videoId: `direct-${Date.now()}`,
        videoType: 'direct',
        platformName: 'Direct Video (MP4)',
        embedUrl: trimmed,
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  // 8. Bất kỳ đường link HTTP / HTTPS hợp lệ nào khác (Hỗ trợ linh hoạt cho các server khác)
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      success: true,
      data: {
        videoId: `embed-${Date.now()}`,
        videoType: 'embed',
        platformName: 'External Player',
        embedUrl: trimmed,
        thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
        watchUrl: trimmed,
        originalUrl: trimmed,
      },
    };
  }

  return {
    success: false,
    error: 'Link video không hợp lệ. Vui lòng cung cấp link YouTube, Facebook Reels, DoodStream, StreamWish, Dailymotion hoặc link video trực tiếp.',
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
