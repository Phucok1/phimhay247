import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';
import { parseYouTubeUrl } from '../services/youtubeParser.js';

const router = Router();

// GET /api/member-movies - Lấy danh sách phim đóng góp
router.get('/', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const list = db.getMemberSubmissions(status as string);
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/member-movies/submit - Hội viên gửi đóng góp phim
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { title, contributorName, contributorContact, description, category, videoUrl, episodes, posterUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên phim.' });
    }

    let rawEpisodes = Array.isArray(episodes) && episodes.length > 0 ? episodes : [];
    if (rawEpisodes.length === 0 && videoUrl && videoUrl.trim()) {
      rawEpisodes = [{ episodeNumber: 1, title: 'Tập 1', videoUrl: videoUrl.trim() }];
    }

    if (rawEpisodes.length === 0) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp ít nhất 1 link video tập phim.' });
    }

    // Làm sạch và kiểm tra danh sách tập
    const cleanedEpisodes = rawEpisodes
      .map((ep: any, index: number) => ({
        episodeNumber: Number(ep.episodeNumber) || (index + 1),
        title: ep.title?.trim() || `Tập ${index + 1}`,
        videoUrl: ep.videoUrl?.trim() || '',
      }))
      .filter((ep: any) => Boolean(ep.videoUrl));

    if (cleanedEpisodes.length === 0) {
      return res.status(400).json({ success: false, error: 'Danh sách tập phim không chứa link video hợp lệ.' });
    }

    // Link tập 1 để lấy ảnh bìa và platform đại diện
    const firstUrl = cleanedEpisodes[0].videoUrl;
    const parsed = parseYouTubeUrl(firstUrl);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: `Link tập 1 không hợp lệ: ${parsed.error}` });
    }

    const categories = Array.isArray(category) && category.length > 0 ? category : ['Phim Hội Viên'];

    const submission = db.createMemberSubmission({
      title: title.trim(),
      slug: '',
      contributorName: contributorName?.trim() || 'Hội viên ẩn danh',
      contributorContact: contributorContact?.trim() || '',
      description: description?.trim() || '',
      category: categories,
      videoUrl: parsed.data.watchUrl,
      episodes: cleanedEpisodes,
      parsedVideoId: parsed.data.videoId,
      parsedEmbedUrl: parsed.data.embedUrl,
      parsedPlatform: parsed.data.platformName,
      posterUrl: posterUrl?.trim() || parsed.data.thumbnailUrl,
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Gửi đóng góp phim thành công! Ban quản trị sẽ kiểm duyệt và xuất bản lên mục Phim Hội Viên sớm nhất.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/member-movies/:id/approve - Admin duyệt phim của hội viên
router.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submissions = db.getMemberSubmissions();
    const target = submissions.find((s) => s.id === id);

    if (!target) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy phim đóng góp này.' });
    }

    const parsed = parseYouTubeUrl(target.videoUrl);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Link video không hợp lệ: ' + parsed.error });
    }

    const result = db.approveMemberSubmission(id, parsed.data);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      movie: result.movie,
      message: `Đã duyệt thành công bộ phim "${target.title}" vào mục Phim Hội Viên!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/member-movies/:id/reject - Admin từ chối phim
router.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.rejectMemberSubmission(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy phim đóng góp.' });
    }
    res.json({ success: true, message: 'Đã từ chối phim đóng góp.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/member-movies/:id - Admin xóa submission
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteMemberSubmission(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy phim đóng góp.' });
    }
    res.json({ success: true, message: 'Đã xóa bản ghi đóng góp.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
