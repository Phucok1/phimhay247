import { Router, Request, Response } from 'express';
import https from 'https';
import { db, Chapter } from '../services/database.js';

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

// POST /api/novels/admin/crawl-webnovel - Tự động cào truyện từ Webnovel.vn và MeTruyenHot
router.post('/admin/crawl-webnovel', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { url, maxChapters } = req.body;
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

    const limit = Math.min(Math.max(parseInt(maxChapters, 10) || 20, 1), 100);

    const mainHtml = await fetchHtml(cleanUrl);

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

      // 6. Crawl chapters
      for (let ch = 1; ch <= limit; ch++) {
        const chUrl = `${cleanUrl}chuong-${ch}/`;
        try {
          const chHtml = await fetchHtml(chUrl);
          const chapterTag = 'class="book-list full-story content chapter-c"';
          const startIdx = chHtml.indexOf(chapterTag);
          if (startIdx === -1) break;

          const contentStart = chHtml.indexOf('>', startIdx) + 1;
          const endIdx = chHtml.indexOf('</div>', contentStart);
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
          if (clean.length < 200) break;

          const chTitleMatch = chHtml.match(
            /<div class=rv-chapt-title><h2><a[^>]*>([^<]+)<\/a><\/h2><\/div>/i
          );
          const chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;

          chapters.push({
            id: `ch-${Date.now()}-${ch}`,
            novelId: '',
            chapterNumber: ch,
            title: chTitle,
            content: clean,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          break;
        }
      }
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

      // 6. Crawl chapters
      for (let ch = 1; ch <= limit; ch++) {
        const chUrl = `${cleanUrl}chuong-${ch}/`;
        try {
          const chHtml = await fetchHtml(chUrl);
          const startTag = '<div id="chapter-c">';
          const startIdx = chHtml.indexOf(startTag);
          if (startIdx === -1) break;

          const endIdx = chHtml.indexOf('</div>', startIdx);
          const rawText = chHtml.substring(startIdx + startTag.length, endIdx);

          if (rawText.includes('unlock__full') || rawText.includes('Mở chương')) {
            break;
          }

          const content = cleanHtmlText(rawText);
          if (content.length < 250) break;

          const chTitleMatch =
            chHtml.match(/<h[12][^>]*class="[^"]*chapter-title[^"]*"[^>]*>([^<]+)<\/h[12]>/i) ||
            chHtml.match(/<title>([^<]+)<\/title>/i);
          let chTitle = chTitleMatch ? chTitleMatch[1].trim() : `Chương ${ch}`;
          chTitle = chTitle.replace(/ - [^|]+$/i, '').replace(/ \| Webnovel.*$/i, '').trim();

          chapters.push({
            id: `ch-${Date.now()}-${ch}`,
            novelId: '',
            chapterNumber: ch,
            title: chTitle,
            content,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          break;
        }
      }
    }

    if (chapters.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Không thể cào chương từ đường link này hoặc truyện đã bị khóa.',
      });
    }

    // Lưu vào Database
    const novel = db.createNovel({
      title,
      author,
      category,
      coverUrl,
      description,
      status: 'Đang ra',
      chapters,
    });

    res.json({
      success: true,
      message: `Đã cào thành công bộ truyện "${title}" với ${chapters.length} chương!`,
      data: novel,
      chapterCount: chapters.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
