import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/feedback - Danh sách góp ý & báo lỗi (Dành cho admin)
router.get('/', (req: Request, res: Response) => {
  try {
    const list = db.getFeedbacks();
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/feedback - Người xem gửi góp ý / báo lỗi
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, contact, type, movieTitle, episodeNumber, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập nội dung góp ý hoặc báo lỗi.' });
    }

    const item = db.createFeedback({
      name: name?.trim() || 'Khán giả ẩn danh',
      contact: contact?.trim() || '',
      type: type || 'Góp ý tính năng',
      movieTitle: movieTitle?.trim() || '',
      episodeNumber: episodeNumber ? Number(episodeNumber) : undefined,
      content: content.trim(),
    });

    res.status(201).json({ success: true, data: item, message: 'Cảm ơn bạn đã gửi phản hồi! Ban quản trị sẽ kiểm tra sớm nhất.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/feedback/:id/status - Cập nhật trạng thái xử lý
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ok = db.updateFeedbackStatus(id, status);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy phản hồi.' });
    }

    res.json({ success: true, message: 'Đã cập nhật trạng thái phản hồi.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/feedback/:id - Xóa phản hồi
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteFeedback(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy phản hồi.' });
    }

    res.json({ success: true, message: 'Đã xóa phản hồi thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
