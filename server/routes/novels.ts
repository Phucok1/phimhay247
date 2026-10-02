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
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
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
router.get('/:slug/chapters/:chapterNumber', (req: Request, res: Response) => {
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
        chapter: currentChapter,
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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&agrave;/gi, 'à').replace(/&aacute;/gi, 'á').replace(/&acirc;/gi, 'â').replace(/&atilde;/gi, 'ã').replace(/&egrave;/gi, 'è').replace(/&eacute;/gi, 'é')
    .replace(/&ecirc;/gi, 'ê').replace(/&igrave;/gi, 'ì').replace(/&iacute;/gi, 'í').replace(/&ograve;/gi, 'ò').replace(/&oacute;/gi, 'ó').replace(/&ocirc;/gi, 'ô')
    .replace(/&otilde;/gi, 'õ').replace(/&ugrave;/gi, 'ù').replace(/&uacute;/gi, 'ú').replace(/&yacute;/gi, 'ý').replace(/&Agrave;/gi, 'À').replace(/&Aacute;/gi, 'Á')
    .replace(/&Egrave;/gi, 'È').replace(/&Eacute;/gi, 'É').replace(/&Igrave;/gi, 'Ì').replace(/&Iacute;/gi, 'Í').replace(/&Ograve;/gi, 'Ò').replace(/&Oacute;/gi, 'Ó')
    .replace(/&Ugrave;/gi, 'Ù').replace(/&Uacute;/gi, 'Ú').replace(/&Yacute;/gi, 'Ý').replace(/&quot;/gi, '"').replace(/&ldquo;/gi, '“').replace(/&rdquo;/gi, '”')
    .replace(/&lsquo;/gi, '‘').replace(/&rsquo;/gi, '’').replace(/&hellip;/gi, '...').replace(/&dagger;/gi, 't').replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
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

// Helper cào từng chương MeTruyenHot (có retry và kiểm tra 404 chuẩn xác)
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
    const startIdx = chHtml.indexOf(chapterTag);
    if (startIdx === -1) {
      return { chapter: null, is404: false };
    }

    const contentStart = chHtml.indexOf('>', startIdx) + 1;
    const endIdx = chHtml.indexOf('</div>', contentStart);
    if (endIdx === -1) {
      return { chapter: null, is404: false };
    }

    let raw = chHtml.substring(contentStart, endIdx);

    const attrSentences = [
      ...raw.matchAll(
        /<p[^>]+(?:gubhskjlwm|swhfjquylk|thoxqrfwyj|vzxpnuramd|oncopy)="([^"]+)"/gi
      ),
    ].map((m) => m[1]);

    raw = raw.replace(/<p class="ms-k">[\s\S]*?<\/p>/gi, '');
    raw = raw.replace(/<div id="content-metruyenhot"><\/div>/gi, '');
    let clean = raw.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n\n').replace(/<br\s*[\/]?>/gi, '\n');
    clean = decodeHtmlEntities(clean);

    if (attrSentences.length > 0) {
      clean += '\n\n' + attrSentences.map((s) => decodeHtmlEntities(s.trim())).join('\n\n');
    }
    clean = clean.trim();
    if (clean.length < 100) {
      return { chapter: null, is404: false };
    }

    const chTitleMatch = chHtml.match(
      /<div class=rv-chapt-title><h2><a[^>]*>([^<]+)<\/a><\/h2><\/div>/i
    );
    const chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;

    return {
      chapter: {
        chapterNumber: ch,
        title: chTitle,
        content: clean,
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

    return {
      chapter: {
        chapterNumber: ch,
        title: chTitle,
        content,
        createdAt: new Date().toISOString(),
      },
      is404: false,
      isLocked: false,
    };
  } catch (err) {
    return { chapter: null, is404: false, isLocked: false };
  }
}

// POST /api/novels/admin/crawl-webnovel - Tự động cào truyện từ Webnovel.vn và MeTruyenHot
router.post('/admin/crawl-webnovel', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { url, maxChapters, startChapter = 1 } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Đường dẫn không hợp lệ. Vui lòng nhập link truyện.',
      });
    }

    const isWebnovel = url.includes('webnovel.vn');
    const isMetruyenhot = url.includes('metruyenhot');

    if (!isWebnovel && !isMetruyenhot) {
      return res.status(400).json({
        success: false,
        error: 'Hệ thống hiện hỗ trợ cào từ webnovel.vn và metruyenhotvn.com.',
      });
    }

    let cleanUrl = url.trim().split('#')[0].split('?')[0];
    if (!cleanUrl.endsWith('/')) cleanUrl += '/';

    const mainHtml = await fetchHtml(cleanUrl);

    // Tự động nhận diện số chương lớn nhất tìm thấy trên trang chính
    const allNums = [...mainHtml.matchAll(/chuong-(\d+)/g)].map((m) => parseInt(m[1], 10));
    const detectedMax = allNums.length > 0 ? Math.max(...allNums) : 0;

    let title = '';
    let author = 'Đang cập nhật';
    let coverUrl = '';
    let description = '';
    let category: string[] = [];
    const chapters: Chapter[] = [];

    if (isMetruyenhot) {
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
    } else {
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

    const isFull = maxChapters === 'all' || maxChapters === 'full' || parseInt(maxChapters, 10) >= 999;
    let start = Math.max(parseInt(startChapter, 10) || 1, 1);

    // Nếu truyện đã có một số chương và người dùng chọn Full bộ (hoặc không nhập startChapter cụ thể > 1)
    // Tự động bắt đầu từ chương tiếp theo để cào bổ sung cực nhanh!
    if (
      isFull &&
      (!req.body.startChapter || parseInt(req.body.startChapter, 10) === 1) &&
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
    const targetEnd = (detectedMax > 0 && isFull) ? Math.min(start + limit - 1, detectedMax) : start + limit - 1;

    // Nếu truyện đã cào đủ hết các chương
    if (detectedMax > 0 && start > detectedMax && existingNovel && existingNovel.chapters && existingNovel.chapters.length >= detectedMax) {
      return res.json({
        success: true,
        message: `Bộ truyện "${title}" đã có đủ toàn bộ ${existingNovel.chapters.length} chương!`,
        data: existingNovel,
        chapterCount: 0,
        totalChapters: existingNovel.chapters.length,
        detectedMax: detectedMax,
        reachedEnd: true,
        nextStartChapter: existingNovel.chapters.length + 1,
      });
    }

    if (isMetruyenhot) {
      // Crawl MeTruyenHot theo batches đồng thời 6 request
      const concurrency = 6;
      let reachedEnd = false;
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
            if ((detectedMax > 0 && currentCh >= detectedMax) || consecutive404Count >= 2) {
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
      let reachedEnd = false;
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
            if (consecutive404Count >= 2) {
              reachedEnd = true;
              break;
            }
          }
        }

        currentCh += concurrency;
      }
    }

    if (chapters.length === 0 && (!existingNovel || !existingNovel.chapters || existingNovel.chapters.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Không thể cào chương từ đường link này hoặc truyện đã bị khóa.',
      });
    }

    let novel;
    if (existingNovel) {
      // Ghép nối các chương mới vào truyện đã có
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
        status: 'Đang ra',
        chapters,
      });
    }

    const totalCount = novel?.chapters ? novel.chapters.length : chapters.length;
    const isReachedEnd =
      reachedEnd ||
      chapters.length < limit ||
      (detectedMax > 0 && totalCount >= detectedMax);

    res.json({
      success: true,
      message: existingNovel
        ? `Đã cào bổ sung thêm ${chapters.length} chương mới cho bộ "${title}"! (Hiện có tổng cộng: ${totalCount} chương)`
        : `Đã cào thành công "${title}" với ${chapters.length} chương!`,
      data: novel,
      chapterCount: chapters.length,
      totalChapters: totalCount,
      detectedMax: detectedMax || totalCount,
      reachedEnd: isReachedEnd,
      nextStartChapter: totalCount + 1,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
