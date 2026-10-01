import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// In-memory active visitor store
const activeVisitors = new Map<string, number>();

// Clean up visitors inactive for more than 45 seconds & compute online count
function getActiveOnlineCount(clientIpOrId?: string): number {
  const now = Date.now();
  if (clientIpOrId) {
    activeVisitors.set(clientIpOrId, now);
  }

  // Remove stale entries older than 45 seconds
  for (const [id, lastSeen] of activeVisitors.entries()) {
    if (now - lastSeen > 45000) {
      activeVisitors.delete(id);
    }
  }

  const realCount = activeVisitors.size;
  // Natural realistic baseline based on hour of the day (e.g., peak evening vs normal)
  const hour = new Date().getHours();
  const isPeakHour = (hour >= 18 && hour <= 23) || (hour >= 11 && hour <= 13);
  const baseCount = isPeakHour ? 22 : 14;
  // Subtle natural fluctuation every 15s
  const fluctuation = (Math.floor(now / 15000) % 5) - 2; // -2, -1, 0, 1, 2
  const displayCount = realCount + baseCount + fluctuation;

  return Math.max(realCount, Math.max(displayCount, 8));
}

// GET /api/chat/online - Lấy số người trực tuyến
router.get('/online', (req: Request, res: Response) => {
  try {
    const clientId = (req.query.clientId as string) || req.ip || 'anonymous';
    const count = getActiveOnlineCount(clientId);
    res.json({ success: true, onlineCount: count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/chat/messages - Lấy tin nhắn chat gần đây và số người trực tuyến
router.get('/messages', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 60;
    const clientId = (req.query.clientId as string) || req.ip || 'anonymous';
    const onlineCount = getActiveOnlineCount(clientId);
    const messages = db.getChatMessages(limit);
    res.json({ success: true, data: messages, onlineCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/messages - Gửi tin nhắn mới
router.post('/messages', (req: Request, res: Response) => {
  try {
    const { senderName, content, senderBadge, avatarColor, avatar } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Nội dung tin nhắn không được để trống.' });
    }

    const msg = db.addChatMessage({
      senderName: senderName?.trim() || 'Thành viên',
      senderBadge: senderBadge || 'Thành viên',
      avatarColor,
      avatar,
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
