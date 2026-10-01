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

// Helper bóc tách danh sách server đa nguồn
function processEpisodeServers(rawServers: any[], defaultMainUrl?: string) {
  const result: any[] = [];
  if (Array.isArray(rawServers) && rawServers.length > 0) {
    for (let i = 0; i < rawServers.length; i++) {
      const s = rawServers[i];
      const url = (typeof s === 'string' ? s : s?.url)?.trim();
      if (!url) continue;
      const parsed = parseYouTubeUrl(url);
      if (parsed.success) {
        result.push({
          id: s?.id || `srv-${Date.now()}-${i}`,
          name: s?.name?.trim() || `Server ${i + 1} (${parsed.data.platformName})`,
          url: parsed.data.watchUrl,
          videoId: parsed.data.videoId,
          embedUrl: parsed.data.embedUrl,
          platform: parsed.data.videoType,
        });
      }
    }
  } else if (defaultMainUrl && defaultMainUrl.trim()) {
    const parsed = parseYouTubeUrl(defaultMainUrl.trim());
    if (parsed.success) {
      result.push({
        id: `srv-${Date.now()}-0`,
        name: `Server 1 (${parsed.data.platformName})`,
        url: parsed.data.watchUrl,
        videoId: parsed.data.videoId,
        embedUrl: parsed.data.embedUrl,
        platform: parsed.data.videoType,
      });
    }
  }
  return result;
}

// POST /api/episodes (Thêm 1 tập)
router.post('/', (req: Request, res: Response) => {
  try {
    const { movieId, episodeNumber, title, youtubeUrl, customThumbnail, servers } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bộ phim (movieId).' });
    }

    const mainUrl = youtubeUrl || (Array.isArray(servers) && servers[0]?.url) || '';
    if (!mainUrl) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp ít nhất 1 link video.' });
    }

    const parsedMain = parseYouTubeUrl(mainUrl);
    if (!parsedMain.success) {
      return res.status(400).json({ success: false, error: parsedMain.error });
    }

    let processedServers = processEpisodeServers(servers, mainUrl);
    if (processedServers.length === 0) {
      processedServers = [{
        id: `srv-${Date.now()}-0`,
        name: `Server 1 (${parsedMain.data.platformName})`,
        url: parsedMain.data.watchUrl,
        videoId: parsedMain.data.videoId,
        embedUrl: parsedMain.data.embedUrl,
        platform: parsedMain.data.videoType,
      }];
    }

    const ep = db.createEpisode({
      movieId,
      episodeNumber: Number(episodeNumber) || 1,
      title: title || `Tập ${episodeNumber || 1}`,
      youtubeUrl: processedServers[0].url,
      youtubeVideoId: processedServers[0].videoId,
      youtubeEmbedUrl: processedServers[0].embedUrl,
      thumbnailUrl: customThumbnail || parsedMain.data.thumbnailUrl,
      servers: processedServers,
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
        servers: [
          {
            id: `srv-${Date.now()}-${i}`,
            name: `Server 1 (${parsed.data.platformName})`,
            url: parsed.data.watchUrl,
            videoId: parsed.data.videoId,
            embedUrl: parsed.data.embedUrl,
            platform: parsed.data.videoType,
          }
        ],
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
    const { episodeNumber, title, youtubeUrl, customThumbnail, servers } = req.body;

    const payload: any = {};
    if (episodeNumber !== undefined) payload.episodeNumber = Number(episodeNumber);
    if (title !== undefined) payload.title = title;
    if (customThumbnail) payload.thumbnailUrl = customThumbnail;

    if (Array.isArray(servers)) {
      const processed = processEpisodeServers(servers);
      if (processed.length > 0) {
        payload.servers = processed;
        payload.youtubeUrl = processed[0].url;
        payload.youtubeVideoId = processed[0].videoId;
        payload.youtubeEmbedUrl = processed[0].embedUrl;
        if (!customThumbnail) {
          const p = parseYouTubeUrl(processed[0].url);
          if (p.success) payload.thumbnailUrl = p.data.thumbnailUrl;
        }
      }
    } else if (youtubeUrl) {
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
      payload.servers = [{
        id: `srv-${Date.now()}-0`,
        name: `Server 1 (${parsed.data.platformName})`,
        url: parsed.data.watchUrl,
        videoId: parsed.data.videoId,
        embedUrl: parsed.data.embedUrl,
        platform: parsed.data.videoType,
      }];
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
