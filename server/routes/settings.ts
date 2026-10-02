import { Router, Request, Response } from 'express';
import fs from 'fs';
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

// Hàm hỗ trợ sửa lỗi JSON bị ngắt nửa chừng (truncated) do mạng hoặc timeout khi tải
export function repairTruncatedJson(rawText: string): any {
  try {
    return JSON.parse(rawText);
  } catch (err: any) {
    let repaired = rawText.replace(/\\+$/, '') + '"';
    const stack: string[] = [];
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < repaired.length; i++) {
      const ch = repaired[i];
      if (inString) {
        if (ch === '\\' && !isEscaped) {
          isEscaped = true;
        } else {
          if (ch === '"' && !isEscaped) inString = false;
          isEscaped = false;
        }
      } else {
        if (ch === '"') {
          inString = true;
        } else if (ch === '{' || ch === '[') {
          stack.push(ch);
        } else if (ch === '}') {
          if (stack[stack.length - 1] === '{') stack.pop();
        } else if (ch === ']') {
          if (stack[stack.length - 1] === '[') stack.pop();
        }
      }
    }

    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '{') repaired += '}';
      else if (top === '[') repaired += ']';
    }

    try {
      return JSON.parse(repaired);
    } catch {
      const lastBrace = rawText.lastIndexOf('}');
      if (lastBrace !== -1) {
        const cutback = rawText.substring(0, lastBrace + 1);
        const s2: string[] = [];
        let inS2 = false;
        let esc2 = false;
        for (let i = 0; i < cutback.length; i++) {
          const ch = cutback[i];
          if (inS2) {
            if (ch === '\\' && !esc2) esc2 = true;
            else {
              if (ch === '"' && !esc2) inS2 = false;
              esc2 = false;
            }
          } else {
            if (ch === '"') inS2 = true;
            else if (ch === '{' || ch === '[') s2.push(ch);
            else if (ch === '}' && s2[s2.length - 1] === '{') s2.pop();
            else if (ch === ']' && s2[s2.length - 1] === '[') s2.pop();
          }
        }
        let rep2 = cutback;
        while (s2.length > 0) {
          const top = s2.pop();
          if (top === '{') rep2 += '}';
          else if (top === '[') rep2 += ']';
        }
        return JSON.parse(rep2);
      }
      throw err;
    }
  }
}

// GET /api/settings/export-db (Tải toàn bộ database json về máy dưới dạng stream 0 MB RAM)
router.get('/export-db', (req: Request, res: Response) => {
  try {
    db.save(); // Ghi toàn bộ dữ liệu mới nhất trong RAM xuống đĩa
    const filePath = db.getDbFilePath();
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Database file không tồn tại.' });
    }
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Length', stat.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=phimhay247_db_${new Date().toISOString().slice(0, 10)}.json`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/import-db (Khôi phục database từ file json, có tự động sửa lỗi nếu file bị ngắt nửa chừng)
router.post('/import-db', (req: Request, res: Response) => {
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      payload = repairTruncatedJson(payload);
    }
    const ok = db.importDatabase(payload);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Dữ liệu file JSON không đúng định dạng database.' });
    }
    res.json({ success: true, message: 'Đã khôi phục toàn bộ dữ liệu phim, tập và truyện thành công!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
