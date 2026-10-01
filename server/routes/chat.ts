import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// In-memory active visitor store
export interface ActiveVisitor {
  id: string;
  ip: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  lastSeen: number;
}

const activeVisitorsMap = new Map<string, ActiveVisitor>();

export function recordVisitorActivity(id: string, ip: string, userAgent?: string): number {
  const now = Date.now();
  const ua = (userAgent || '').toLowerCase();
  let device: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
  if (/ipad|tablet/i.test(ua)) device = 'Tablet';
  else if (/mobile|android|iphone|ipod/i.test(ua)) device = 'Mobile';

  if (id) {
    activeVisitorsMap.set(id, {
      id,
      ip: (ip || 'unknown').replace(/^.*:/, ''),
      device,
      lastSeen: now,
    });
  }

  // Clean stale (> 45s)
  for (const [key, item] of activeVisitorsMap.entries()) {
    if (now - item.lastSeen > 45000) {
      activeVisitorsMap.delete(key);
    }
  }

  return activeVisitorsMap.size;
}

export function getRealVisitorStats() {
  const now = Date.now();
  for (const [id, item] of activeVisitorsMap.entries()) {
    if (now - item.lastSeen > 60000) {
      activeVisitorsMap.delete(id);
    }
  }
  const list = Array.from(activeVisitorsMap.values());
  const mobileCount = list.filter((v) => v.device === 'Mobile').length;
  const desktopCount = list.filter((v) => v.device === 'Desktop').length;
  const tabletCount = list.filter((v) => v.device === 'Tablet').length;

  return {
    realCount: list.length,
    mobileCount,
    desktopCount: desktopCount + tabletCount,
    visitors: list.map((v) => ({
      device: v.device,
      secondsAgo: Math.max(0, Math.round((now - v.lastSeen) / 1000)),
    })),
  };
}

// Clean up visitors inactive for more than 45 seconds & compute online count
function getActiveOnlineCount(clientIpOrId?: string, ip?: string, ua?: string): number {
  const now = Date.now();
  const realCount = recordVisitorActivity(clientIpOrId || 'anon', ip || '', ua);

  // Natural realistic baseline based on hour of the day
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
    const count = getActiveOnlineCount(clientId, req.ip, req.headers['user-agent']);
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
