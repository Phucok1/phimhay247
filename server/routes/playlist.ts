import { Router, Request, Response } from 'express';
import axios from 'axios';
import { db } from '../services/database.js';
import { extractYouTubePlaylistId } from '../services/youtubeParser.js';

const router = Router();

// POST /api/playlist/fetch
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { playlistUrl } = req.body;
    if (!playlistUrl) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp URL YouTube Playlist.' });
    }

    const playlistId = extractYouTubePlaylistId(playlistUrl);
    if (!playlistId) {
      return res.status(400).json({
        success: false,
        error: 'Không tìm thấy ID Playlist từ URL. Link đúng có dạng: https://www.youtube.com/playlist?list=PL...',
      });
    }

    // Lấy API key từ settings hoặc env
    const settings = db.getSettings();
    const apiKey = settings.youtubeApiKey || process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        needApiKey: true,
        playlistId,
        error:
          'Chưa cấu hình YouTube Data API Key. Bạn có thể vào mục "Cài đặt & API" trong Admin để nhập API Key (miễn phí từ Google Cloud Console), hoặc dùng tính năng "Nhập nhiều tập" dán link trực tiếp.',
      });
    }

    // Gọi YouTube Data API v3
    let allItems: any[] = [];
    let nextPageToken = '';
    let pageCount = 0;

    do {
      pageCount++;
      const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${
        nextPageToken ? `&pageToken=${nextPageToken}` : ''
      }`;

      const ytRes = await axios.get(ytUrl);
      const items = ytRes.data.items || [];
      allItems = allItems.concat(items);
      nextPageToken = ytRes.data.nextPageToken || '';
    } while (nextPageToken && pageCount < 10); // Hỗ trợ tối đa 500 video mỗi playlist

    // Chuyển đổi định dạng cho frontend preview
    let episodeCounter = 1;
    const formattedEpisodes = allItems
      .filter((item: any) => {
        const title = item.snippet?.title || '';
        return title !== 'Private video' && title !== 'Deleted video';
      })
      .map((item: any) => {
        const videoId = item.snippet?.resourceId?.videoId;
        const title = item.snippet?.title || `Tập ${episodeCounter}`;
        const thumbs = item.snippet?.thumbnails;
        const thumbnailUrl =
          thumbs?.maxres?.url || thumbs?.standard?.url || thumbs?.high?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const ep = {
          selected: true,
          episodeNumber: episodeCounter,
          title: title,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
          youtubeVideoId: videoId,
          youtubeEmbedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
          thumbnailUrl,
        };
        episodeCounter++;
        return ep;
      });

    res.json({
      success: true,
      data: {
        playlistId,
        totalItems: formattedEpisodes.length,
        episodes: formattedEpisodes,
      },
    });
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    res.status(400).json({
      success: false,
      error: `Lỗi kết nối YouTube API: ${errorMsg}. Vui lòng kiểm tra lại YouTube API Key hoặc quyền truy cập của Playlist.`,
    });
  }
});

export default router;
