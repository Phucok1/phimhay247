import { Router, Request, Response } from 'express';
import https from 'https';
import { db, Chapter, generateSlug } from '../services/database.js';

const router = Router();

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi,en;q=0.9',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve(data));
        }
      )
      .on('error', (err) => reject(err));
  });
}

function cleanHtmlText(html: string): string {
  return decodeHtmlEntities(html.replace(/<br\s*[\/]?>/gi, '\n')).trim();
}

// Middleware xác thực Admin
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.headers['x-admin-key'] as string);
  const settings = db.getSettings();
  const validKey = settings.adminKey || process.env.ADMIN_SECRET_KEY || 'admin123';

  if (token === 'admin-session-token' || token === validKey) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Yêu cầu quyền Quản Trị Viên.' });
};

// GET /api/novels - Lấy danh sách truyện chữ (lược bỏ nội dung chương cho nhẹ)
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, q } = req.query;
    const novels = db.getNovels({
      category: category as string,
      query: q as string,
    });

    // Chỉ trả về thông tin tóm tắt và số lượng chương
    const summary = novels.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      author: n.author,
      category: n.category,
      coverUrl: n.coverUrl,
      description: n.description,
      status: n.status,
      viewCount: n.viewCount || 0,
      linkedMovieSlug: n.linkedMovieSlug,
      totalChapters: n.chapters ? n.chapters.length : 0,
      latestChapter: n.chapters && n.chapters.length > 0 ? n.chapters[n.chapters.length - 1].chapterNumber : 0,
      latestChapterTitle: n.chapters && n.chapters.length > 0 ? n.chapters[n.chapters.length - 1].title : '',
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/novels/:slug - Lấy chi tiết bộ truyện + danh sách mục lục chương (không kèm text chương)
router.get('/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const novel = db.getNovelBySlug(slug);
    if (!novel) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ truyện này.' });
    }

    // Tăng lượt xem
    db.incrementNovelViews(slug);

    // Danh sách mục lục các chương
    const chapterList = (novel.chapters || []).map((c) => ({
      chapterNumber: c.chapterNumber,
      title: c.title,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: {
        ...novel,
        viewCount: (novel.viewCount || 0) + 1,
        totalChapters: chapterList.length,
        chapters: chapterList,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/novels/:slug/chapters/:chapterNumber - Đọc nội dung 1 chương cụ thể
router.get('/:slug/chapters/:chapterNumber', async (req: Request, res: Response) => {
  try {
    const { slug, chapterNumber } = req.params;
    const novel = db.getNovelBySlug(slug);
    if (!novel) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy bộ truyện này.' });
    }

    const cNum = parseInt(chapterNumber.toString().replace(/^chuong-/i, '').replace(/\D/g, ''), 10);
    const chapters = novel.chapters || [];
    const chapterIndex = chapters.findIndex((c) => c.chapterNumber === cNum);

    if (chapterIndex === -1) {
      return res.status(404).json({ success: false, error: `Không tìm thấy Chương ${cNum}.` });
    }

    const currentChapter = chapters[chapterIndex];

    // Tự động phục hồi nếu chương trong DB bị ngắn (< 1500 ký tự) hoặc còn dính mã HTML thô do lỗi cào trước đây
    const sourceUrl = novel.sourceUrl || (novel.slug === 'dac-cong-chi-ton-tan-duong' ? 'https://metruyenhotvn.com/dac-cong-chi-ton/' : '');
    const currentLen = (currentChapter.content || '').length;
    if ((currentLen < 1500 || currentChapter.content.includes('&ugrave;') || currentChapter.content.includes('&ocirc;')) && sourceUrl) {
      try {
        let repairedChapter: Chapter | null = null;
        if (sourceUrl.includes('metruyenhot')) {
          const fetched = await extractMetruyenhotChapter(sourceUrl, cNum);
          repairedChapter = fetched.chapter;
        } else if (sourceUrl.includes('webnovel.vn')) {
          const fetched = await extractWebnovelChapter(sourceUrl, cNum);
          repairedChapter = fetched.chapter;
        }

        if (repairedChapter && repairedChapter.content.length > currentLen) {
          currentChapter.content = repairedChapter.content;
          if (repairedChapter.title && (!currentChapter.title || currentChapter.title.startsWith('Chương '))) {
            currentChapter.title = repairedChapter.title;
          }
          // Lưu lại vào DB để các lần đọc tiếp theo tải siêu nhanh
          db.updateNovel(novel.id, { chapters: novel.chapters, sourceUrl });
        }
      } catch (err) {
        // Nếu lỗi mạng, tiếp tục dùng nội dung có sẵn
      }
    }

    const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1].chapterNumber : null;
    const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1].chapterNumber : null;

    res.json({
      success: true,
      data: {
        novel: {
          id: novel.id,
          title: novel.title,
          slug: novel.slug,
          author: novel.author,
          coverUrl: novel.coverUrl,
          totalChapters: chapters.length,
          linkedMovieSlug: novel.linkedMovieSlug,
        },
        chapter: {
          ...currentChapter,
          content: cleanWatermarkContent(currentChapter.content),
        },
        prevChapter,
        nextChapter,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================= ADMIN ROUTES =================

// POST /api/novels/admin - Tạo bộ truyện mới
router.post('/admin', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { title, author, category, coverUrl, description, status, linkedMovieSlug } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Tên truyện không được để trống.' });
    }

    const novel = db.createNovel({
      title,
      author,
      category,
      coverUrl,
      description,
      status,
      linkedMovieSlug,
      chapters: [],
    });

    res.status(201).json({ success: true, data: novel });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/novels/admin/:id - Sửa thông tin bộ truyện
router.put('/admin/:id', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateNovel(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy truyện cần sửa.' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/novels/admin/:id - Xóa bộ truyện
router.delete('/admin/:id', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = db.deleteNovel(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy truyện để xóa.' });
    }
    res.json({ success: true, message: 'Đã xóa bộ truyện thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/novels/admin/:id/chapters - Thêm 1 chương hoặc nhập hàng loạt
router.post('/admin/:id/chapters', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { chapters, chapterNumber, title, content } = req.body;

    // Trường hợp 1: Nhập danh sách chương hàng loạt (từ file hoặc parser)
    if (Array.isArray(chapters) && chapters.length > 0) {
      const ok = db.importChapters(id, chapters as Chapter[]);
      if (!ok) {
        return res.status(400).json({ success: false, error: 'Không thể nhập các chương truyện.' });
      }
      return res.json({ success: true, message: `Đã nhập thành công ${chapters.length} chương!` });
    }

    // Trường hợp 2: Thêm 1 chương đơn lẻ
    if (chapterNumber === undefined || !content) {
      return res.status(400).json({ success: false, error: 'Số chương và nội dung không được để trống.' });
    }

    const ok = db.addChapter(id, {
      chapterNumber: parseInt(chapterNumber, 10),
      title: title || `Chương ${chapterNumber}`,
      content,
    });

    if (!ok) {
      return res.status(400).json({ success: false, error: 'Lỗi khi thêm chương mới.' });
    }

    res.json({ success: true, message: `Đã lưu Chương ${chapterNumber} thành công!` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/novels/admin/:id/chapters/:chapterNumber - Xóa 1 chương
router.delete('/admin/:id/chapters/:chapterNumber', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const { id, chapterNumber } = req.params;
    const ok = db.deleteChapter(id, parseInt(chapterNumber, 10));
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Không tìm thấy chương cần xóa.' });
    }
    res.json({ success: true, message: `Đã xóa Chương ${chapterNumber} thành công!` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const HTML_ENTITIES_MAP: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&iexcl;': '¡',
  '&cent;': '¢',
  '&pound;': '£',
  '&curren;': '¤',
  '&yen;': '¥',
  '&brvbar;': '¦',
  '&sect;': '§',
  '&uml;': '¨',
  '&copy;': '©',
  '&ordf;': 'ª',
  '&laquo;': '«',
  '&not;': '¬',
  '&shy;': '',
  '&reg;': '®',
  '&macr;': '¯',
  '&deg;': '°',
  '&plusmn;': '±',
  '&sup2;': '²',
  '&sup3;': '³',
  '&acute;': '´',
  '&micro;': 'µ',
  '&para;': '¶',
  '&middot;': '·',
  '&cedil;': '¸',
  '&sup1;': '¹',
  '&ordm;': 'º',
  '&raquo;': '»',
  '&frac14;': '¼',
  '&frac12;': '½',
  '&frac34;': '¾',
  '&iquest;': '¿',
  '&Agrave;': 'À',
  '&Aacute;': 'Á',
  '&Acirc;': 'Â',
  '&Atilde;': 'Ã',
  '&Auml;': 'Ä',
  '&Aring;': 'Å',
  '&AElig;': 'Æ',
  '&Ccedil;': 'Ç',
  '&Egrave;': 'È',
  '&Eacute;': 'É',
  '&Ecirc;': 'Ê',
  '&Euml;': 'Ë',
  '&Igrave;': 'Ì',
  '&Iacute;': 'Í',
  '&Icirc;': 'Î',
  '&Iuml;': 'Ï',
  '&ETH;': 'Đ',
  '&Dstrok;': 'Đ',
  '&Ntilde;': 'Ñ',
  '&Ograve;': 'Ò',
  '&Oacute;': 'Ó',
  '&Ocirc;': 'Ô',
  '&Otilde;': 'Õ',
  '&Ouml;': 'Ö',
  '&times;': '×',
  '&Oslash;': 'Ø',
  '&Ugrave;': 'Ù',
  '&Uacute;': 'Ú',
  '&Ucirc;': 'Û',
  '&Uuml;': 'Ü',
  '&Yacute;': 'Ý',
  '&THORN;': 'Þ',
  '&szlig;': 'ß',
  '&agrave;': 'à',
  '&aacute;': 'á',
  '&acirc;': 'â',
  '&atilde;': 'ã',
  '&auml;': 'ä',
  '&aring;': 'å',
  '&aelig;': 'æ',
  '&ccedil;': 'ç',
  '&egrave;': 'è',
  '&eacute;': 'é',
  '&ecirc;': 'ê',
  '&euml;': 'ë',
  '&igrave;': 'ì',
  '&iacute;': 'í',
  '&icirc;': 'î',
  '&iuml;': 'ï',
  '&eth;': 'đ',
  '&dstrok;': 'đ',
  '&ntilde;': 'ñ',
  '&ograve;': 'ò',
  '&oacute;': 'ó',
  '&ocirc;': 'ô',
  '&otilde;': 'õ',
  '&ouml;': 'ö',
  '&divide;': '÷',
  '&oslash;': 'ø',
  '&ugrave;': 'ù',
  '&uacute;': 'ú',
  '&ucirc;': 'û',
  '&uuml;': 'ü',
  '&yacute;': 'ý',
  '&thorn;': 'þ',
  '&yuml;': 'ÿ',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&hellip;': '...',
  '&dagger;': 't',
  '&ndash;': '–',
  '&mdash;': '—',
};

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  let res = str
    .replace(/(?:&nbsp;|\u00a0|\s)*(&nbsp;|\u00a0){2,}(?:&nbsp;|\u00a0|\s)*/gi, '\n\n')
    .replace(/\u00a0/g, ' ');

  for (let iter = 0; iter < 2; iter++) {
    res = res
      .replace(/&[a-zA-Z0-9]+;/g, (m) => (HTML_ENTITIES_MAP[m] !== undefined ? HTML_ENTITIES_MAP[m] : m))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  return res;
}

// Trích xuất các câu văn bị chèn vào thuộc tính ngẫu nhiên của thẻ <p ... [attr]="...">
function extractSentencesFromTagAttributes(htmlSnippet: string): string[] {
  const sentences: string[] = [];
  const seen = new Set<string>();
  const pTagRegex = /<p\s+([^>]+)>/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pTagRegex.exec(htmlSnippet)) !== null) {
    const attrs = pMatch[1];
    const attrMatch = attrs.matchAll(/([a-z]{8,15})="([^"]{4,})"/gi);
    for (const am of attrMatch) {
      const attrName = am[1].toLowerCase();
      if (!['style', 'class', 'onmousedown', 'onselectstart', 'oncopy', 'oncut'].includes(attrName)) {
        let decoded = decodeHtmlEntities(am[2].trim());
        if (decoded.includes('&')) decoded = decodeHtmlEntities(decoded);
        decoded = decoded.trim();
        if (
          decoded.length > 3 &&
          !decoded.toLowerCase().includes('metruyen') &&
          !decoded.toLowerCase().includes('google') &&
          !seen.has(decoded)
        ) {
          seen.add(decoded);
          sentences.push(decoded);
        }
      }
    }
  }
  return sentences;
}

// Hàm dọn dẹp các đoạn quảng cáo, watermark và thẻ rác HTML còn sót lại
export function cleanWatermarkContent(content: string): string {
  if (!content) return '';

  let text = content
    .replace(/<p[^>]*class="[^"]*mshow[^"]*"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<div[^>]*class="[^"]*mshow[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<p[^>]*class="[^"]*ads[^"]*"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<div id="content-metruyenhot"[\s\S]*?<\/div>/gi, '')
    .replace(/<\/(?:p|div|h\d)>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  text = decodeHtmlEntities(text);
  if (text.includes('&')) text = decodeHtmlEntities(text);

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      const lower = l.toLowerCase();
      if (lower.includes('lên google tìm kiếm') || lower.includes('metruyenh0t') || lower.includes('metruyenhot')) return false;
      if (lower.includes('bên khác copy sẽ thiếu') || lower.includes('copy sẽ thiếu nội dung')) return false;
      if (lower.includes('bạn đang đọc truyện mới tại')) return false;
      if (lower.includes('content-metruyenhot')) return false;
      if (lower === 'trước' || lower === 'sau' || lower === 'đọc tiếp' || lower === 'về đầu trang' || lower === 'nhấn mở bình luận') return false;
      if (lower.includes('chính sách bảo mật') || lower.includes('điều khoản sử dụng') || lower.includes('thỏa thuận quyền riêng tư')) return false;
      if (lower.includes('quy định về nội dung') || lower.includes('liên hệ') || lower.includes('website hoạt động dưới giấy phép')) return false;
      if (lower.includes('đọc truyện không bị quảng cáo') || lower.includes('các thông tin, hình ảnh, bài đăng trên website')) return false;
      if (lower.includes('đọc truyện online, đọc truyện chữ') || lower.includes('hỗ trợ mọi trình duyệt và')) return false;
      if (
        lower === 'truyện teen hay' || lower === 'ngôn tình ngược' || lower === 'đam mỹ hài' ||
        lower === 'đam mỹ hay' || lower === 'đam mỹ h văn' || lower === 'ngôn tình hay' ||
        lower === 'truyện full' || lower === 'tiên hiệp hay' || lower === 'truyện hot' || lower === 'kiếm hiệp hay'
      ) return false;
      if (lower.includes('document.addeventlistener') || lower.includes('attachshadow') || lower.includes('createelement')) return false;
      if (lower.includes('contents =') || lower.includes('innerhtml') || lower.includes('shadowroot')) return false;
      if (lower.includes('function()') || lower.includes('var ey') || lower.includes('var f=[]') || lower.includes('var a=0')) return false;
      if (lower.startsWith(';var ') || lower.startsWith('var ') || lower.includes('::before{content:attr')) return false;
      if (lower === "';" || lower === "'" || lower === '";' || lower === '"' || lower === '<div') return false;
      return true;
    });

  return lines.join('\n\n');
}

// Helper fetch có tự động Retry nếu mạng chập chờn
function fetchHtmlWithRetry(
  url: string,
  retries = 3,
  delayMs = 300
): Promise<{ statusCode: number; html: string }> {
  return new Promise((resolve) => {
    const attempt = (n: number) => {
      const req = https.get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi,en;q=0.9',
          },
          timeout: 12000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            resolve({ statusCode: res.statusCode || 200, html: data });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        if (n > 1) {
          setTimeout(() => attempt(n - 1), delayMs);
        } else {
          resolve({ statusCode: 408, html: '' });
        }
      });

      req.on('error', () => {
        if (n > 1) {
          setTimeout(() => attempt(n - 1), delayMs);
        } else {
          resolve({ statusCode: 500, html: '' });
        }
      });
    };

    attempt(retries);
  });
}

// Helper cào từng chương MeTruyenHot (có retry, giải mã câu bị giấu và xóa sạch watermark)
async function extractMetruyenhotChapter(
  cleanUrl: string,
  ch: number
): Promise<{ chapter: Chapter | null; is404: boolean }> {
  const chUrl = `${cleanUrl}chuong-${ch}/`;
  try {
    const res = await fetchHtmlWithRetry(chUrl, 3, 300);
    if (res.statusCode === 404) {
      return { chapter: null, is404: true };
    }
    if (!res.html) {
      return { chapter: null, is404: false };
    }

    const chHtml = res.html;
    const chapterTag = 'class="book-list full-story content chapter-c"';
    let startIdx = chHtml.indexOf(chapterTag);
    if (startIdx === -1) {
      startIdx = chHtml.indexOf('id="chapter-c"');
    }
    if (startIdx === -1) {
      startIdx = chHtml.indexOf('id=chapter-c');
    }
    if (startIdx === -1) {
      return { chapter: null, is404: false };
    }

    const contentStart = chHtml.indexOf('>', startIdx) + 1;

    // Container kết thúc ở điểm bắt đầu thẻ content-metruyenhot hoặc trước thanh điều hướng / script
    let endIdx = chHtml.indexOf('id="content-metruyenhot"', contentStart);
    if (endIdx === -1) {
      endIdx = chHtml.indexOf('id=content-metruyenhot', contentStart);
    }
    if (endIdx === -1) {
      const navMatch = chHtml.slice(contentStart).match(/id=["']?chapter-nav-bottom|class=["']?[^"']*\brv-chapt-comment\b|<\/main>/i);
      if (navMatch && navMatch.index !== undefined) {
        endIdx = contentStart + navMatch.index;
      }
    }
    if (endIdx === -1) {
      endIdx = chHtml.length;
    }

    let raw = chHtml.substring(contentStart, endIdx);

    // 1. Dọn sạch watermark khỏi raw trước khi trích xuất đoạn văn
    raw = raw
      .replace(/<p[^>]*class="[^"]*mshow[^"]*"[^>]*>[\s\S]*?<\/p>/gi, '')
      .replace(/<div[^>]*class="[^"]*mshow[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<p[^>]*class="[^"]*ads[^"]*"[^>]*>[\s\S]*?<\/p>/gi, '')
      .replace(/<div id="content-metruyenhot"[\s\S]*?<\/div>/gi, '');

    // Đổi thẻ khối thành dấu xuống dòng kép để giữ nguyên từng đoạn văn riêng biệt
    raw = raw
      .replace(/<\/(?:p|div|h\d)>/gi, '\n\n')
      .replace(/<(?:p|div|h\d)[^>]*>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '');

    let rawText = decodeHtmlEntities(raw);
    if (rawText.includes('&')) rawText = decodeHtmlEntities(rawText);

    // Tách thành từng đoạn văn và lọc bỏ các câu rác / quảng cáo
    const rawParagraphs = rawText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => {
        if (!p) return false;
        const lower = p.toLowerCase();
        if (lower.includes('lên google tìm kiếm') || lower.includes('metruyenh0t') || lower.includes('metruyenhot')) return false;
        if (lower.includes('bên khác copy sẽ thiếu') || lower.includes('copy sẽ thiếu nội dung')) return false;
        if (lower.includes('bạn đang đọc truyện mới tại')) return false;
        if (lower.includes('content-metruyenhot')) return false;
        if (lower === 'trước' || lower === 'sau' || lower === 'đọc tiếp' || lower === 'về đầu trang' || lower === 'nhấn mở bình luận') return false;
        if (lower.includes('chính sách bảo mật') || lower.includes('điều khoản sử dụng') || lower.includes('thỏa thuận quyền riêng tư')) return false;
        if (lower.includes('quy định về nội dung') || lower.includes('liên hệ') || lower.includes('website hoạt động dưới giấy phép')) return false;
        if (lower.includes('đọc truyện không bị quảng cáo') || lower.includes('các thông tin, hình ảnh, bài đăng trên website')) return false;
        if (lower.includes('document.addeventlistener') || lower.includes('attachshadow')) return false;
        if (lower.startsWith(';var ') || lower.startsWith('var ') || lower.includes('::before{content:attr')) return false;
        if (lower === "';" || lower === "'" || lower === '";' || lower === '"' || lower === '<div') return false;
        return true;
      });

    // 2. Trích xuất Phần 1: Các câu ẩn trong contentS của Shadow DOM (trong <script>)
    const scriptContentMatch = chHtml.match(/var\s+contentS\s*=\s*'([^']+)'/i);
    let shadowSentences: string[] = [];
    if (scriptContentMatch) {
      shadowSentences = extractSentencesFromTagAttributes(scriptContentMatch[1]);
    }

    // 3. Trích xuất Phần 2: Các câu ẩn trong thuộc tính thẻ <p ...> sau thẻ #content-metruyenhot
    let postContentHtml = '';
    const postStart = chHtml.indexOf('id="content-metruyenhot"');
    if (postStart !== -1) {
      const postEnd = chHtml.indexOf('<script', postStart);
      postContentHtml = postEnd !== -1 ? chHtml.substring(postStart, postEnd) : chHtml.substring(postStart, postStart + 5000);
    }
    const postSentences = extractSentencesFromTagAttributes(postContentHtml);

    // 4. Ghép toàn bộ nội dung theo đúng trình tự tự nhiên của chương:
    // Thân bài (rawParagraphs) -> Đoạn nối từ Shadow DOM -> Đoạn kết (kết thúc bằng "Hết chương X.")
    const allParagraphs = [...rawParagraphs, ...shadowSentences, ...postSentences];

    const clean = allParagraphs.join('\n\n').trim();

    if (clean.length < 100) {
      return { chapter: null, is404: false };
    }

    const chTitleMatch = chHtml.match(
      /<div class=rv-chapt-title><h2><a[^>]*>([^<]+)<\/a><\/h2><\/div>/i
    );
    const chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;

    const cleanTitle = decodeHtmlEntities((' ' + chTitle).slice(1));
    const cleanContent = (' ' + clean).slice(1);

    return {
      chapter: {
        chapterNumber: ch,
        title: cleanTitle,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      },
      is404: false,
    };
  } catch (err) {
    return { chapter: null, is404: false };
  }
}

// Helper cào từng chương Webnovel
async function extractWebnovelChapter(
  cleanUrl: string,
  ch: number
): Promise<{ chapter: Chapter | null; is404: boolean; isLocked: boolean }> {
  const chUrl = `${cleanUrl}chuong-${ch}/`;
  try {
    const res = await fetchHtmlWithRetry(chUrl, 3, 300);
    if (res.statusCode === 404) {
      return { chapter: null, is404: true, isLocked: false };
    }
    if (!res.html) {
      return { chapter: null, is404: false, isLocked: false };
    }

    const chHtml = res.html;
    const startTag = '<div id="chapter-c">';
    const startIdx = chHtml.indexOf(startTag);
    if (startIdx === -1) {
      return { chapter: null, is404: false, isLocked: false };
    }

    const endIdx = chHtml.indexOf('</div>', startIdx);
    if (endIdx === -1) {
      return { chapter: null, is404: false, isLocked: false };
    }

    const rawText = chHtml.substring(startIdx + startTag.length, endIdx);
    if (rawText.includes('unlock__full') || rawText.includes('Mở chương')) {
      return { chapter: null, is404: false, isLocked: true };
    }

    const content = cleanHtmlText(rawText);
    if (content.length < 150) {
      return { chapter: null, is404: false, isLocked: false };
    }

    const chTitleMatch =
      chHtml.match(/<h[12][^>]*class="[^"]*chapter-title[^"]*"[^>]*>([^<]+)<\/h[12]>/i) ||
      chHtml.match(/<title>([^<]+)<\/title>/i);
    let chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;
    chTitle = chTitle.replace(/ - [^|]+$/i, '').replace(/ \| Webnovel.*$/i, '').trim();

    // Tách riêng chuỗi độc lập để V8 giải phóng toàn bộ chHtml gốc khỏi heap
    const cleanTitle = (' ' + chTitle).slice(1);
    const cleanContent = (' ' + content).slice(1);

    return {
      chapter: {
        chapterNumber: ch,
        title: cleanTitle,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      },
      is404: false,
      isLocked: false,
    };
  } catch (err) {
    return { chapter: null, is404: false, isLocked: false };
  }
}

// Helper cào từng chương TruyenFullMoi
async function extractTruyenfullmoiChapter(
  chapterBaseUrl: string,
  ch: number
): Promise<{ chapter: Chapter | null; is404: boolean }> {
  const chUrl = `${chapterBaseUrl}/chuong-${ch}.html`;
  try {
    const res = await fetchHtmlWithRetry(chUrl, 3, 300);
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 404 || !res.html) {
      return { chapter: null, is404: true };
    }

    const chHtml = res.html;
    const startTag = '<div id="chapter-c"';
    const startIdx = chHtml.indexOf(startTag);
    if (startIdx === -1) {
      return { chapter: null, is404: true };
    }

    const contentStart = chHtml.indexOf('>', startIdx) + 1;
    let endIdx = chHtml.indexOf('</div>', contentStart);
    if (endIdx === -1) {
      endIdx = chHtml.length;
    }

    let raw = chHtml.substring(contentStart, endIdx);

    // Lọc bỏ mã quảng cáo, script và định dạng lại văn bản
    raw = raw
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<ins[\s\S]*?<\/ins>/gi, '')
      .replace(/<div class="ads[\s\S]*?<\/div>/gi, '')
      .replace(/<\/(?:p|div|h\d)>/gi, '\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '');

    let text = decodeHtmlEntities(raw);
    if (text.includes('&')) text = decodeHtmlEntities(text);

    const paragraphs = text
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => {
        if (!p) return false;
        const lower = p.toLowerCase();
        if (lower.includes('adsbygoogle') || lower.includes('google-auto-placed')) return false;
        if (lower.includes('truyenfullmoi') || lower.includes('bạn đang đọc truyện')) return false;
        if (lower === 'trước' || lower === 'sau' || lower === 'đọc tiếp' || lower === 'về đầu trang') return false;
        return true;
      });

    const content = paragraphs.join('\n\n');
    if (content.length < 50) {
      return { chapter: null, is404: true };
    }

    const chTitleMatch =
      chHtml.match(/<span class="chapter-text"[^>]*>([^<]+)<\/span>/i) ||
      chHtml.match(/<a class="chapter-title"[^>]*title="([^"]+)"/i) ||
      chHtml.match(/<title>([^<]+)<\/title>/i);

    let chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;
    chTitle = chTitle.replace(/^.*?-\s*(Chương\s+\d+.*)$/i, '$1').replace(/\s*-\s*Truyện.*$/i, '').trim();

    // Tách riêng chuỗi độc lập để V8 giải phóng toàn bộ chHtml gốc khỏi heap
    const cleanTitle = (' ' + chTitle).slice(1);
    const cleanContent = (' ' + content).slice(1);

    return {
      chapter: {
        chapterNumber: ch,
        title: cleanTitle,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      },
      is404: false,
    };
  } catch (err) {
    return { chapter: null, is404: false };
  }
}

// POST /api/novels/admin/crawl-webnovel - Tự động cào truyện từ TruyenFullMoi, MeTruyenHot và Webnovel
router.post('/admin/crawl-webnovel', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { url, maxChapters, startChapter = 1, isFull: isFullFlag, overwrite } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Đường dẫn không hợp lệ. Vui lòng nhập link truyện.',
      });
    }

    const isWebnovel = url.includes('webnovel.vn');
    const isMetruyenhot = url.includes('metruyenhot');
    const isTruyenfullmoi = url.includes('truyenfullmoi');

    if (!isWebnovel && !isMetruyenhot && !isTruyenfullmoi) {
      return res.status(400).json({
        success: false,
        error: 'Hệ thống hiện hỗ trợ cào từ truyenfullmoi.net, metruyenhotvn.com và webnovel.vn.',
      });
    }

    let cleanUrl = url.trim().split('#')[0].split('?')[0];
    let chapterBaseUrl = '';

    if (isTruyenfullmoi) {
      if (cleanUrl.includes('/chuong-')) {
        chapterBaseUrl = cleanUrl.replace(/\/chuong-[\s\S]*$/, '');
      } else {
        chapterBaseUrl = cleanUrl.replace(/\/+$/, '').replace(/\.\d+$/, '');
      }

      // Nếu URL chưa có phần .[id] (ví dụ link chương), tự động lấy URL truyện đầy đủ
      if (!/\.\d+\/?$/.test(cleanUrl)) {
        const sampleChUrl = `${chapterBaseUrl}/chuong-1.html`;
        const chHtml = await fetchHtml(sampleChUrl);
        const matchStory = chHtml.match(/href="([^"]+\.\d+\/?)"/i);
        if (matchStory) {
          cleanUrl = matchStory[1];
        }
      }
      if (!cleanUrl.endsWith('/')) cleanUrl += '/';
    } else {
      if (!cleanUrl.endsWith('/')) cleanUrl += '/';
    }

    const mainHtml = await fetchHtml(cleanUrl);

    let detectedMax = 0;
    let title = '';
    let author = 'Đang cập nhật';
    let coverUrl = '';
    let description = '';
    let category: string[] = [];
    let novelStatus: 'Đang ra' | 'Hoàn thành' = 'Đang ra';
    const chapters: Chapter[] = [];

    if (isTruyenfullmoi) {
      // 1. Title
      const titleMatch =
        mainHtml.match(/<h3 class="title" itemprop="name">([^<]+)<\/h3>/i) ||
        mainHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
        mainHtml.match(/<meta property="og:title" content="([^"]+)"/i);
      title = titleMatch ? titleMatch[1].trim() : 'Truyện TruyenFullMoi';
      title = title.replace(/\s*\(FULL\)$/i, '').replace(/\s*-\s*Truyện.*$/i, '').trim();

      // 2. Author
      const authorMatch =
        mainHtml.match(/itemprop="author"[^>]*>([^<]+)<\/a>/i) ||
        mainHtml.match(/itemprop="author"[^>]*>([^<]+)<\/span>/i) ||
        mainHtml.match(/href="[^"]*\/tac-gia\/[^"]*"[^>]*>([^<]+)<\/a>/i);
      if (authorMatch) author = authorMatch[1].trim();

      // 3. Cover
      const imgMatch =
        mainHtml.match(/<div class="book">\s*<img[^>]+src="([^"]+)"/i) ||
        mainHtml.match(/<meta property="og:image" content="([^"]+)"/i);
      coverUrl = imgMatch ? imgMatch[1].trim() : '';

      // 4. Description
      const descMatch =
        mainHtml.match(/<div class="desc-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
        mainHtml.match(/<meta property="og:description" content="([^"]+)"/i);
      if (descMatch) {
        description = descMatch[1]
          .replace(/<[^>]+>/g, '\n')
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        description = decodeHtmlEntities(description);
      }

      // 5. Category
      const genreBlockMatch = mainHtml.match(/<h3>Thể loại:<\/h3>([\s\S]*?)<\/div>/i);
      if (genreBlockMatch) {
        const catList = [...genreBlockMatch[1].matchAll(/<a[^>]*>([^<]+)<\/a>/gi)].map((m) => m[1].trim());
        if (catList.length > 0) category = Array.from(new Set(catList));
      }
      if (category.length === 0) category = ['Ngôn Tình', 'Đô Thị', 'Tiên Hiệp'];

      // 6. Trạng thái truyện
      const statusMatch = mainHtml.match(/<h3>Trạng thái:<\/h3>\s*<span[^>]*>([^<]+)<\/span>/i);
      if (statusMatch && (statusMatch[1].toLowerCase().includes('full') || statusMatch[1].toLowerCase().includes('hoàn'))) {
        novelStatus = 'Hoàn thành';
      }

      // 7. Nhận diện số chương lớn nhất
      const pageMatches = [...mainHtml.matchAll(/\/trang-(\d+)\/#chapter-list/g)].map((m) => parseInt(m[1], 10));
      const maxPage = pageMatches.length > 0 ? Math.max(...pageMatches) : 1;
      const detectedMaxFromPages = maxPage > 1 ? maxPage * 50 : 0;
      const allNums = [...mainHtml.matchAll(/chuong-(\d+)/g)].map((m) => parseInt(m[1], 10));
      const detectedMaxFromLinks = allNums.length > 0 ? Math.max(...allNums) : 0;
      detectedMax = Math.max(detectedMaxFromPages, detectedMaxFromLinks);
    } else if (isMetruyenhot) {
      // Tự động nhận diện số chương lớn nhất tìm thấy trên trang chính
      const allNums = [...mainHtml.matchAll(/chuong-(\d+)/g)].map((m) => parseInt(m[1], 10));
      detectedMax = allNums.length > 0 ? Math.max(...allNums) : 0;

      // 1. Title
      const titleMatch =
        mainHtml.match(/<h1 class=title><a[^>]*>([^<]+)<\/a><\/h1>/i) ||
        mainHtml.match(/<meta property="og:title" content="([^"]+)"/i);
      title = titleMatch ? titleMatch[1].trim() : 'Truyện MeTruyenHot';
      title = title.replace(/\s*\(FULL\)$/i, '').trim();

      // 2. Author
      const authorMatch = mainHtml.match(/itemprop="author"[^>]*>([^<]+)<\/span>/i);
      if (authorMatch) author = authorMatch[1].trim();

      // 3. Cover
      const imgMatch =
        mainHtml.match(/data-src="([^"]+)"\s+alt="[^"]*"\s+class=lazyload/i) ||
        mainHtml.match(/<meta property="og:image:url" content="([^"]+)"/i);
      coverUrl = imgMatch ? imgMatch[1].trim() : '';

      // 4. Description
      const descMatch = mainHtml.match(/<p>Thông tin chi tiết:<\/p>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/i);
      description = descMatch ? descMatch[1] : '';
      description = decodeHtmlEntities(description.replace(/<[^>]+>/g, '\n').trim());

      // 5. Category
      const catMatches = [...mainHtml.matchAll(/itemprop=genre[^>]*>([^<]+)<\/span>/gi)].map((m) =>
        m[1].trim()
      );
      category = catMatches.length > 0 ? catMatches : ['Ngôn Tình', 'Đô Thị', 'Xuyên Không'];

      if (mainHtml.includes('(FULL)') || mainHtml.includes('Trạng thái: Hoàn thành')) {
        novelStatus = 'Hoàn thành';
      }
    } else {
      // Tự động nhận diện số chương lớn nhất tìm thấy trên trang chính
      const allNums = [...mainHtml.matchAll(/chuong-(\d+)/g)].map((m) => parseInt(m[1], 10));
      detectedMax = allNums.length > 0 ? Math.max(...allNums) : 0;

      // 1. Title
      const ogTitleMatch = mainHtml.match(/<meta property="og:title" content="([^"]+)"/i);
      title = ogTitleMatch ? ogTitleMatch[1] : '';
      title = title
        .replace(/ bản quyền.*$/i, '')
        .replace(/ - Tác giả:.*$/i, '')
        .replace(/ - Webnovel.*$/i, '')
        .replace(/^Truyện\s+/i, '')
        .trim();

      if (!title) {
        const h1Match = mainHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        title = h1Match ? h1Match[1].trim() : 'Truyện Xuyên Không';
      }

      // 2. Author
      const authorMatch = mainHtml.match(/href="[^"]*\/tac-gia\/[^"]*"[^>]*>([^<]+)<\/a>/i);
      if (authorMatch) {
        author = authorMatch[1].trim();
      } else {
        const descAuthorMatch = mainHtml.match(/Tác giả:\s*([^<\-]+)/i);
        if (descAuthorMatch) author = descAuthorMatch[1].trim();
      }

      // 3. Cover
      const ogImgMatch = mainHtml.match(/<meta property="og:image" content="([^"]+)"/i);
      coverUrl = ogImgMatch ? ogImgMatch[1] : '';

      // 4. Description
      const ogDescMatch = mainHtml.match(/<meta property="og:description" content="([^"]+)"/i);
      description = ogDescMatch ? ogDescMatch[1].trim() : '';

      // 5. Category
      const catMatches = [
        ...mainHtml.matchAll(
          /class="[^"]*badge[^"]*"[^>]*href="https:\/\/webnovel\.vn\/([^\/"]+)\/"[^>]*>([^<]+)<\/a>/gi
        ),
      ];
      category = catMatches.map((m) => m[2].trim());
      if (category.length === 0) category = ['Xuyên Không', 'Tiên Hiệp'];
    }

    // Kiểm tra truyện đã có trong DB chưa
    const slug = generateSlug(title);
    const existingNovels = db.getNovels();
    const existingNovel = existingNovels.find(
      (n) => (slug && n.slug === slug) || (title && n.title.toLowerCase().trim() === title.toLowerCase().trim())
    );

    const isFull = isFullFlag === true || maxChapters === 'all' || maxChapters === 'full' || parseInt(maxChapters, 10) >= 999;
    let start = Math.max(parseInt(startChapter, 10) || 1, 1);

    // Nếu truyện đã có một số chương và người dùng chọn Full bộ (và KHÔNG chọn ghi đè chương cũ)
    // Tự động bắt đầu từ chương tiếp theo để cào bổ sung cực nhanh!
    if (
      !overwrite &&
      isFull &&
      parseInt(startChapter, 10) === 1 &&
      existingNovel &&
      existingNovel.chapters &&
      existingNovel.chapters.length > 0
    ) {
      const maxExisting = existingNovel.chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0);
      if (maxExisting > 0) {
        start = maxExisting + 1;
      }
    }

    const limit = Math.min(Math.max(parseInt(maxChapters, 10) || 50, 1), 60);
    const targetEnd = start + limit - 1;

    let reachedEnd = false;

    if (isTruyenfullmoi) {
      // Crawl Truyenfullmoi theo batches đồng thời 4 request
      const concurrency = 4;
      let currentCh = start;
      let consecutive404Count = 0;

      while (!reachedEnd && currentCh <= targetEnd) {
        const batchNums: number[] = [];
        for (let i = 0; i < concurrency && currentCh + i <= targetEnd; i++) {
          batchNums.push(currentCh + i);
        }

        const results = await Promise.all(
          batchNums.map((num) => extractTruyenfullmoiChapter(chapterBaseUrl, num))
        );

        for (const r of results) {
          if (r.chapter) {
            chapters.push(r.chapter);
            consecutive404Count = 0;
          } else if (r.is404) {
            consecutive404Count++;
            if (consecutive404Count >= 2) {
              reachedEnd = true;
              break;
            }
          }
        }

        currentCh += concurrency;
      }
    } else if (isMetruyenhot) {
      // Crawl MeTruyenHot theo batches đồng thời 4 request
      const concurrency = 4;
      let currentCh = start;
      let consecutive404Count = 0;

      while (!reachedEnd && currentCh <= targetEnd) {
        const batchNums: number[] = [];
        for (let i = 0; i < concurrency && currentCh + i <= targetEnd; i++) {
          batchNums.push(currentCh + i);
        }

        const results = await Promise.all(
          batchNums.map((num) => extractMetruyenhotChapter(cleanUrl, num))
        );

        for (const r of results) {
          if (r.chapter) {
            chapters.push(r.chapter);
            consecutive404Count = 0;
          } else if (r.is404) {
            consecutive404Count++;
            if (consecutive404Count >= 3) {
              reachedEnd = true;
              break;
            }
          }
        }

        currentCh += concurrency;
      }
    } else {
      // Crawl Webnovel.vn theo batches đồng thời 3 request
      const concurrency = 3;
      let currentCh = start;
      let consecutive404Count = 0;

      while (!reachedEnd && currentCh <= targetEnd) {
        const batchNums: number[] = [];
        for (let i = 0; i < concurrency && currentCh + i <= targetEnd; i++) {
          batchNums.push(currentCh + i);
        }

        const results = await Promise.all(
          batchNums.map((num) => extractWebnovelChapter(cleanUrl, num))
        );

        for (const r of results) {
          if (r.chapter) {
            chapters.push(r.chapter);
            consecutive404Count = 0;
          } else if (r.isLocked) {
            reachedEnd = true;
            break;
          } else if (r.is404) {
            consecutive404Count++;
            if (consecutive404Count >= 3) {
              reachedEnd = true;
              break;
            }
          }
        }

        currentCh += concurrency;
      }
    }

    if (chapters.length === 0) {
      if (existingNovel && existingNovel.chapters && existingNovel.chapters.length > 0) {
        return res.json({
          success: true,
          message: `Bộ truyện "${title}" đã có đủ tất cả các chương hiện hành (tổng cộng ${existingNovel.chapters.length} chương)!`,
          data: {
            id: existingNovel.id,
            title: existingNovel.title,
            slug: existingNovel.slug,
          },
          chapterCount: 0,
          totalChapters: existingNovel.chapters.length,
          detectedMax: Math.max(detectedMax, existingNovel.chapters.length),
          reachedEnd: true,
          nextStartChapter: existingNovel.chapters.length + 1,
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Không thể cào chương từ đường link này hoặc truyện đã bị khóa.',
      });
    }

    let novel;
    if (existingNovel) {
      // Ghép nối hoặc ghi đè các chương vào truyện đã có
      const chapterMap = new Map<number, Chapter>();
      (existingNovel.chapters || []).forEach((c) => chapterMap.set(c.chapterNumber, c));
      chapters.forEach((c) => chapterMap.set(c.chapterNumber, c));

      const mergedChapters = Array.from(chapterMap.values()).sort(
        (a, b) => a.chapterNumber - b.chapterNumber
      );

      novel = db.updateNovel(existingNovel.id, {
        author: author && author !== 'Đang cập nhật' ? author : existingNovel.author,
        coverUrl: coverUrl || existingNovel.coverUrl,
        description: description || existingNovel.description,
        category: category.length > 0 ? category : existingNovel.category,
        sourceUrl: cleanUrl,
        chapters: mergedChapters,
      });
    } else {
      // Tạo truyện mới
      novel = db.createNovel({
        title,
        author,
        category,
        coverUrl,
        description,
        sourceUrl: cleanUrl,
        status: novelStatus,
        chapters,
      });
    }

    const totalCount = novel?.chapters ? novel.chapters.length : chapters.length;
    const isReachedEnd = reachedEnd || chapters.length < limit;

    // Kích hoạt V8 Garbage Collection giải phóng bộ nhớ ngay nếu có flag --expose-gc
    if ((global as any).gc) {
      try {
        (global as any).gc();
      } catch (e) {}
    }

    const maxCrawledNumber = chapters.length > 0
      ? chapters.reduce((max, c) => Math.max(max, c.chapterNumber), start)
      : start + limit - 1;
    const nextStartChapter = maxCrawledNumber + 1;

    res.json({
      success: true,
      message: existingNovel
        ? `Đã cào bổ sung thêm ${chapters.length} chương mới cho bộ "${title}"! (Hiện có tổng cộng: ${totalCount} chương)`
        : `Đã cào thành công "${title}" với ${chapters.length} chương!`,
      data: {
        id: novel?.id,
        title: novel?.title,
        slug: novel?.slug,
      },
      chapterCount: chapters.length,
      totalChapters: totalCount,
      detectedMax: Math.max(detectedMax, totalCount),
      reachedEnd: isReachedEnd,
      nextStartChapter: nextStartChapter,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/novels/admin/export - Tải toàn bộ truyện và chương về file JSON
router.get('/admin/export', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const novels = db.getNovels();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=phimhay247_truyen_${new Date().toISOString().slice(0, 10)}.json`
    );
    res.send(JSON.stringify(novels));
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/novels/admin/import - Khôi phục toàn bộ truyện từ file JSON
router.post('/admin/import', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const list = Array.isArray(req.body.novels)
      ? req.body.novels
      : Array.isArray(req.body)
      ? req.body
      : null;

    if (!list) {
      return res.status(400).json({
        success: false,
        error: 'File JSON không đúng định dạng danh sách truyện.',
      });
    }

    const ok = db.importNovels(list);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Lỗi khi nhập dữ liệu truyện.' });
    }

    res.json({
      success: true,
      message: `Đã khôi phục thành công ${list.length} bộ truyện kèm đầy đủ các chương!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
