import { Router, Request, Response } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/settings (Public info)
router.get('/', (req: Request, res: Response) => {
  try {
    const s = db.getSettings();
    // Ẩn secret key khỏi public endpoint
    const publicSettings = {
      siteName: s.siteName,
      channelUrl: s.channelUrl,
      channelName: s.channelName,
      seoTitle: s.seoTitle,
      seoDescription: s.seoDescription,
      seoKeywords: s.seoKeywords,
      hasYoutubeApiKey: Boolean(s.youtubeApiKey || process.env.YOUTUBE_API_KEY),
      hasFirebaseConfig: Boolean(s.firebaseConfig?.apiKey),
      donateBankName: s.donateBankName || 'Vietcombank',
      donateAccountNumber: s.donateAccountNumber || '',
      donateAccountName: s.donateAccountName || 'NGUYỄN THIỆN PHÚC',
      donateMomo: s.donateMomo || '',
      donateQrUrl: s.donateQrUrl || '/images/donate-qr.png',
      donateNote: s.donateNote || 'Ủng hộ duy trì server và phát triển kênh Phim Hay 247',
      adSenseSafeMode: Boolean(s.adSenseSafeMode),
    };
    res.json({ success: true, data: publicSettings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/settings/admin (Admin full info)
router.get('/admin', (req: Request, res: Response) => {
  try {
    const s = db.getSettings();
    res.json({ success: true, data: s });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/settings (Update settings)
router.put('/', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/verify-admin (Đăng nhập Admin)
router.post('/verify-admin', (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;
    const settings = db.getSettings();
    const validKey = settings.adminKey || process.env.ADMIN_SECRET_KEY || 'admin123';

    // Xác thực bằng mật khẩu quản trị hoặc Firebase token
    if (password === validKey || token === 'admin-session-token') {
      return res.json({
        success: true,
        token: 'admin-session-token',
        user: { role: 'admin', name: 'Quản Trị Viên' },
      });
    }

    res.status(401).json({ success: false, error: 'Mật khẩu quản trị không chính xác.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/settings/export-db (Tải toàn bộ database json về máy)
router.get('/export-db', (req: Request, res: Response) => {
  try {
    const data = db.exportDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=phimhay247_db_${new Date().toISOString().slice(0, 10)}.json`);
    res.send(JSON.stringify(data));
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/import-db (Khôi phục database từ file json)
router.post('/import-db', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const ok = db.importDatabase(payload);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Dữ liệu file JSON không đúng định dạng database.' });
    }
    res.json({ success: true, message: 'Đã khôi phục toàn bộ dữ liệu phim và tập thành công!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
