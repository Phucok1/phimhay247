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
    const { title, contributorName, contributorContact, description, category, videoUrl, posterUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên phim.' });
    }
    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp link video tập 1 (YouTube, Ok.ru, Facebook Reels, Drive...).' });
    }

    // Kiểm tra & phân tích link video
    const parsed = parseYouTubeUrl(videoUrl.trim());
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error });
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
