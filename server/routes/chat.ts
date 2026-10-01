import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/chat/messages - Lấy tin nhắn chat gần đây
router.get('/messages', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 60;
    const messages = db.getChatMessages(limit);
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/messages - Gửi tin nhắn mới
router.post('/messages', (req: Request, res: Response) => {
  try {
    const { senderName, content, senderBadge, avatarColor } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Nội dung tin nhắn không được để trống.' });
    }

    const msg = db.addChatMessage({
      senderName: senderName?.trim() || 'Thành viên',
      senderBadge: senderBadge || 'Thành viên',
      avatarColor,
      content: content.trim(),
    });

    res.status(201).json({ success: true, data: msg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/chat/messages/:id - Admin xóa tin nhắn rác/spam
router.delete('/messages/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteChatMessage(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tin nhắn.' });
    }
    res.json({ success: true, message: 'Đã xóa tin nhắn thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
