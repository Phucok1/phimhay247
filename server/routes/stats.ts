import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';
import { getRealVisitorStats } from './chat.js';

const router = Router();

// Lưu trữ IP / Token để giới hạn spam view (mỗi IP xem cùng 1 tập tối đa 1 lần mỗi 5 phút)
const viewThrottleMap = new Map<string, number>();

// POST /api/stats/view
router.post('/view', (req: Request, res: Response) => {
  try {
    const { movieId, episodeId, clientToken } = req.body;
    if (!episodeId) {
      return res.status(400).json({ success: false, error: 'Thiếu episodeId.' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const throttleKey = `${ip}_${episodeId}_${clientToken || ''}`;
    const now = Date.now();
    const lastViewTime = viewThrottleMap.get(throttleKey);

    // Chặn nếu vừa mới view trong vòng 3 phút (180,000 ms)
    if (lastViewTime && now - lastViewTime < 180000) {
      return res.json({ success: true, throttled: true, message: 'Lượt xem đã được ghi nhận trước đó.' });
    }

    viewThrottleMap.set(throttleKey, now);

    // Dọn bớt throttle map nếu quá lớn (> 50,000 entries)
    if (viewThrottleMap.size > 50000) {
      const expirationTime = now - 180000;
      for (const [key, timestamp] of viewThrottleMap.entries()) {
        if (timestamp < expirationTime) {
          viewThrottleMap.delete(key);
        }
      }
    }

    db.incrementEpisodeView(episodeId);

    res.json({ success: true, throttled: false });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stats/dashboard (Dành cho Admin Dashboard)
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    const realStats = getRealVisitorStats();
    res.json({ success: true, data: { ...stats, realStats } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
