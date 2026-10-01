import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';
import { parseYouTubeUrl } from '../services/youtubeParser.js';

const router = Router();

// POST /api/episodes/parse-url (Kiểm tra và bóc tách YouTube link)
router.post('/parse-url', (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp URL video (YouTube, Facebook, DoodStream, StreamWish, MP4...).' });
    }

    const result = parseYouTubeUrl(url);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/episodes (Lấy danh sách tập theo movieId)
router.get('/', (req: Request, res: Response) => {
  try {
    const { movieId } = req.query;
    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Thiếu tham số movieId.' });
    }

    const episodes = db.getEpisodesByMovieId(String(movieId));
    res.json({ success: true, data: episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/episodes/:movieId/:episodeNumber
router.get('/:movieId/:episodeNumber', (req: Request, res: Response) => {
  try {
    const { movieId, episodeNumber } = req.params;
    const epNum = parseInt(episodeNumber, 10);

    const episode = db.getEpisodeByNumber(movieId, epNum);
    if (!episode) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tập phim này.' });
    }

    const movie = db.getMovieById(movieId);
    const allEpisodes = db.getEpisodesByMovieId(movieId);

    // Tìm tập trước và tập sau
    const currentIdx = allEpisodes.findIndex((e) => e.episodeNumber === epNum);
    const prevEpisode = currentIdx > 0 ? allEpisodes[currentIdx - 1] : null;
    const nextEpisode = currentIdx < allEpisodes.length - 1 ? allEpisodes[currentIdx + 1] : null;

    res.json({
      success: true,
      data: {
        episode,
        movie,
        allEpisodes,
        prevEpisode,
        nextEpisode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/episodes (Thêm 1 tập)
router.post('/', (req: Request, res: Response) => {
  try {
    const { movieId, episodeNumber, title, youtubeUrl, customThumbnail } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bộ phim (movieId).' });
    }
    if (!youtubeUrl) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp link video.' });
    }

    const parsed = parseYouTubeUrl(youtubeUrl);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error });
    }

    const ep = db.createEpisode({
      movieId,
      episodeNumber: Number(episodeNumber) || 1,
      title: title || `Tập ${episodeNumber || 1}`,
      youtubeUrl: parsed.data.watchUrl,
      youtubeVideoId: parsed.data.videoId,
      youtubeEmbedUrl: parsed.data.embedUrl,
      thumbnailUrl: customThumbnail || parsed.data.thumbnailUrl,
    });

    res.status(201).json({ success: true, data: ep });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/episodes/bulk (Nhập nhiều tập từ danh sách link Video)
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { movieId, episodes } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Thiếu movieId.' });
    }
    if (!Array.isArray(episodes) || episodes.length === 0) {
      return res.status(400).json({ success: false, error: 'Danh sách tập trống.' });
    }

    const validPayloads = [];
    const errors = [];

    for (let i = 0; i < episodes.length; i++) {
      const item = episodes[i];
      const parsed = parseYouTubeUrl(item.youtubeUrl || item.url);
      if (!parsed.success) {
        errors.push(`Dòng ${i + 1}: ${item.youtubeUrl || item.url} không hợp lệ.`);
        continue;
      }

      validPayloads.push({
        episodeNumber: Number(item.episodeNumber) || i + 1,
        title: item.title || `Tập ${item.episodeNumber || i + 1}`,
        youtubeUrl: parsed.data.watchUrl,
        youtubeVideoId: parsed.data.videoId,
        youtubeEmbedUrl: parsed.data.embedUrl,
        thumbnailUrl: item.thumbnailUrl || parsed.data.thumbnailUrl,
      });
    }

    if (validPayloads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không có link video hợp lệ nào trong danh sách.',
        details: errors,
      });
    }

    const createdEpisodes = db.createBulkEpisodes(movieId, validPayloads);

    res.json({
      success: true,
      data: createdEpisodes,
      importedCount: createdEpisodes.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/episodes/:id (Sửa tập)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { episodeNumber, title, youtubeUrl, customThumbnail } = req.body;

    const payload: any = {};
    if (episodeNumber !== undefined) payload.episodeNumber = Number(episodeNumber);
    if (title !== undefined) payload.title = title;
    if (customThumbnail) payload.thumbnailUrl = customThumbnail;

    if (youtubeUrl) {
      const parsed = parseYouTubeUrl(youtubeUrl);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error });
      }
      payload.youtubeUrl = parsed.data.watchUrl;
      payload.youtubeVideoId = parsed.data.videoId;
      payload.youtubeEmbedUrl = parsed.data.embedUrl;
      if (!customThumbnail) {
        payload.thumbnailUrl = parsed.data.thumbnailUrl;
      }
    }

    const updated = db.updateEpisode(id, payload);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tập phim.' });
    }

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/episodes/:id (Xóa tập)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = db.deleteEpisode(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tập phim để xóa.' });
    }

    res.json({ success: true, message: 'Đã xóa tập phim thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
